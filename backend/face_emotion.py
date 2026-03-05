from deepface import DeepFace
import cv2
import json
import os

# ─── Download face model from HuggingFace at import time ───
try:
    from huggingface_hub import hf_hub_download
    FACE_MODEL_PATH = hf_hub_download(
        repo_id="ritesh19180/maitri-emotion-models",
        filename="facial_expression_model_weights.h5"
    )
    # Place it where DeepFace expects it
    deepface_dir = os.path.join(os.path.expanduser("~"), ".deepface", "weights")
    os.makedirs(deepface_dir, exist_ok=True)
    target = os.path.join(deepface_dir, "facial_expression_model_weights.h5")
    if not os.path.exists(target):
        import shutil
        shutil.copy2(FACE_MODEL_PATH, target)
    print("[MAITRI] Face emotion model cached from HuggingFace ✓")
except Exception as e:
    print(f"[MAITRI] HuggingFace model download skipped (using local): {e}")

def detect_face_emotion(frame=None):
    """
    Analyzes a single frame for facial emotions using DeepFace.
    If no frame is provided, captures from webcam.
    Returns the dominant emotion.
    """
    try:
        if frame is None:
            cap = cv2.VideoCapture(0)
            ret, frame = cap.read()
            cap.release()
            if not ret:
                return {"emotion": "neutral", "error": "Could not capture frame"}

        analysis = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
        
        if analysis:
            dominant_emotion = analysis[0]['dominant_emotion']
            return {"emotion": dominant_emotion}
            
    except Exception as e:
        print(f"Error in detection: {e}")
        return {"emotion": "neutral"}
    
    return {"emotion": "neutral"}

class FaceEmotionDetector:
    def __init__(self):
        # Model is pre-cached at import time via huggingface_hub
        pass

    def analyze(self, frame):
        return detect_face_emotion(frame)

if __name__ == "__main__":
    # Real-time webcam test loop
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Could not open webcam.")
    else:
        print("Starting real-time facial emotion detection... Press 'q' to quit.")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            result = detect_face_emotion(frame)
            emotion = result["emotion"]
            
            cv2.putText(frame, f"Emotion: {emotion}", (50, 50), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            
            cv2.imshow('MAITRI - Face Emotion Test', frame)
            print(json.dumps(result))
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
        cap.release()
        cv2.destroyAllWindows()
