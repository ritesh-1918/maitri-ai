class FusionEngine:
    def __init__(self):
        pass

    def fuse(self, face_results, speech_results):
        face_emotion = face_results.get("emotion", "neutral")
        speech_emotion = speech_results.get("emotion", "neutral")
        
        # Simple weighted fusion or mapping
        stress_score = 0
        if face_emotion in ["angry", "fear", "sad"]: stress_score += 50
        if "stressed" in speech_emotion or "angry" in speech_emotion: stress_score += 50
        
        well_being_index = 100 - stress_score
        
        return {
            "fused_emotion": face_emotion if face_emotion != "neutral" else speech_emotion,
            "stress_level": "high" if stress_score >= 75 else "medium" if stress_score >= 40 else "low",
            "well_being_score": well_being_index
        }
