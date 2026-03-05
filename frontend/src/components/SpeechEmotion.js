import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { analyzeSpeechEmotion } from '../api';

const EMOTION_EMOJI = {
    happy: '😊', sad: '😢', angry: '😠', fear: '😨', neutral: '😐',
};
const EMOTION_COLORS = {
    happy: 'text-green-400', sad: 'text-blue-400', angry: 'text-red-400',
    fear: 'text-purple-400', neutral: 'text-slate-400',
};
const EMOTION_BG = {
    happy: 'bg-green-400/10 border-green-400/30', sad: 'bg-blue-400/10 border-blue-400/30',
    angry: 'bg-red-400/10 border-red-400/30', fear: 'bg-purple-400/10 border-purple-400/30',
    neutral: 'bg-slate-400/10 border-slate-400/30',
};

const SpeechEmotion = ({ onEmotionDetected }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [emotion, setEmotion] = useState(null);
    const [countdown, setCountdown] = useState(null);

    const startRecording = async () => {
        setIsRecording(true);
        // Countdown timer mirroring the 3-sec backend recording
        for (let i = 3; i >= 1; i--) {
            setCountdown(i);
            await new Promise(r => setTimeout(r, 1000));
        }
        setCountdown('Processing...');
        try {
            const res = await analyzeSpeechEmotion();
            const detected = res.data?.emotion || 'neutral';
            setEmotion(detected);
            if (onEmotionDetected) onEmotionDetected(detected);
        } catch (e) {
            console.error('Speech analyze error:', e);
        } finally {
            setIsRecording(false);
            setCountdown(null);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Recording Visualizer */}
            <div className="relative h-32 rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center overflow-hidden">
                {isRecording ? (
                    <>
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-purple-500/10"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        />
                        <div className="flex items-end gap-1 h-12 z-10">
                            {[...Array(10)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-2 bg-gradient-to-t from-indigo-500 to-purple-400 rounded-full"
                                    animate={{ height: [8, Math.random() * 48 + 8, 8] }}
                                    transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5, delay: i * 0.05 }}
                                />
                            ))}
                        </div>
                        <p className="mt-2 text-sm font-bold text-indigo-400 z-10">
                            {typeof countdown === 'number' ? `Recording... ${countdown}s` : countdown}
                        </p>
                    </>
                ) : (
                    <>
                        <MicOff size={32} className="text-slate-600 mb-1" />
                        <p className="text-sm text-slate-500">Press record to start</p>
                    </>
                )}
            </div>

            {/* Emotion Display */}
            <AnimatePresence mode="wait">
                {emotion && (
                    <motion.div
                        key={emotion}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border ${EMOTION_BG[emotion] || EMOTION_BG.neutral}`}
                    >
                        <span className="text-3xl">{EMOTION_EMOJI[emotion] || '😐'}</span>
                        <div>
                            <p className="text-xs text-slate-400">Speech Emotion</p>
                            <p className={`font-bold text-lg capitalize ${EMOTION_COLORS[emotion] || 'text-slate-300'}`}>{emotion}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Record Button */}
            <button
                onClick={startRecording}
                disabled={isRecording}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${isRecording
                        ? 'bg-slate-700/50 border border-slate-600 text-slate-500 cursor-not-allowed'
                        : 'bg-purple-500/20 border border-purple-500/40 text-purple-400 hover:bg-purple-500/30'
                    }`}
            >
                {isRecording ? <><Loader2 size={16} className="animate-spin" /> Recording...</> : <><Mic size={16} /> Record 3s</>}
            </button>
        </div>
    );
};

export default SpeechEmotion;
