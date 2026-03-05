import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: '10am', score: 65 },
    { name: '11am', score: 59 },
    { name: '12pm', score: 80 },
    { name: '1pm', score: 81 },
    { name: '2pm', score: 56 },
    { name: '3pm', score: 55 },
    { name: '4pm', score: 40 },
];

const EmotionChart = () => {
    return (
        <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#818cf8' }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={3} dot={{ fill: '#818cf8' }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EmotionChart;
