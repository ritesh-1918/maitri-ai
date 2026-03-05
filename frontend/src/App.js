import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import { checkStatus } from './api';
import './index.css';

function App() {
    const [backendStatus, setBackendStatus] = useState('offline');

    useEffect(() => {
        const ping = async () => {
            try {
                await checkStatus();
                setBackendStatus('online');
            } catch {
                setBackendStatus('offline');
            }
        };
        ping();
        const interval = setInterval(ping, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <Navbar backendStatus={backendStatus} />
            <main>
                <Dashboard />
            </main>
        </div>
    );
}

export default App;
