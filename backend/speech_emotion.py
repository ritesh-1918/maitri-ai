import numpy as np
from utils.audio_features import extract_pitch_and_intensity

class SpeechEmotionDetector:
    def __init__(self):
        pass

    def analyze(self, audio_file):
        try:
            features = extract_pitch_and_intensity(audio_file)
            pitch = features.get("pitch", 0)
            intensity = features.get("intensity", 0)

            # Heuristic-based mapping as a baseline
            # Higher pitch and intensity often correlate with excitement/anger
            if intensity > 0.05:
                if pitch > 200:
                    emotion = "happy/excited"
                else:
                    emotion = "angry/stressed"
            else:
                emotion = "calm/neutral"

            return {
                "emotion": emotion,
                "features": features,
                "success": True
            }
        except Exception as e:
            return {"emotion": "unknown", "error": str(e), "success": False}
