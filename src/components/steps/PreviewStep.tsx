'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Theme } from '@/lib/themes';
import { ContributionData } from '@/lib/github';
import { renderContributionChart, getCanvasDimensions } from '@/lib/chartRenderer';
import { generateTimelapse, downloadBlob } from '@/lib/videoGenerator';

interface PreviewStepProps {
    username: string;
    theme: Theme;
    data: ContributionData;
    onComplete: () => void;
    onBack: () => void;
}

export default function PreviewStep({ username, theme, data, onComplete, onBack }: PreviewStepProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const { width, height } = getCanvasDimensions();
        canvas.width = width;
        canvas.height = height;

        renderContributionChart({
            canvas,
            theme,
            data,
            username,
        });
    }, [theme, data, username]);

    const handleGenerate = useCallback(async () => {
        setIsGenerating(true);
        setProgress({ current: 0, total: 0 });

        try {
            const blob = await generateTimelapse({
                theme,
                data,
                username,
                onProgress: (current, total) => {
                    setProgress({ current, total });
                },
            });

            downloadBlob(blob, `${username}-github-timelapse.webm`);
            onComplete();
        } catch (error) {
            console.error('Error generating timelapse:', error);
            setIsGenerating(false);
        }
    }, [theme, data, username, onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center min-h-screen px-4 py-12"
            style={{ backgroundColor: theme.background }}
        >
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                onClick={onBack}
                className="absolute top-8 left-8 transition-colors flex items-center gap-2"
                style={{ color: theme.textMuted }}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
            </motion.button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="w-full max-w-4xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-semibold" style={{ color: theme.text }}>
                            @{username}
                        </h2>
                        <p className="text-sm" style={{ color: theme.textMuted }}>
                            {data.totalContributions} contributions in {data.year}
                        </p>
                    </div>
                </div>

                <div
                    className="rounded-xl p-6 overflow-x-auto"
                    style={{
                        backgroundColor: theme.background,
                        border: `1px solid ${theme.border}`,
                    }}
                >
                    <canvas
                        ref={canvasRef}
                        className="mx-auto"
                        style={{ maxWidth: '100%', height: 'auto' }}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mt-8 flex flex-col items-center"
                >
                    {isGenerating ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: theme.levels[4] }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                                    transition={{ duration: 0.1 }}
                                />
                            </div>
                            <p style={{ color: theme.textMuted }}>
                                Day {progress.current} of {progress.total}
                            </p>
                        </div>
                    ) : (
                        <button
                            onClick={handleGenerate}
                            className="px-8 py-4 rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-lg"
                            style={{
                                backgroundColor: theme.levels[4],
                                color: theme.name === 'Light GitHub' ? '#ffffff' : theme.background,
                            }}
                        >
                            Download timelapse
                        </button>
                    )}
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
