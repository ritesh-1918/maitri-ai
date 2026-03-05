import time
import json
from transformers import pipeline
import torch
from utils.audio_features import record_audio

# ─── Load Speech Model at Startup ───
# Why the speech model is cached at startup:
# Loading a transformer model (like Wav2Vec2) takes several seconds. Caching it globally ensures 
# that inference requests meet the <1s latency target without paying the initialization penalty per request.
print("[MAITRI] Loading Wav2Vec2 speech emotion model...")
try:
    _speech_pipeline = pipeline(
        "audio-classification", 
        model="superb/wav2vec2-base-superb-er"
    )
    print("[MAITRI] Speech emotion model loaded from HuggingFace ✓")
except Exception as e:
    print(f"[MAITRI] Error loading model: {e}")
    _speech_pipeline = None

def detect_speech_emotion():
    """
    Records 3 seconds of audio via utils.audio_features.record_audio(), 
    validates length, and extracts emotion probabilities using Wav2Vec2.
    Returns:
    {
      "emotion_probabilities": {"happy": 0.2, "sad": 0.1, ...},
      "dominant_emotion": "neutral"
    }
    """
    try:
        if _speech_pipeline is None:
            return _fallback_response("Model not loaded")

        print("Recording 3 seconds of audio...")
        audio_data = record_audio(duration=3, sample_rate=16000)
        
        if audio_data is None:
            return _fallback_response("Microphone recording failed")
            
        # Validate audio length before inference
        # Minimum audio length required for Wav2Vec2 context. If it's too short (e.g. < 0.1s), skip.
        if len(audio_data) < 1600:  
            return _fallback_response("Audio too short after silence trimming")
            
        # Run inference using the pre-loaded HF pipeline
        # The pipeline handles turning our 1D numpy array into required tensors natively
        predictions = _speech_pipeline(audio_data)
        
        # Hugging Face superb ER mapped classes: 'neu', 'hap', 'ang', 'sad', 'exc'
        # We need to map these to: happy, sad, angry, fear, neutral
        # Note: 'exc' (excited) is often mapped to 'happy', and we can fallback or derive 'fear' if present in broader models.
        # superb/wav2vec2-base-superb-er outputs:
        # labels: ['neu', 'hap', 'ang', 'sad', 'exc']
        
        emotion_map = {
            "neu": "neutral",
            "hap": "happy",
            "ang": "angry",
            "sad": "sad",
            "exc": "happy"  # Group excited with happy for base probabilities
        }
        
        probs = {
            "happy": 0.0,
            "sad": 0.0,
            "angry": 0.0,
            "fear": 0.0,  # Wav2Vec superb base doesn't strongly isolate fear, we default to 0.0 unless mapped
            "neutral": 0.0
        }
        
        for p in predictions:
            mapped_label = emotion_map.get(p['label'], "neutral")
            probs[mapped_label] += p['score']
            
        # Ensure it sums roughly to 1.0 (normalization) if 'exc' and 'hap' stacked
        total = sum(probs.values())
        if total > 0:
            probs = {k: float(v / total) for k, v in probs.items()}
            
        dominant = max(probs, key=probs.get)
        
        return {
            "emotion_probabilities": probs,
            "dominant_emotion": dominant
        }
        
    except Exception as e:
        print(f"Error in speech detection inference: {e}")
        return _fallback_response(str(e))

def _fallback_response(msg=None):
    if msg:
        print(f"[MAITRI Speech] {msg}")
        
    # If microphone recording or pipeline fails: return speech_emotion = "unknown"
    return {
        "emotion_probabilities": {
            "happy": 0.0, "sad": 0.0, "angry": 0.0, "fear": 0.0, "neutral": 0.0
        },
        "dominant_emotion": "unknown"
    }

class SpeechEmotionDetector:
    def __init__(self):
        pass

    def analyze(self):
        return detect_speech_emotion()

if __name__ == "__main__":
    print("MAITRI Speech Emotion Test")
    print("--------------------------")
    while True:
        input("Press Enter to start 3-second recording (or Ctrl+C to quit)...")
        result = detect_speech_emotion()
        print(f"Result: {json.dumps(result, indent=2)}")
        print()
