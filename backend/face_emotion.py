from deepface import DeepFace
import cv2
import json

def detect_face_emotion(frame):
    """
    Analyzes a single frame for facial emotions using DeepFace.
    Returns the dominant emotion.
    """
    try:
        # Analyze the frame for emotions
        # enforce_detection=False prevents crashing if no face is visible
        analysis = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
        
        if analysis:
            # DeepFace returns a list (for multiple faces), take the first one
            dominant_emotion = analysis[0]['dominant_emotion']
            return {"emotion": dominant_emotion}
            
    except Exception as e:
        print(f"Error in detection: {e}")
        return {"emotion": "neutral"}
    
    return {"emotion": "neutral"}

class FaceEmotionDetector:
    def __init__(self):
        # Model is loaded lazily by DeepFace
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
            
            # Detect emotion
            result = detect_face_emotion(frame)
            emotion = result["emotion"]
            
            # Display result on frame
            cv2.putText(frame, f"Emotion: {emotion}", (50, 50), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            
            cv2.imshow('MAITRI - Face Emotion Test', frame)
            
            # Print JSON format to console
            print(json.dumps(result))
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
        cap.release()
        cv2.destroyAllWindows()
