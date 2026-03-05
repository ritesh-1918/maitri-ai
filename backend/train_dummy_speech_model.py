import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import os

def train_and_save_dummy_model():
    # Create a dummy dataset for 5 emotions: happy, sad, angry, fear, neutral
    # Features: MFCC (20), Spectrogram (dummy 10), Pitch (1), Energy (1) = 32 features
    X = np.random.rand(100, 32)
    y = np.random.choice(['happy', 'sad', 'angry', 'fear', 'neutral'], 100)
    
    model = RandomForestClassifier(n_estimators=10)
    model.fit(X, y)
    
    models_dir = os.path.join(os.getcwd(), 'models')
    if not os.path.exists(models_dir):
        os.makedirs(models_dir)
        
    model_path = os.path.join(models_dir, 'speech_emotion_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    print(f"Dummy speech emotion model saved to {model_path}")

if __name__ == "__main__":
    train_and_save_dummy_model()
