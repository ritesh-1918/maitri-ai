def calculate_stress(face_emotion, speech_emotion):
    """
    Fuses face and speech emotions to determine stress level.
    Rules:
    - Angry OR Fear -> High Stress
    - Sad -> Medium Stress
    - Happy -> Low Stress
    - Neutral -> Normal
    """
    # Normalize inputs to lowercase
    face = face_emotion.lower() if face_emotion else ""
    speech = speech_emotion.lower() if speech_emotion else ""
    
    # Priority 1: High Stress
    if face in ["angry", "fear"] or speech in ["angry", "fear"]:
        stress_level = "High Stress"
    # Priority 2: Medium Stress
    elif face == "sad" or speech == "sad":
        stress_level = "Medium Stress"
    # Priority 3: Low Stress
    elif face == "happy" or speech == "happy":
        stress_level = "Low Stress"
    # Priority 4: Normal
    else:
        stress_level = "Normal"
        
    return {
        "face_emotion": face_emotion,
        "speech_emotion": speech_emotion,
        "stress_level": stress_level
    }

class FusionEngine:
    def __init__(self):
        pass

    def fuse(self, face_results, speech_results):
        face_emotion = face_results.get("emotion", "neutral")
        speech_emotion = speech_results.get("emotion", "neutral")
        
        return calculate_stress(face_emotion, speech_emotion)

if __name__ == "__main__":
    # Standalone test
    test_cases = [
        ("angry", "neutral"),
        ("neutral", "fear"),
        ("sad", "happy"),
        ("happy", "happy"),
        ("neutral", "neutral")
    ]
    
    print("MAITRI Stress Analysis Test")
    print("---------------------------")
    for face, speech in test_cases:
        result = calculate_stress(face, speech)
        print(f"Face: {face:8} | Speech: {speech:8} | Result: {result['stress_level']}")
