'use client';

import { useState, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';

interface UsernameStepProps {
    onContinue: (username: string) => void;
}

export default function UsernameStep({ onContinue }: UsernameStepProps) {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    const handleContinue = () => {
        if (!username.trim()) {
            setError('Please enter a GitHub username');
            return;
        }
        if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
            setError('Invalid GitHub username format');
            return;
        }
        onContinue(username.trim());
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleContinue();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center min-h-screen px-4"
        >
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-4xl md:text-5xl lg:text-6xl font-semibold text-center text-gray-900 mb-12 max-w-3xl leading-tight"
            >
                A new era of personal software is here.
            </motion.h1>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-lg"
            >
                <div className="relative flex-1 w-full">
                    <input
                        type="text"
                        placeholder="GitHub username"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setError('');
                        }}
                        onKeyDown={handleKeyDown}
                        className="w-full px-6 py-4 rounded-full bg-white border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),_0_2px_8px_rgba(0,0,0,0.04)] focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),_0_4px_16px_rgba(0,0,0,0.08)] focus:outline-none transition-shadow duration-200 text-gray-900 placeholder-gray-400 text-lg"
                    />
                </div>
                <button
                    onClick={handleContinue}
                    className="px-8 py-4 rounded-full bg-gray-900 text-white font-medium shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-lg whitespace-nowrap"
                >
                    Continue
                </button>
            </motion.div>

            {error && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 text-red-500 text-sm"
                >
                    {error}
                </motion.p>
            )}

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-8 text-gray-400 text-sm"
            >
                Generate a timelapse of your GitHub contributions
            </motion.p>
        </motion.div>
    );
}
