import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';
import { getCombinedAnalysis } from '../api';

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

const WebcamEmotion = ({ onEmotionDetected, onAnalyzing }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isActive, setIsActive] = useState(false);
    const [emotion, setEmotion] = useState(null);
    const [probs, setProbs] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [stream, setStream] = useState(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (onAnalyzing) onAnalyzing(isAnalyzing);
    }, [isAnalyzing, onAnalyzing]);

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
                const res = await getCombinedAnalysis(blob);
                const data = res.data || {};
                const detected = data.face_emotion || 'neutral';
                setEmotion(detected);
                setProbs(data.face_probabilities || null);
                if (onEmotionDetected) onEmotionDetected(data); // Pass full pipeline data upstream
            } catch (e) {
                console.error('Combined analysis error:', e);
            } finally {
                setIsAnalyzing(false);
            }
        }, 'image/jpeg', 0.8);
    }, [isAnalyzing, onEmotionDetected]);

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(captureAndAnalyze, 3000); // Triggers every 3s
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
                    <div className="absolute top-3 right-3 bg-indigo-500/80 rounded-full px-2 py-1 text-xs flex items-center gap-1 z-10">
                        <RefreshCw size={10} className="animate-spin" /> Analyzing 3s frame
                    </div>
                )}
            </div>

            {/* Emotion Display & Probability Bars */}
            <AnimatePresence mode="wait">
                {emotion && (
                    <motion.div
                        key={emotion}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col gap-3"
                    >
                        {/* Dominant Emotion Pill */}
                        <div className={`flex items-center gap-3 p-3 rounded-xl border ${EMOTION_BG[emotion] || EMOTION_BG.neutral}`}>
                            <span className="text-3xl">{EMOTION_EMOJI[emotion] || '😐'}</span>
                            <div>
                                <p className="text-xs text-slate-400">Dominant Face Emotion</p>
                                <p className={`font-bold text-lg capitalize ${EMOTION_COLORS[emotion] || 'text-slate-300'}`}>
                                    {emotion}
                                </p>
                            </div>
                        </div>

                        {/* Probability Bars */}
                        {probs && (
                            <div className="bg-slate-800/50 p-3 flex flex-col gap-2 rounded-xl border border-slate-700/50">
                                {Object.entries(probs)
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 4) // Show top 4
                                    .map(([emoName, val]) => (
                                        <div key={emoName} className="flex items-center gap-2 text-xs">
                                            <div className="w-16 text-slate-400 capitalize">{emoName}</div>
                                            <div className="flex-1 h-2 rounded-full bg-slate-700 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.round(val * 100)}%` }}
                                                    transition={{ duration: 0.4 }}
                                                    className="h-full bg-indigo-400"
                                                />
                                            </div>
                                            <div className="w-8 text-right font-mono text-slate-300">
                                                {Math.round(val * 100)}%
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
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
                {isActive ? <><CameraOff size={16} /> Stop Tracking</> : <><Camera size={16} /> Start Auto-Tracking</>}
            </button>
        </div>
    );
};

export default WebcamEmotion;
