import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 15000,
});

export const checkStatus = () => api.get('/');

export const analyzeFaceEmotion = (imageBlob) => {
    const formData = new FormData();
    formData.append('file', imageBlob, 'frame.jpg');
    return api.post('/face_emotion', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const analyzeSpeechEmotion = () => {
    return api.post('/speech_emotion');
};

export const getStressScore = (imageBlob) => {
    const formData = new FormData();
    formData.append('file', imageBlob, 'frame.jpg');
    return api.post('/stress_score', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export default api;
