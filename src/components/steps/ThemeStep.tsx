'use client';

import { motion } from 'framer-motion';
import { themes, ThemeKey, Theme } from '@/lib/themes';

interface ThemeStepProps {
    onSelect: (theme: ThemeKey) => void;
    onBack: () => void;
}

function MiniContributionGrid({ theme }: { theme: Theme }) {
    // Generate mini preview grid (5 rows x 12 columns)
    const rows = 5;
    const cols = 12;

    return (
        <div className="flex gap-0.5">
            {Array.from({ length: cols }).map((_, col) => (
                <div key={col} className="flex flex-col gap-0.5">
                    {Array.from({ length: rows }).map((_, row) => {
                        // Create a pattern that looks like real contributions
                        const level = Math.random() > 0.5
                            ? Math.floor(Math.random() * 5)
                            : 0;
                        return (
                            <div
                                key={row}
                                className="w-2 h-2 rounded-sm"
                                style={{ backgroundColor: theme.levels[level] }}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

// Staggered card animation variants
const cardVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.8, rotateX: 15 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 100,
            damping: 15,
            delay: 0.2 + i * 0.15,
        },
    }),
    hover: {
        y: -12,
        scale: 1.03,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        transition: {
            type: 'spring' as const,
            stiffness: 400,
            damping: 25,
        },
    },
    tap: {
        scale: 0.97,
        transition: {
            type: 'spring' as const,
            stiffness: 400,
            damping: 20,
        },
    },
};

export default function ThemeStep({ onSelect, onBack }: ThemeStepProps) {
    const themeEntries = Object.entries(themes) as [ThemeKey, Theme][];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center min-h-screen px-4"
        >
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                onClick={onBack}
                className="absolute top-8 left-8 text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
            </motion.button>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-3xl md:text-4xl font-semibold text-center text-gray-900 mb-4"
            >
                Choose your theme
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="text-gray-500 mb-12 text-center"
            >
                Pick the style that matches your vibe
            </motion.p>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-8"
                style={{ perspective: '1000px' }}
            >
                {themeEntries.map(([key, theme], index) => (
                    <motion.button
                        key={key}
                        custom={index}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        whileTap="tap"
                        onClick={() => onSelect(key)}
                        className="group p-8 rounded-2xl transition-colors duration-300 border-2 border-transparent hover:border-gray-200/50 shadow-xl"
                        style={{
                            backgroundColor: theme.background,
                            transformStyle: 'preserve-3d',
                        }}
                    >
                        <div className="w-56">
                            <h3
                                className="text-lg font-medium mb-5 text-left"
                                style={{ color: theme.text }}
                            >
                                {theme.name}
                            </h3>
                            <div className="p-4 rounded-xl" style={{ backgroundColor: theme.background }}>
                                <MiniContributionGrid theme={theme} />
                            </div>
                            <div className="mt-5 flex items-center gap-1.5 justify-center">
                                {theme.levels.map((color, i) => (
                                    <div
                                        key={i}
                                        className="w-4 h-4 rounded-sm"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.button>
                ))}
            </motion.div>
        </motion.div>
    );
}
