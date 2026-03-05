import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Brain, Zap } from 'lucide-react';

const Navbar = ({ backendStatus }) => {
    return (
        <motion.nav
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="glass sticky top-0 z-50 px-6 py-4"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Heart className="text-red-500" fill="currentColor" size={28} />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold gradient-heading">MAITRI</h1>
                        <p className="text-xs text-slate-400 -mt-1">Multimodal AI Well-Being Monitor</p>
                    </div>
                </div>

                {/* Center Pills */}
                <div className="hidden md:flex items-center gap-4">
                    {[
                        { icon: Brain, label: 'Face Analysis', color: 'text-indigo-400' },
                        { icon: Activity, label: 'Speech Monitor', color: 'text-purple-400' },
                        { icon: Zap, label: 'Stress Engine', color: 'text-cyan-400' },
                    ].map(({ icon: Icon, label, color }) => (
                        <div key={label} className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-full text-sm border border-slate-700">
                            <Icon size={14} className={color} />
                            <span className="text-slate-300">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Backend Status */}
                <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700">
                    <span
                        className={`w-2 h-2 rounded-full ${backendStatus === 'online' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}
                    />
                    <span className="text-xs text-slate-300">
                        {backendStatus === 'online' ? 'Backend Online' : 'Backend Offline'}
                    </span>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
