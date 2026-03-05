import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Camera, Activity, Brain, TrendingUp,
} from 'lucide-react';
import WebcamEmotion from '../components/WebcamEmotion';
import SpeechEmotion from '../components/SpeechEmotion';
import StressMeter from '../components/StressMeter';
import EmotionChart from '../components/EmotionChart';



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
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleCombinedData = useCallback((data) => {
        setFaceEmotion(data.face_emotion);
        setSpeechEmotion(data.speech_emotion);

        const updatedStress = {
            face_emotion: data.face_emotion,
            speech_emotion: data.speech_emotion,
            stress_level: data.stress_level,
            stress_score: data.stress_score,
            derived_state: data.derived_state,
            face_probabilities: data.face_probabilities,
            speech_probabilities: data.speech_probabilities,
        };

        setStressData(updatedStress);

        setEmotionHistory(prev => [
            ...prev.slice(-19),
            { face: data.face_emotion, speech: data.speech_emotion },
        ]);
    }, []);

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

                    <WebcamEmotion onEmotionDetected={handleCombinedData} onAnalyzing={setIsAnalyzing} />
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
                        <SpeechEmotion data={stressData} isRecording={isAnalyzing} />
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
