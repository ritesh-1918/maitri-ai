import React, { useEffect, useState, useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { checkStatus } from '../api';

ChartJS.register(
    CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler
);

const STRESS_SCORES = {
    'High Stress': 90,
    'Medium Stress': 55,
    'Low Stress': 20,
    'Normal': 10,
};

const STRESS_COLORS = {
    90: '#ef4444',
    55: '#f59e0b',
    20: '#10b981',
    10: '#38bdf8',
};

const EmotionChart = ({ emotionHistory }) => {
    // Build time-stamped data from history
    const [dataPoints, setDataPoints] = useState([]);
    const startTime = useRef(Date.now());

    // Derive stress from each history entry
    const deriveStress = (face, speech) => {
        const high = ['angry', 'fear'];
        if (high.includes(face) || high.includes(speech)) return 'High Stress';
        if (face === 'sad' || speech === 'sad') return 'Medium Stress';
        if (face === 'happy' || speech === 'happy') return 'Low Stress';
        return 'Normal';
    };

    // Update data whenever emotionHistory changes
    useEffect(() => {
        if (emotionHistory.length === 0) return;
        const latest = emotionHistory[emotionHistory.length - 1];
        const stressLevel = deriveStress(latest.face, latest.speech);
        const score = STRESS_SCORES[stressLevel] || 10;
        const elapsed = Math.round((Date.now() - startTime.current) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        const timeLabel = `${mins}:${secs.toString().padStart(2, '0')}`;

        setDataPoints(prev => [
            ...prev.slice(-29), // keep last 30 points
            { time: timeLabel, score, level: stressLevel },
        ]);
    }, [emotionHistory]);

    // Chart options
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 600,
            easing: 'easeInOutQuart',
        },
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: '#94a3b8',
                    font: { size: 12, family: 'Inter' },
                    usePointStyle: true,
                    pointStyle: 'circle',
                },
            },
            tooltip: {
                backgroundColor: '#1a2235',
                titleColor: '#e2e8f0',
                bodyColor: '#94a3b8',
                borderColor: '#1e3a5f',
                borderWidth: 1,
                cornerRadius: 8,
                callbacks: {
                    label: (ctx) => {
                        const point = dataPoints[ctx.dataIndex];
                        return point ? `${point.level} (${point.score}/100)` : '';
                    },
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time',
                    color: '#64748b',
                    font: { size: 11, family: 'Inter' },
                },
                ticks: { color: '#4b5563', font: { size: 10 } },
                grid: { color: '#1e293b', drawBorder: false },
            },
            y: {
                min: 0,
                max: 100,
                title: {
                    display: true,
                    text: 'Stress Level',
                    color: '#64748b',
                    font: { size: 11, family: 'Inter' },
                },
                ticks: {
                    color: '#4b5563',
                    font: { size: 10 },
                    stepSize: 20,
                    callback: (v) => {
                        if (v >= 80) return '🔴 High';
                        if (v >= 40) return '🟡 Medium';
                        if (v >= 15) return '🟢 Low';
                        return '🔵 Normal';
                    },
                },
                grid: { color: '#1e293b', drawBorder: false },
            },
        },
    };

    // Build gradient for the line
    const chartData = {
        labels: dataPoints.map(d => d.time),
        datasets: [
            {
                label: 'Stress Level',
                data: dataPoints.map(d => d.score),
                borderColor: '#818cf8',
                backgroundColor: 'rgba(129, 140, 248, 0.12)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointBackgroundColor: dataPoints.map(d => STRESS_COLORS[d.score] || '#818cf8'),
                pointBorderColor: dataPoints.map(d => STRESS_COLORS[d.score] || '#818cf8'),
                pointBorderWidth: 2,
            },
        ],
    };

    if (dataPoints.length === 0) {
        return (
            <div className="h-52 flex flex-col items-center justify-center text-slate-500 gap-2">
                <div className="flex items-end gap-0.5 h-8 opacity-40">
                    {[12, 24, 18, 32, 14, 26, 20].map((h, i) => (
                        <div key={i} className="w-2 bg-indigo-500/50 rounded-sm" style={{ height: h }} />
                    ))}
                </div>
                <p className="text-sm">No data yet — start analyzing to populate chart</p>
                <p className="text-xs text-slate-600">Use camera &amp; speech detection to generate data points</p>
            </div>
        );
    }

    return (
        <div className="h-64">
            <Line data={chartData} options={options} />
        </div>
    );
};

export default EmotionChart;
