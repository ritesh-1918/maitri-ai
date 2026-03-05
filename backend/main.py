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

import logging
import time
import asyncio

# Setup structured logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s - %(message)s")
logger = logging.getLogger("maitri.backend")

@app.post("/combined_analysis")
async def combined_analysis(file: UploadFile = File(...)):
    """
    Multimodal Emotion Pipeline Documentation:
    1. Camera -> face emotion model (analyzes facial micro-expressions)
    2. Microphone -> speech emotion model (analyzes vocal folds and tone)
    3. Fusion engine -> computes weighted stress score
    
    Why multimodal inference improves reliability:
    Individual modalities are prone to isolated failures (e.g. bad lighting for faces, background noise for audio).
    Combining them using probabilistic weighting reduces false positives and provides a holistic 
    behavioral view, significantly improving real-world diagnostic reliability.
    """
    request_start = time.time()
    
    # Read image
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    logger.info("Starting combined analysis request.")
    
    # Execute face and speech tasks concurrently to meet <2s target
    face_task = asyncio.to_thread(_run_face_pipeline, frame)
    speech_task = asyncio.to_thread(_run_speech_pipeline)
    
    face_result, speech_result = await asyncio.gather(face_task, speech_task)
    
    fusion_start = time.time()
    final_analysis = calculate_stress(face_result, speech_result)
    fusion_time = (time.time() - fusion_start) * 1000
    logger.info(f"Fusion calculation time: {fusion_time:.2f}ms")
    
    total_time = time.time() - request_start
    if total_time > 2.0:
        logger.warning(f"Performance Safeguard: Combined request exceeded 2s latency threshold ({total_time:.2f}s)!")
    else:
        logger.info(f"Combined request completed in {total_time:.2f}s")
        
    return final_analysis

def _run_face_pipeline(frame):
    start = time.time()
    res = detect_face_emotion(frame)
    duration = (time.time() - start) * 1000
    logger.info(f"Face inference time: {duration:.2f}ms")
    if duration > 100:
        logger.warning(f"Performance Safeguard: Face pipeline exceeded 100ms latency ({duration:.2f}ms)")
    return res
        
def _run_speech_pipeline():
    start = time.time()
    res = detect_speech_emotion()
    duration = time.time() - start
    logger.info(f"Speech inference time: {duration:.2f}s")
    if duration > 1.0:
        logger.warning(f"Performance Safeguard: Speech pipeline exceeded 1s latency ({duration:.2f}s)")
    return res

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
