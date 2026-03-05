import React from 'react';
import WebcamEmotion from '../components/WebcamEmotion';
import SpeechEmotion from '../components/SpeechEmotion';
import StressMeter from '../components/StressMeter';
import EmotionChart from '../components/EmotionChart';

const Dashboard = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
                <h2 className="text-xl font-bold mb-4">Real-time Emotion Analysis</h2>
                <WebcamEmotion />
            </div>
            <div className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
                <h2 className="text-xl font-bold mb-4">Speech Pattern Monitoring</h2>
                <SpeechEmotion />
            </div>
            <div className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
                <h2 className="text-xl font-bold mb-4">Well-Being Metrics</h2>
                <StressMeter />
            </div>
            <div className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
                <h2 className="text-xl font-bold mb-4">Historical Trends</h2>
                <EmotionChart />
            </div>
        </div>
    );
};

export default Dashboard;
