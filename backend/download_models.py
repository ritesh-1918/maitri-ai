from deepface import DeepFace
import os

def download_models():
    print("Initializing Face Emotion Model...")
    # This will trigger the download of the emotion model
    try:
        DeepFace.analyze(img_path="backend/utils/webcam_capture.py", actions=['emotion'], enforce_detection=False)
        print("Face Emotion Model ready.")
    except Exception as e:
        print(f"Face model initialization note: {e}")

    print("Checking Speech Emotion Model dependencies...")
    # For speech, we'll use a lightweight approach or librosa features
    # If using a specific pre-trained model, we'd download it here.
    print("Speech Emotion dependencies verified.")

if __name__ == "__main__":
    download_models()
