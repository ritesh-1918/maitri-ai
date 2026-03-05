import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';
import { analyzeFaceEmotion } from '../api';

const EMOTION_COLORS = {
    happy: 'text-green-400',
    sad: 'text-blue-400',
    angry: 'text-red-400',
    fear: 'text-purple-400',
    disgust: 'text-yellow-500',
    surprise: 'text-cyan-400',
    neutral: 'text-slate-400',
};

const EMOTION_BG = {
    happy: 'bg-green-400/10 border-green-400/30',
    sad: 'bg-blue-400/10 border-blue-400/30',
    angry: 'bg-red-400/10 border-red-400/30',
    fear: 'bg-purple-400/10 border-purple-400/30',
    disgust: 'bg-yellow-500/10 border-yellow-500/30',
    surprise: 'bg-cyan-400/10 border-cyan-400/30',
    neutral: 'bg-slate-400/10 border-slate-400/30',
};

const EMOTION_EMOJI = {
    happy: '😊', sad: '😢', angry: '😠',
    fear: '😨', disgust: '🤢', surprise: '😲', neutral: '😐',
};

const WebcamEmotion = ({ onEmotionDetected }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isActive, setIsActive] = useState(false);
    const [emotion, setEmotion] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [stream, setStream] = useState(null);
    const intervalRef = useRef(null);

    const startCamera = async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) videoRef.current.srcObject = s;
            setStream(s);
            setIsActive(true);
        } catch (err) {
            console.error('Camera error:', err);
        }
    };

    const stopCamera = () => {
        if (stream) stream.getTracks().forEach(t => t.stop());
        setStream(null);
        setIsActive(false);
        clearInterval(intervalRef.current);
    };

    const captureAndAnalyze = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || isAnalyzing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob(async (blob) => {
            if (!blob) return;
            setIsAnalyzing(true);
            try {
                const res = await analyzeFaceEmotion(blob);
                const detected = res.data?.emotion || 'neutral';
                setEmotion(detected);
                if (onEmotionDetected) onEmotionDetected(detected);
            } catch (e) {
                console.error('Face analyze error:', e);
            } finally {
                setIsAnalyzing(false);
            }
        }, 'image/jpeg', 0.8);
    }, [isAnalyzing, onEmotionDetected]);

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(captureAndAnalyze, 3000);
        }
        return () => clearInterval(intervalRef.current);
    }, [isActive, captureAndAnalyze]);

    return (
        <div className="flex flex-col gap-4">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-slate-700">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                {!isActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/80">
                        <CameraOff size={40} className="text-slate-500" />
                        <p className="text-slate-400 text-sm">Camera is off</p>
                    </div>
                )}
                {isActive && isAnalyzing && (
                    <div className="absolute top-3 right-3 bg-indigo-500/80 rounded-full px-2 py-1 text-xs flex items-center gap-1">
                        <RefreshCw size={10} className="animate-spin" /> Analyzing
                    </div>
                )}
            </div>

            {/* Emotion Display */}
            <AnimatePresence mode="wait">
                {emotion && (
                    <motion.div
                        key={emotion}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border ${EMOTION_BG[emotion] || EMOTION_BG.neutral}`}
                    >
                        <span className="text-3xl">{EMOTION_EMOJI[emotion] || '😐'}</span>
                        <div>
                            <p className="text-xs text-slate-400">Detected Emotion</p>
                            <p className={`font-bold text-lg capitalize ${EMOTION_COLORS[emotion] || 'text-slate-300'}`}>
                                {emotion}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Controls */}
            <button
                onClick={isActive ? stopCamera : startCamera}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${isActive
                        ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
                        : 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/30'
                    }`}
            >
                {isActive ? <><CameraOff size={16} /> Stop Camera</> : <><Camera size={16} /> Start Camera</>}
            </button>
        </div>
    );
};

export default WebcamEmotion;
