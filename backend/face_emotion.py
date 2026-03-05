from deepface import DeepFace
import cv2
import numpy as np

class FaceEmotionDetector:
    def __init__(self):
        # The model is loaded lazily by DeepFace on first analyze call
        # but we pre-loaded it in download_models.py
        pass

    def analyze(self, frame):
        try:
            # DeepFace expectations: BGR image
            results = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
            if results:
                # results is a list of dicts for each face detected
                primary_face = results[0]
                return {
                    "emotion": primary_face['dominant_emotion'],
                    "emotion_scores": primary_face['emotion'],
                    "success": True
                }
        except Exception as e:
            return {"emotion": "unknown", "error": str(e), "success": False}
        return {"emotion": "neutral", "success": True}
