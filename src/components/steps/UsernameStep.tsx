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
                className="text-4xl md:text-5xl lg:text-6xl font-semibold text-center text-gray-900 mb-4 max-w-3xl leading-tight"
            >
                Your GitHub story,
                <br />
                <span className="bg-linear-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                    in motion.
                </span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="text-gray-500 text-lg mb-10 text-center max-w-md"
            >
                Generate a beautiful timelapse video of your contribution chart
            </motion.p>

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
                        className="w-full px-6 py-4 rounded-full bg-white border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.08)] focus:outline-none transition-shadow duration-200 text-gray-900 placeholder-gray-400 text-xl"
                    />
                </div>
                <div className="button-wrap">
                    <div className="button-shadow"></div>
                    <button onClick={handleContinue}>
                        <span>Continue</span>
                    </button>
                </div>
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
        </motion.div>
    );
}
