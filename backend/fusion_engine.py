def _get_intensity(probs_or_dominant):
    """
    Returns the computed emotional intensity.
    If a probability distribution is provided, computes: Σ(probability * intensity_weight).
    If only a dominant emotion string is provided (fallback), uses standard mapping weight * 1.0.
    """
    # Keep original mapping
    intensity_weights = {
        "happy": 0.1,
        "neutral": 0.3,
        "sad": 0.6,
        "fear": 0.8,
        "angry": 0.9,
        "unknown": 0.3 # Fallback
    }
    
    if isinstance(probs_or_dominant, dict):
        score = sum(prob * intensity_weights.get(em.lower(), 0.3) for em, prob in probs_or_dominant.items())
        return score
    elif isinstance(probs_or_dominant, str):
        return intensity_weights.get(probs_or_dominant.lower(), 0.3)
    return 0.3

def _get_derived_state(face_probs, speech_probs, combined_dominant):
    """
    Derived Emotional Descriptions
    Rules based on combined / generalized input. Assuming we take the max of both modalities for safety.
    """
    # Default to 0.0 if not available
    happy = max(face_probs.get("happy", 0), speech_probs.get("happy", 0))
    surprise = face_probs.get("surprise", 0)  # Surprise is mostly face-only
    neutral = max(face_probs.get("neutral", 0), speech_probs.get("neutral", 0))
    sad = max(face_probs.get("sad", 0), speech_probs.get("sad", 0))
    angry = max(face_probs.get("angry", 0), speech_probs.get("angry", 0))
    fear = max(face_probs.get("fear", 0), speech_probs.get("fear", 0))
    
    if happy > 0.6 and surprise > 0.2:
        return "laughing"
    if happy > 0.5:
        return "joyful"
    if angry > 0.6:
        return "frustrated"
    if fear > 0.5:
        return "anxious"
    if sad > 0.5:
        return "down"
    if neutral > 0.6:
        return "calm"
        
    return combined_dominant

def calculate_stress(face_result, speech_result):
    """
    Fuses face and speech emotion distributions to determine stress score.
    """
    
    face_probs = face_result.get("emotion_probabilities", {})
    speech_probs = speech_result.get("emotion_probabilities", {})
    
    face_dom = face_result.get("dominant_emotion", "neutral")
    speech_dom = speech_result.get("dominant_emotion", "unknown")
    
    # Calculate intensity for each modality
    face_intensity = _get_intensity(face_probs if face_probs else face_dom)
    speech_intensity = _get_intensity(speech_probs if speech_probs else speech_dom)
    
    # Why speech intensity has higher weight in fusion:
    # Facial expressions can be easily masked, faked, or distorted by lighting/angles.
    # Speech conveys micro-tremors in vocal folds and paralinguistic tone which are
    # neurologically harder to suppress, making it a more reliable indicator of physiological stress.
    
    # Stress score formula: (0.45 * face_intensity + 0.55 * speech_intensity) * 100
    stress_score = (0.45 * face_intensity + 0.55 * speech_intensity) * 100
    stress_score = round(stress_score)
    
    # Stress level classification
    if stress_score <= 30:
        stress_level = "Relaxed"
    elif stress_score <= 60:
        stress_level = "Moderate"
    else:
        stress_level = "High Stress"
        
    derived_state = _get_derived_state(face_probs, speech_probs, speech_dom if speech_dom != "unknown" else face_dom)
    
    return {
        "face_emotion": face_dom,
        "face_confidence": round(face_probs.get(face_dom, 1.0), 2) if face_probs else 1.0,
        "speech_emotion": speech_dom,
        "speech_confidence": round(speech_probs.get(speech_dom, 1.0), 2) if speech_probs else 1.0,
        "derived_state": derived_state,
        "stress_score": stress_score,
        "stress_level": stress_level
    }

class FusionEngine:
    def __init__(self):
        pass

    def fuse(self, face_results, speech_results):
        return calculate_stress(face_results, speech_results)

if __name__ == "__main__":
    # Standalone test
    print("MAITRI Stress Analysis Test")
    print("---------------------------")
    r1 = {"dominant_emotion": "neutral", "emotion_probabilities": {"neutral": 0.8, "sad": 0.2}}
    r2 = {"dominant_emotion": "fear", "emotion_probabilities": {"fear": 0.7, "neutral": 0.3}}
    
    res = calculate_stress(r1, r2)
    print("Stress Result:", res)
