import cv2
import time
import numpy as np
from collections import deque
from deepface import DeepFace

# ─── Initialize Models at Startup ───
print("[MAITRI] Initializing DeepFace models (RetinaFace + Emotion)...")
try:
    _dummy_img = np.zeros((480, 640, 3), dtype=np.uint8)
    DeepFace.analyze(_dummy_img, actions=['emotion'], detector_backend='retinaface', enforce_detection=False)
    print("[MAITRI] Models loaded successfully ✓")
except Exception as e:
    print(f"[MAITRI] Warning during model initialization: {e}")

# ─── Temporal Smoothing Buffer ───
# Why temporal smoothing is used for facial emotion:
# Raw frame-by-frame emotion detection is highly volatile due to micro-expressions, blinks, and sensor noise.
# A moving average (smoothing) stabilizes predictions, preventing rapid UI flickering and false emotional spikes.
# Keep the last 20 valid probability dictionaries
history_buffer = deque(maxlen=20)

def preprocess_frame(frame):
    """
    Video Preprocessing Improvements:
    1. Resize to 640x480 happens in detect_face_emotion before this.
    2. Convert from BGR to RGB.
    3. Apply CLAHE on luminance channel.
    4. Apply Gaussian blur (kernel 3x3) to reduce sensor noise.
    5. Normalize pixel values to range 0-1.
    """
    # 2. Convert from BGR to RGB
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # 3. Apply CLAHE histogram equalization on the luminance channel
    lab = cv2.cvtColor(rgb_frame, cv2.COLOR_RGB2LAB)
    l_channel, a, b = cv2.split(lab)
    
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    cl = clahe.apply(l_channel)
    
    limg = cv2.merge((cl, a, b))
    enhanced_rgb = cv2.cvtColor(limg, cv2.COLOR_LAB2RGB)
    
    # 4. Apply slight Gaussian blur (kernel 3x3)
    blurred = cv2.GaussianBlur(enhanced_rgb, (3, 3), 0)
    
    # 5. Normalize pixel values to range 0-1
    normalized = blurred.astype(np.float32) / 255.0
    
    return normalized

def get_derived_emotion(probs):
    """
    Derived Emotion Layer
    Converts base emotions into richer descriptions.
    """
    happy = probs.get("happy", 0)
    surprise = probs.get("surprise", 0)
    neutral = probs.get("neutral", 0)
    sad = probs.get("sad", 0)
    angry = probs.get("angry", 0)

    if happy > 0.6 and surprise > 0.2:
        return "laughing"
    if happy > 0.5 and neutral < 0.2:
        return "excited"
    if neutral > 0.6 and sad > 0.2:
        return "tired"
    if sad > 0.5:
        return "down"
    if angry > 0.6:
        return "frustrated"
        
    return ""

