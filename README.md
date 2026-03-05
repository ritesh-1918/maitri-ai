# MAITRI – Multimodal AI Assistant for Psychological & Physical Well-Being Monitoring

**MAITRI** is a cutting-edge, privacy-first AI system that performs **real-time multimodal emotion detection** by fusing facial expression analysis and speech pattern recognition. All processing runs locally on the edge — no data ever leaves your device.

---

## 🧠 What is MAITRI?

MAITRI monitors your psychological and physical well-being by combining:

| Modality | Technology | What it Detects |
|---|---|---|
| **Face** | DeepFace + OpenCV | 7 emotions: happy, sad, angry, fear, disgust, surprise, neutral |
| **Speech** | Librosa + scikit-learn | 5 emotions: happy, sad, angry, fear, neutral |
| **Fusion** | Rule-based engine | Stress levels: Normal → Low → Medium → High |

### 🔒 Privacy-First Edge Processing

- **Zero cloud dependency** — all AI inference runs locally on your machine
- **No data transmission** — webcam frames and audio are never uploaded
- **No storage** — analysis is performed in-memory and discarded after display

---

## 🏗️ Architecture

```
MAITRI/
├── backend/
│   ├── main.py               # FastAPI server with CORS
│   ├── face_emotion.py        # DeepFace facial emotion detection
│   ├── speech_emotion.py      # Librosa + sklearn speech emotion
│   ├── fusion_engine.py       # Stress calculation engine
│   ├── requirements.txt       # Python dependencies
│   └── utils/
│       ├── audio_features.py  # Audio feature extraction
│       └── webcam_capture.py  # Webcam capture utility
│
├── frontend/
│   └── src/
│       ├── App.js             # Root app with backend status
│       ├── api.js             # Axios API client (auto-polling)
│       ├── pages/
│       │   └── Dashboard.js   # Main dashboard layout
│       └── components/
│           ├── Navbar.js      # Glass-morphism navbar
│           ├── WebcamEmotion.js   # Live webcam + emotion badge
│           ├── SpeechEmotion.js   # Audio recorder + visualizer
│           ├── StressMeter.js     # Circular SVG gauge
│           └── EmotionChart.js    # Time-series stress chart
│
├── models/                    # Saved ML models
├── datasets/                  # Training/calibration data
├── run_backend.bat            # Start backend server
├── run_frontend.bat           # Start frontend dev server
├── run_all.bat                # Launch everything at once
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Webcam & Microphone

### Option 1: One-Click Launch
```bash
run_all.bat
```

### Option 2: Manual Start

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/face_emotion` | Analyze uploaded image for emotion |
| POST | `/speech_emotion` | Record 3s audio & classify emotion |
| POST | `/stress_score` | Combined multimodal stress analysis |

---

## 🛠️ Technologies

| Layer | Stack |
|-------|-------|
| **Backend** | FastAPI, uvicorn, Python 3 |
| **Face AI** | DeepFace, OpenCV, TensorFlow |
| **Speech AI** | Librosa, scikit-learn, sounddevice |
| **Frontend** | React 18, Tailwind CSS, Chart.js, Framer Motion |
| **Design** | Glassmorphism, dark theme, Inter font |

---

## 📊 Dashboard Features

- **Live Webcam Panel** — Real-time face emotion detection every 3 seconds
- **Speech Recorder** — 3-second audio capture with animated waveform
- **Circular Stress Gauge** — SVG ring that animates with glow effects
- **Emotion Trend Chart** — Time-series visualization of stress levels
- **Backend Status** — Live indicator showing API connectivity

---

## 📝 License

This project is for educational and research purposes.
