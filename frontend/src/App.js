import React from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';

function App() {
    return (
        <div className="min-h-screen bg-background text-white">
            <Navbar />
            <main className="container mx-auto p-4">
                <Dashboard />
            </main>
        </div>
    );
}

export default App;
