import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STRESS_CONFIG = {
    'High Stress': { color: '#ef4444', label: 'High Stress', icon: '🔴', percent: 90, glow: 'rgba(239,68,68,0.5)' },
    'Moderate': { color: '#f59e0b', label: 'Moderate Stress', icon: '🟡', percent: 55, glow: 'rgba(245,158,11,0.5)' },
    'Relaxed': { color: '#10b981', label: 'Relaxed', icon: '🟢', percent: 20, glow: 'rgba(16,185,129,0.5)' },
    'Normal': { color: '#38bdf8', label: 'Baseline', icon: '🔵', percent: 8, glow: 'rgba(56,189,248,0.5)' },
};

// ... (CircularGauge remains same)

const StressMeter = ({ stressData }) => {
    // Sync with backend naming: 'Relaxed', 'Moderate', 'High Stress'
    const level = stressData?.stress_level || 'Normal';
    const config = STRESS_CONFIG[level] || STRESS_CONFIG['Normal'];
    const realPercent = stressData?.stress_score !== undefined ? stressData.stress_score : config.percent;
    const [displayPercent, setDisplayPercent] = useState(0);

    // Animate counter
    useEffect(() => {
        let start = 0;
        const target = realPercent;
        if (target === 0) {
            setDisplayPercent(0);
            return;
        }
        const step = Math.max(1, Math.ceil(target / 30));
        const timer = setInterval(() => {
            start += step;
            if (start >= target) {
                setDisplayPercent(target);
                clearInterval(timer);
            } else {
                setDisplayPercent(start);
            }
        }, 20);
        return () => clearInterval(timer);
    }, [realPercent]);

    return (
        <div className="flex flex-col items-center gap-4">

            {/* Circular Gauge */}
            <div className="relative flex items-center justify-center">
                <CircularGauge
                    percent={displayPercent}
                    color={config.color}
                    glow={config.glow}
                />
                {/* Center label */}
                <div className="absolute flex flex-col items-center">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={level}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="text-4xl"
                        >
                            {config.icon}
                        </motion.span>
                    </AnimatePresence>
                    <motion.p
                        key={`pct-${level}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-2xl font-black tabular-nums"
                        style={{ color: config.color }}
                    >
                        {displayPercent}
                    </motion.p>
                    <p className="text-xs text-slate-400">/100</p>
                </div>
            </div>

            {/* Stress Label */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={level}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                    className="text-center"
                >
                    <p
                        className="text-xl font-extrabold tracking-tight"
                        style={{ color: config.color }}
                    >
                        {config.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Current well-being status</p>
                </motion.div>
            </AnimatePresence>

            {/* Legend bar */}
            <div className="w-full h-2 rounded-full overflow-hidden bg-gradient-to-r from-sky-400 via-yellow-400 to-red-500 opacity-60" />
            <div className="flex justify-between w-full text-xs text-slate-500 -mt-2">
                <span>Relaxed</span>
                <span>Moderate</span>
                <span>Critical</span>
            </div>

            {/* Emotion source pills */}
            {stressData && (
                <div className="grid grid-cols-2 gap-2 w-full mt-1">
                    {[
                        { label: 'Face', value: stressData.face_emotion, dot: '#818cf8' },
                        { label: 'Speech', value: stressData.speech_emotion, dot: '#a78bfa' },
                    ].map(({ label, value, dot }) => (
                        <div key={label} className="bg-slate-800/60 rounded-xl px-3 py-2 border border-slate-700 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot }} />
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500">{label}</p>
                                <p className="text-xs font-semibold text-slate-200 capitalize truncate">{value || '—'}</p>
                            </div>
                        </div>
                    ))}
                    {stressData.derived_state && (
                        <div className="col-span-2 bg-indigo-900/40 rounded-xl px-3 py-2 border border-indigo-500/30 flex items-center justify-between mt-1">
                            <span className="text-xs text-indigo-300 font-medium">Cognitive State</span>
                            <span className="text-sm font-bold text-indigo-100 capitalize tracking-wide">{stressData.derived_state}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StressMeter;
