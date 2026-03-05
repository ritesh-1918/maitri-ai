from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import cv2
import numpy as np
import io
from face_emotion import FaceEmotionDetector
from speech_emotion import SpeechEmotionDetector
from fusion_engine import FusionEngine

app = FastAPI(title="MAITRI API")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

face_detector = FaceEmotionDetector()
speech_detector = SpeechEmotionDetector()
fusion_engine = FusionEngine()

@app.get("/")
async def root():
    return {"message": "Welcome to MAITRI - Multimodal AI Assistant"}

@app.post("/analyze/face")
async def analyze_face(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    result = face_detector.analyze(frame)
    return result

@app.post("/analyze/multimodal")
async def analyze_multimodal(image: UploadFile = File(...), audio: UploadFile = File(...)):
    # Handle image
    img_contents = await image.read()
    nparr = np.frombuffer(img_contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    face_result = face_detector.analyze(frame)
    
    # Handle audio (save temporarily for librosa)
    audio_path = "temp_audio.wav"
    with open(audio_path, "wb") as f:
        f.write(await audio.read())
    
    speech_result = speech_detector.analyze(audio_path)
    
    # Fusion
    final_result = fusion_engine.fuse(face_result, speech_result)
    return final_result

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
