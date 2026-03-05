import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, Title, Tooltip, Legend, Filler
);

const EmotionChart = ({ emotionHistory }) => {
    const labels = emotionHistory.map((_, i) => `T-${emotionHistory.length - i}`).reverse();

    // Encode emotions to numeric for charting
    const EMOTION_SCORES = {
        happy: 5, surprise: 4, neutral: 3, sad: 2, fear: 1, disgust: 1, angry: 0,
    };
    const faceData = emotionHistory.map(e => EMOTION_SCORES[e.face] ?? 3);
    const speechData = emotionHistory.map(e => EMOTION_SCORES[e.speech] ?? 3);

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: '#94a3b8', font: { size: 12 } } },
            tooltip: {
                backgroundColor: '#1a2235',
                titleColor: '#e2e8f0',
                bodyColor: '#94a3b8',
                borderColor: '#1e3a5f',
                borderWidth: 1,
            },
        },
        scales: {
            x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
            y: {
                min: 0, max: 5,
                ticks: {
                    color: '#64748b',
                    callback: v => ['angry', 'fear', 'sad', 'neutral', 'surprise', 'happy'][v] ?? v,
                },
                grid: { color: '#1e293b' },
            },
        },
    };

    const lineData = {
        labels,
        datasets: [
            {
                label: 'Face Emotion',
                data: faceData,
                borderColor: '#818cf8',
                backgroundColor: 'rgba(129,140,248,0.15)',
                fill: true, tension: 0.4, pointRadius: 5,
                pointBackgroundColor: '#818cf8',
            },
            {
                label: 'Speech Emotion',
                data: speechData,
                borderColor: '#a78bfa',
                backgroundColor: 'rgba(167,139,250,0.10)',
                fill: true, tension: 0.4, pointRadius: 5,
                pointBackgroundColor: '#a78bfa',
            },
        ],
    };

    if (emotionHistory.length === 0) {
        return (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
                No data yet — start analyzing to populate chart
            </div>
        );
    }

    return (
        <div className="h-56">
            <Line data={lineData} options={lineOptions} />
        </div>
    );
};

export default EmotionChart;
