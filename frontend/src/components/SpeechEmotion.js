import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MicOff } from 'lucide-react';

const EMOTION_EMOJI = {
    happy: '😊', sad: '😢', angry: '😠', fear: '😨', neutral: '😐', unknown: '❓'
};
const EMOTION_COLORS = {
    happy: 'text-green-400', sad: 'text-blue-400', angry: 'text-red-400',
    fear: 'text-purple-400', neutral: 'text-slate-400', unknown: 'text-slate-500'
};
const EMOTION_BG = {
    happy: 'bg-green-400/10 border-green-400/30', sad: 'bg-blue-400/10 border-blue-400/30',
    angry: 'bg-red-400/10 border-red-400/30', fear: 'bg-purple-400/10 border-purple-400/30',
    neutral: 'bg-slate-400/10 border-slate-400/30', unknown: 'bg-slate-800 border-slate-700'
};

const SpeechEmotion = ({ data, isRecording }) => {
    const emotion = data?.speech_emotion;
    const probs = data?.speech_probabilities;

    return (
        <div className="flex flex-col gap-4">
            {/* Recording Visualizer */}
            <div className={`relative h-32 rounded-xl transition-colors border flex flex-col items-center justify-center overflow-hidden ${isRecording ? 'bg-slate-900 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-black border-slate-700'}`}>
                {isRecording ? (
                    <>
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-purple-500/10"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        />
                        <div className="flex items-end gap-1.5 h-16 z-10 opacity-80">
                            {[...Array(12)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-2.5 bg-gradient-to-t from-indigo-500 to-purple-400 rounded-full"
                                    animate={{ height: [10, Math.random() * 50 + 10, 10] }}
                                    transition={{ repeat: Infinity, duration: 0.4 + Math.random() * 0.4, delay: i * 0.05 }}
                                />
                            ))}
                        </div>
                        <p className="mt-3 text-xs font-bold text-purple-400 tracking-widest uppercase z-10 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Listening
                        </p>
                    </>
                ) : (
                    <>
                        <MicOff size={32} className="text-slate-600 mb-2 transition-transform duration-500" />
                        <p className="text-xs text-slate-500 font-medium">Mic standby (Auto-syncs with Video)</p>
                    </>
                )}
            </div>

            {/* Emotion Display & Probability Bars */}
            <AnimatePresence mode="wait">
                {emotion && emotion !== 'unknown' && (
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
                                <p className="text-xs text-slate-400">Dominant Vocal Tone</p>
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
                                                    className="h-full bg-purple-400"
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
                {emotion === 'unknown' && !isRecording && (
                    <motion.div
                        key="unknown"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-700 bg-slate-800/20"
                    >
                        <span className="text-2xl opacity-50">🔇</span>
                        <div>
                            <p className="text-sm font-medium text-slate-400">No Speech Detected</p>
                            <p className="text-xs text-slate-500">Wait for audio capture</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SpeechEmotion;
