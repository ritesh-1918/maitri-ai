import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Activity, TrendingUp, Shield, RefreshCw } from 'lucide-react';
import WebcamEmotion from '../components/WebcamEmotion';
import SpeechEmotion from '../components/SpeechEmotion';
import StressMeter from '../components/StressMeter';
import EmotionChart from '../components/EmotionChart';

const CARD_VARIANTS = {
    hidden: { opacity: 0, y: 24 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Card = ({ title, icon: Icon, color, children, index }) => (
    <motion.div
        custom={index}
        initial="hidden"
        animate="visible"
        variants={CARD_VARIANTS}
        className="glass rounded-2xl p-5 flex flex-col gap-4"
    >
        <div className="flex items-center gap-2 border-b border-slate-700/50 pb-3">
            <div className={`p-1.5 rounded-lg ${color}`}>
                <Icon size={16} className="text-white" />
            </div>
            <h2 className="font-semibold text-slate-200 text-sm">{title}</h2>
        </div>
        {children}
    </motion.div>
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
        // Update history when we get both
        setEmotionHistory(prev => [
            ...prev.slice(-19),
            { face: faceEmotion || 'neutral', speech: emotion },
        ]);
        // Auto-update stress data
        if (faceEmotion) {
            setStressData({
                face_emotion: faceEmotion,
                speech_emotion: emotion,
                stress_level: deriveStressLevel(faceEmotion, emotion),
            });
        }
    }, [faceEmotion]);

    const deriveStressLevel = (face, speech) => {
        const high = ['angry', 'fear'];
        if (high.includes(face) || high.includes(speech)) return 'High Stress';
        if (face === 'sad' || speech === 'sad') return 'Medium Stress';
        if (face === 'happy' || speech === 'happy') return 'Low Stress';
        return 'Normal';
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl md:text-4xl font-black gradient-heading mb-1">Well-Being Dashboard</h1>
                <p className="text-slate-400 text-sm">Real-time multimodal emotion and stress monitoring</p>
            </motion.div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Face Emotion', value: faceEmotion || '—', icon: '😊' },
                    { label: 'Speech Emotion', value: speechEmotion || '—', icon: '🎙️' },
                    { label: 'Stress Level', value: stressData?.stress_level || '—', icon: '🧠' },
                    { label: 'Readings', value: emotionHistory.length, icon: '📊' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        custom={i}
                        initial="hidden"
                        animate="visible"
                        variants={CARD_VARIANTS}
                        className="glass rounded-xl p-4"
                    >
                        <p className="text-2xl mb-1">{stat.icon}</p>
                        <p className="text-xs text-slate-400">{stat.label}</p>
                        <p className="font-bold text-slate-100 capitalize mt-0.5 text-sm truncate">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <Card title="Facial Emotion Detection" icon={LayoutDashboard} color="bg-indigo-500" index={0}>
                    <WebcamEmotion onEmotionDetected={handleFaceEmotion} />
                </Card>

                <Card title="Speech Emotion Analysis" icon={Activity} color="bg-purple-500" index={1}>
                    <SpeechEmotion onEmotionDetected={handleSpeechEmotion} />
                </Card>

                <Card title="Stress Level Assessment" icon={Shield} color="bg-cyan-600" index={2}>
                    <StressMeter stressData={stressData} />
                </Card>

                <Card title="Emotion Trend History" icon={TrendingUp} color="bg-emerald-600" index={3}>
                    <EmotionChart emotionHistory={emotionHistory} />
                </Card>

                {/* Instructions */}
                <motion.div
                    custom={4}
                    initial="hidden"
                    animate="visible"
                    variants={CARD_VARIANTS}
                    className="glass rounded-2xl p-5 md:col-span-1 xl:col-span-2"
                >
                    <h2 className="font-semibold text-slate-200 text-sm mb-4 flex items-center gap-2">
                        <RefreshCw size={14} className="text-indigo-400" /> How to use
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                            { step: '1', title: 'Start Camera', desc: 'Click "Start Camera" to begin face emotion detection. It re-analyzes every 3 seconds.', color: 'text-indigo-400' },
                            { step: '2', title: 'Record Speech', desc: 'Click "Record 3s" to capture your voice. The backend analyzes pitch and energy.', color: 'text-purple-400' },
                            { step: '3', title: 'View Results', desc: 'After recording speech, the Stress Level and Emotion History update automatically.', color: 'text-cyan-400' },
                        ].map(({ step, title, desc, color }) => (
                            <div key={step} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
                                <span className={`text-2xl font-black ${color}`}>{step}</span>
                                <p className="font-semibold text-slate-200 text-sm mt-1">{title}</p>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
