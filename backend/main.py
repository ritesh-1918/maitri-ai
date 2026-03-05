from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import cv2
import numpy as np
import io
import os

# Import our custom modules
from face_emotion import detect_face_emotion
from speech_emotion import detect_speech_emotion, SpeechEmotionDetector
from fusion_engine import calculate_stress

app = FastAPI(title="MAITRI API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "MAITRI Backend is running", "status": "online"}

@app.post("/face_emotion")
async def face_emotion(file: UploadFile = File(...)):
    """Receives an image and returns the dominant emotion."""
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    result = detect_face_emotion(frame)
    return result

@app.post("/speech_emotion")
async def speech_emotion():
    """Triggers a 3-second recording and returns the detected emotion."""
    result = detect_speech_emotion()
    return result

@app.post("/stress_score")
async def stress_score(file: UploadFile = File(...)):
    """
    Receives an image for face emotion, 
    triggers speech recording, 
    and returns combined stress analysis.
    """
    # 1. Face Emotion
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    face_result = detect_face_emotion(frame)
    
    # 2. Speech Emotion (Triggers 3-second mic recording)
    speech_result = detect_speech_emotion()
    
    # 3. Fusion
    final_analysis = calculate_stress(
        face_result.get("emotion", "neutral"), 
        speech_result.get("emotion", "neutral")
    )
    
    return final_analysis

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
