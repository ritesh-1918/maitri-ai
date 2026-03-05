import React from 'react';
import { Mic } from 'lucide-react';

const SpeechEmotion = () => {
    return (
        <div className="h-40 bg-slate-900 rounded-lg flex flex-col items-center justify-center border border-slate-600">
            <Mic className="text-primary mb-2" size={32} />
            <span className="text-slate-400">Microphone Input Placeholder</span>
        </div>
    );
};

export default SpeechEmotion;
