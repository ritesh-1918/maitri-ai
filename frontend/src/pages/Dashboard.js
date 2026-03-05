import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera, Activity, Brain, TrendingUp,
} from 'lucide-react';
import WebcamEmotion from '../components/WebcamEmotion';
import SpeechEmotion from '../components/SpeechEmotion';
import StressMeter from '../components/StressMeter';
import EmotionChart from '../components/EmotionChart';

const EMOTION_EMOJI = {
    happy: '😊', sad: '😢', angry: '😠',
    fear: '😨', disgust: '🤢', surprise: '😲', neutral: '😐',
};

const EMOTION_GRADIENT = {
    happy: 'from-green-500/20 to-emerald-500/10 border-green-500/30',
    sad: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30',
    angry: 'from-red-500/20 to-orange-500/10 border-red-500/30',
    fear: 'from-purple-500/20 to-violet-500/10 border-purple-500/30',
    disgust: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30',
    surprise: 'from-cyan-500/20 to-sky-500/10 border-cyan-500/30',
    neutral: 'from-slate-600/20 to-slate-700/10 border-slate-600/30',
};

const deriveStressLevel = (face, speech) => {
    const high = ['angry', 'fear'];
    if (high.includes(face) || high.includes(speech)) return 'High Stress';
    if (face === 'sad' || speech === 'sad') return 'Medium Stress';
    if (face === 'happy' || speech === 'happy') return 'Low Stress';
    return 'Normal';
};

const SectionHeader = ({ icon: Icon, label, color }) => (
    <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 rounded-lg ${color}`}>
            <Icon size={14} className="text-white" />
        </div>
        <h2 className="font-bold text-slate-200 text-sm tracking-wide uppercase">{label}</h2>
    </div>
);

const Dashboard = () => {
    const [faceEmotion, setFaceEmotion] = useState(null);
    const [speechEmotion, setSpeechEmotion] = useState(null);
    const [stressData, setStressData] = useState(null);
    const [emotionHistory, setEmotionHistory] = useState([]);

    const handleFaceEmotion = useCallback((emotion) => {
        setFaceEmotion(emotion);
    }, []);

    const handleSpeechEmotion = useCallback((emotion) => {
        setSpeechEmotion(emotion);
        const face = faceEmotion || 'neutral';
        const updatedStress = {
            face_emotion: face,
            speech_emotion: emotion,
            stress_level: deriveStressLevel(face, emotion),
        };
        setStressData(updatedStress);
        setEmotionHistory(prev => [
            ...prev.slice(-19),
            { face, speech: emotion },
        ]);
    }, [faceEmotion]);

    const cardVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: (i) => ({
            opacity: 1, y: 0,
            transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' },
        }),
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-black gradient-heading leading-none mb-1">
                    Mental Health Monitor
                </h1>
                <p className="text-slate-400 text-sm">
                    Multimodal AI — real-time emotion &amp; stress analysis
                </p>
            </motion.div>

            {/* ═══ TOP STATS BAR ═══ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                    { label: 'Face Emotion', value: faceEmotion || '—', icon: '😊', accent: 'border-indigo-500/30' },
                    { label: 'Speech Emotion', value: speechEmotion || '—', icon: '🎙️', accent: 'border-purple-500/30' },
                    { label: 'Stress Level', value: stressData?.stress_level || '—', icon: '🧠', accent: 'border-cyan-500/30' },
                    { label: 'Data Points', value: emotionHistory.length, icon: '📊', accent: 'border-emerald-500/30' },
                ].map((s, i) => (
                    <motion.div
                        key={s.label}
                        custom={i}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        className={`glass rounded-xl p-4 border ${s.accent}`}
                    >
                        <span className="text-2xl">{s.icon}</span>
                        <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                        <p className="font-bold text-slate-100 capitalize text-sm mt-0.5 truncate">{s.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* ═══ MAIN PANELS ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                {/* ── LEFT: Webcam + Face Emotion ── */}
                <motion.div
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    className="glass rounded-2xl p-6"
                >
                    <SectionHeader icon={Camera} label="Live Face Detection" color="bg-indigo-600" />

                    <WebcamEmotion onEmotionDetected={handleFaceEmotion} />

                    {/* Facial emotion badge */}
                    <AnimatePresence mode="wait">
                        {faceEmotion && (
                            <motion.div
                                key={faceEmotion}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`mt-4 flex items-center gap-4 p-4 rounded-xl border bg-gradient-to-br ${EMOTION_GRADIENT[faceEmotion] || EMOTION_GRADIENT.neutral
                                    }`}
                            >
                                <span className="text-4xl">{EMOTION_EMOJI[faceEmotion] || '😐'}</span>
                                <div>
                                    <p className="text-xs text-slate-400 mb-0.5">Detected Facial Emotion</p>
                                    <p className="text-xl font-extrabold capitalize text-white">{faceEmotion}</p>
                                </div>
                                <div className="ml-auto">
                                    <span className="inline-flex items-center gap-1 text-xs bg-slate-800/70 px-2.5 py-1 rounded-full border border-slate-700 text-slate-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        Live
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* ── RIGHT: Speech Emotion + Stress Meter ── */}
                <div className="flex flex-col gap-6">

                    {/* Speech Emotion Card */}
                    <motion.div
                        custom={1}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        className="glass rounded-2xl p-6"
                    >
                        <SectionHeader icon={Activity} label="Speech Emotion Analysis" color="bg-purple-600" />
                        <SpeechEmotion onEmotionDetected={handleSpeechEmotion} />
                    </motion.div>

                    {/* Stress Meter Card */}
                    <motion.div
                        custom={2}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        className="glass rounded-2xl p-6"
                    >
                        <SectionHeader icon={Brain} label="Stress Level Assessment" color="bg-cyan-700" />
                        <StressMeter stressData={stressData} />
                    </motion.div>
                </div>
            </div>

            {/* ═══ BOTTOM: Emotion History Chart ═══ */}
            <motion.div
                custom={3}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                className="glass rounded-2xl p-6"
            >
                <SectionHeader icon={TrendingUp} label="Emotion History" color="bg-emerald-600" />
                <p className="text-xs text-slate-400 -mt-2 mb-4">
                    Tracks the last 20 emotion readings for face &amp; speech over time
                </p>
                <EmotionChart emotionHistory={emotionHistory} />
            </motion.div>
        </div>
    );
};

export default Dashboard;
