import React from 'react';
import { Heart } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="bg-slate-900 border-b border-slate-800 p-4">
            <div className="container mx-auto flex items-center gap-2">
                <Heart className="text-red-500" fill="currentColor" size={24} />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    MAITRI
                </h1>
                <span className="text-slate-500 text-sm hidden md:inline ml-2">
                    Multimodal AI Assistant for Well-Being
                </span>
            </div>
        </nav>
    );
};

export default Navbar;
