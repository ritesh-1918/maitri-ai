import sounddevice as sd
import numpy as np
import librosa
import pickle
import os
import json
import scipy.io.wavfile as wav

# Constants
SAMPLING_RATE = 22050
DURATION = 3  # seconds
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'speech_emotion_model.pkl')

def extract_features(audio_data, sr=SAMPLING_RATE):
    """
    Extract MFCC, Spectrogram, Pitch, and Energy from audio data.
    """
    # MFCCs
    mfccs = librosa.feature.mfcc(y=audio_data, sr=sr, n_mfcc=20)
    mfccs_mean = np.mean(mfccs, axis=1)
    
    # Spectrogram (Mel Spectrogram mean as a proxy)
    mel = librosa.feature.melspectrogram(y=audio_data, sr=sr)
    mel_mean = np.mean(librosa.power_to_db(mel), axis=1)[:10] # Take first 10 for simplicity
    
    # Pitch (Yin algorithm)
    pitches = librosa.yin(audio_data, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'))
    pitch_mean = np.array([np.mean(pitches)])
    
    # Energy (RMS)
    rms = librosa.feature.rms(y=audio_data)
    energy_mean = np.array([np.mean(rms)])
    
    # Concatenate features (20 + 10 + 1 + 1 = 32)
    feature_vector = np.concatenate([mfccs_mean, mel_mean, pitch_mean, energy_mean])
    return feature_vector

def detect_speech_emotion():
    """
    Records 3 seconds of audio, extracts features, and predicts emotion.
    """
    try:
        print("Recording 3 seconds of audio...")
        audio_data = sd.rec(int(DURATION * SAMPLING_RATE), samplerate=SAMPLING_RATE, channels=1)
        sd.wait()  # Wait for recording to finish
        audio_data = audio_data.flatten()
        
        # Save temp file just in case or for verification
        # wav.write("temp_recording.wav", SAMPLING_RATE, audio_data)
        
        # Extract features
        features = extract_features(audio_data)
        
        # Load model
        if not os.path.exists(MODEL_PATH):
            return {"error": "Model file not found. Please run training script.", "emotion": "neutral"}
            
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
            
        # Predict
        prediction = model.predict(features.reshape(1, -1))
        emotion = prediction[0]
        
        return {"emotion": str(emotion)}
        
    except Exception as e:
        print(f"Error in speech detection: {e}")
        return {"emotion": "neutral", "error": str(e)}

class SpeechEmotionDetector:
    def __init__(self):
        pass

    def analyze(self, audio_file):
        """
        Mainly for API compatibility. 
        Note: The API currently sends a file path, while detect_speech_emotion 
        records directly. I'll update this to handle the provided file.
        """
        try:
            audio_data, sr = librosa.load(audio_file, sr=SAMPLING_RATE)
            features = extract_features(audio_data, sr=sr)
            
            with open(MODEL_PATH, 'rb') as f:
                model = pickle.load(f)
            
            prediction = model.predict(features.reshape(1, -1))
            return {"emotion": str(prediction[0]), "success": True}
        except Exception as e:
            return {"emotion": "neutral", "error": str(e), "success": False}

if __name__ == "__main__":
    # Test loop
    print("MAITRI Speech Emotion Test")
    print("--------------------------")
    while True:
        input("Press Enter to start 3-second recording (or Ctrl+C to quit)...")
        result = detect_speech_emotion()
        print(f"Detected Emotion: {result['emotion']}")
        print(json.dumps(result))
        print()
