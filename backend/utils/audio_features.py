import librosa
import numpy as np
import sounddevice as sd

# Why 16kHz audio is required: 
# Pretrained speech models like Wav2Vec2 are trained on 16kHz data. 
# Resampling outside of model execution ensures robust feature alignment and prevents errors.
def record_audio(duration=3, sample_rate=16000):
    """
    Records mono audio from the system microphone, normalizes amplitude, 
    and trims silence.
    Ensures latency <3 seconds total recording.
    """
    try:
        # Why each preprocessing step exists:
        # 1. Capture: Mono channel reduces dimension complexity.
        # 2. Resampling: Forced 16000Hz via samplerate directly.
        # 3. Normalization: Ensures peak amplitude is consistent regardless of mic gain.
        # 4. Silence Trimming: Removes non-speech intervals to improve inference focus.
        audio_data = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=1, dtype='float32')
        sd.wait()
        audio_data = audio_data.flatten()
        
        # Ensure waveform is normalized to peak amplitude
        peak = np.max(np.abs(audio_data))
        if peak > 0:
            audio_data = audio_data / peak
            
        # Remove silence using simple energy threshold and trim leading/trailing silence
        # (librosa.effects.trim achieves exactly this)
        trimmed_audio, _ = librosa.effects.trim(audio_data, top_db=20)
        
        return trimmed_audio
    except Exception as e:
        print(f"Error recording audio: {e}")
        return None
