import React from 'react';

const StressMeter = () => {
    return (
        <div className="p-4">
            <div className="w-full bg-slate-700 rounded-full h-4 mb-2">
                <div className="bg-gradient-to-r from-green-400 to-red-500 h-4 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <div className="flex justify-between text-sm text-slate-400">
                <span>Relaxed</span>
                <span>Stressed</span>
            </div>
        </div>
    );
};

export default StressMeter;