def detect_face_emotion(frame=None):
    """
    Analyzes a single frame for facial emotions using DeepFace probabilities with RetinaFace.
    Includes temporal smoothing and derived emotion mapping.
    """
    global history_buffer
    
    start_time = time.time()
    
    try:
        # Fallback if no frame is provided
        if frame is None:
            cap = cv2.VideoCapture(0)
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            ret, frame = cap.read()
            cap.release()
            if not ret:
                return _fallback_response("Could not capture frame")
        
        # 1. Capture/Ensure resolution 640x480
        if frame.shape[:2] != (480, 640):
            frame = cv2.resize(frame, (640, 480))
            
        preprocessed_img = preprocess_frame(frame)
        # DeepFace analyze usually processes inputs in 0-255 uint8 range for its pipeline
        # particularly since RetinaFace underlying models assume BGR or RGB 255 images
        img_for_deepface = (preprocessed_img * 255.0).astype(np.uint8)
        
        # Log preprocessing latency
        preprocess_time = (time.time() - start_time) * 1000
        if preprocess_time > 100:
            print(f"[MAITRI Temp]: Preprocessing delayed: {preprocess_time:.2f} ms")
        
        # Face Detection: DeepFace with RetinaFace backend
        analysis = DeepFace.analyze(
            img_for_deepface,
            actions=['emotion'],
            detector_backend='retinaface',
            enforce_detection=False
        )
        
        if not analysis:
            return _fallback_response("Analysis failed")
            
        if isinstance(analysis, list):
            analysis = analysis[0]
            
        probs = analysis.get('emotion', {})
        
        # Convert DeepFace out-of-100 probabilities to 0-1 range, ensuring native Python floats
        normalized_probs = {k: float(v) / 100.0 for k, v in probs.items()}
        
        # Temporal Smoothing: Store last 20 and compute mean
        history_buffer.append(normalized_probs)
        
        smoothed_probs = {}
        base_emotions = ["happy", "neutral", "sad", "angry", "fear", "surprise", "disgust"]
        for em in base_emotions:
            smoothed_probs[em] = sum(b.get(em, 0.0) for b in history_buffer) / len(history_buffer)
            
        # Final dominant emotion = highest averaged probability
        dominant = max(smoothed_probs, key=smoothed_probs.get)
        
        # Derived Emotion Layer
        derived = get_derived_emotion(smoothed_probs)
        
        # Calculate total latency
        total_latency_ms = (time.time() - start_time) * 1000
        if total_latency_ms > 100:
            pass  # Warning logic or analytics can be plugged here
            
        return {
            "dominant_emotion": dominant,
            "derived_emotion": derived,
            "emotion_probabilities": smoothed_probs
        }
        
    except Exception as e:
        print(f"Error in detection: {e}")
        return _fallback_response()

def _fallback_response(msg=None):
    if msg:
        print(f"[MAITRI Face] {msg}")
    return {
        "dominant_emotion": "neutral",
        "derived_emotion": "",
        "emotion_probabilities": {
            "happy": 0.0, "neutral": 1.0, "sad": 0.0, 
            "angry": 0.0, "fear": 0.0, "surprise": 0.0, "disgust": 0.0
        }
    }

class FaceEmotionDetector:
    def __init__(self):
        global history_buffer
        history_buffer.clear()

    def analyze(self, frame):
        return detect_face_emotion(frame)

if __name__ == "__main__":
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 15)  # Enforce 15 FPS hardware setting where possible
    
    if not cap.isOpened():
        print("Error: Could not open webcam.")
    else:
        print("Starting upgraded face emotion detection pipeline... Press 'q' to quit.")
        
        target_fps = 15
        target_frame_time = 1.0 / target_fps
        import time
        
        while True:
            loop_start = time.time()
            ret, frame = cap.read()
            if not ret:
                break
                
            result = detect_face_emotion(frame)
            dom_emotion = result["dominant_emotion"]
            der_emotion = result["derived_emotion"]
            probs = result["emotion_probabilities"]
            
            # Display dominant emotion
            display_text = f"Dom: {dom_emotion}"
            if der_emotion:
                display_text += f" | Derived: {der_emotion}"
                
            cv2.putText(frame, display_text, (20, 40), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
                        
            # Draw probability bars
            y_offset = 80
            for em, val in sorted(probs.items(), key=lambda x: x[1], reverse=True)[:4]:
                bar_len = int(val * 200)
                cv2.rectangle(frame, (20, y_offset-10), (20+bar_len, y_offset+5), (255,100,0), -1)
                cv2.putText(frame, f"{em}: {val:.2f}", (20+210, y_offset+3), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
                y_offset += 30
            
            cv2.imshow('MAITRI - Face Emotion Test', frame)
            
            elapsed_time = time.time() - loop_start
            wait_time_ms = max(1, int((target_frame_time - elapsed_time) * 1000))
            
            if cv2.waitKey(wait_time_ms) & 0xFF == ord('q'):
                break
                
        cap.release()
        cv2.destroyAllWindows()
