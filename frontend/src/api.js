import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 15000,
});

// ─── Health Check ───
export const checkStatus = () => api.get('/');

// ─── Face Emotion ───
export const analyzeFaceEmotion = (imageBlob) => {
    const formData = new FormData();
    formData.append('file', imageBlob, 'frame.jpg');
    return api.post('/face_emotion', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// ─── Speech Emotion ───
export const analyzeSpeechEmotion = () => {
    return api.post('/speech_emotion');
};

// ─── Combined Stress Score ───
export const getStressScore = (imageBlob) => {
    const formData = new FormData();
    formData.append('file', imageBlob, 'frame.jpg');
    return api.post('/stress_score', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// ─── Auto-Polling Helper ───
// Calls `callback` every `intervalMs` milliseconds.
// Returns a cleanup function to stop polling.
export const startPolling = (callback, intervalMs = 3000) => {
    const id = setInterval(callback, intervalMs);
    // Run immediately on start
    callback();
    return () => clearInterval(id);
};

export default api;
