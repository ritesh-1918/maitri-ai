import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const STRESS_CONFIG = {
    'High Stress': {
        color: 'from-red-500 to-orange-500',
        bg: 'bg-red-500/20 border-red-500/40',
        text: 'text-red-400',
        glow: 'glow-danger',
        percent: 90,
        icon: '🔴',
    },
    'Medium Stress': {
        color: 'from-yellow-400 to-orange-400',
        bg: 'bg-yellow-500/20 border-yellow-500/40',
        text: 'text-yellow-400',
        percent: 55,
        icon: '🟡',
    },
    'Low Stress': {
        color: 'from-green-400 to-emerald-500',
        bg: 'bg-green-500/20 border-green-500/40',
        text: 'text-green-400',
        percent: 20,
        icon: '🟢',
    },
    'Normal': {
        color: 'from-blue-400 to-cyan-400',
        bg: 'bg-blue-500/20 border-blue-500/40',
        text: 'text-blue-400',
        percent: 10,
        icon: '🔵',
    },
};

const StressMeter = ({ stressData }) => {
    const level = stressData?.stress_level || 'Normal';
    const config = STRESS_CONFIG[level] || STRESS_CONFIG['Normal'];
    const [animated, setAnimated] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => setAnimated(config.percent), 100);
        return () => clearTimeout(timeout);
    }, [level, config.percent]);

    return (
        <div className="flex flex-col gap-4">
            {/* Level Badge */}
            <motion.div
                key={level}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center justify-between p-4 rounded-xl border ${config.bg}`}
            >
                <div>
                    <p className="text-xs text-slate-400 mb-1">Current Stress Level</p>
                    <p className={`text-2xl font-bold ${config.text}`}>{config.icon} {level}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-400">Score</p>
                    <p className={`text-3xl font-black ${config.text}`}>{config.percent}</p>
                </div>
            </motion.div>

            {/* Progress Bar */}
            <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Relaxed</span>
                    <span>Critical</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${config.color}`}
                        initial={{ width: '0%' }}
                        animate={{ width: `${animated}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* Emotion Sources */}
            {stressData && (
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: 'Face Emotion', value: stressData.face_emotion },
                        { label: 'Speech Emotion', value: stressData.speech_emotion },
                    ].map(({ label, value }) => (
                        <div key={label} className="bg-slate-800/60 rounded-xl p-3 border border-slate-700">
                            <p className="text-xs text-slate-500">{label}</p>
                            <p className="text-sm font-semibold capitalize text-slate-200 mt-0.5">{value || '—'}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StressMeter;
