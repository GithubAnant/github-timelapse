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
    availableYears: number[];
    selectedYear: number;
    onYearChange: (year: number) => void;
    onComplete: () => void;
    onBack: () => void;
}

const SCALE_FACTOR = 2; // HiDPI rendering

export default function PreviewStep({
    username,
    theme,
    data,
    availableYears,
    selectedYear,
    onYearChange,
    onComplete,
    onBack
}: PreviewStepProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const { width, height } = getCanvasDimensions();
        // Set canvas to 2x for HiDPI
        canvas.width = width * SCALE_FACTOR;
        canvas.height = height * SCALE_FACTOR;
        // CSS size stays the same
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        renderContributionChart({
            canvas,
            theme,
            data,
            username,
            scale: SCALE_FACTOR,
        });

        // Reset video when data changes
        setVideoBlob(null);
        if (videoUrl) {
            URL.revokeObjectURL(videoUrl);
            setVideoUrl(null);
        }
    }, [theme, data, username]);

    // Cleanup video URL on unmount
    useEffect(() => {
        return () => {
            if (videoUrl) {
                URL.revokeObjectURL(videoUrl);
            }
        };
    }, [videoUrl]);

    const handleGenerateAndPlay = useCallback(async () => {
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

            setVideoBlob(blob);
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
            setIsGenerating(false);
            setIsPlaying(true);
        } catch (error) {
            console.error('Error generating timelapse:', error);
            setIsGenerating(false);
        }
    }, [theme, data, username]);

    const handleDownload = useCallback(() => {
        if (videoBlob) {
            downloadBlob(videoBlob, `${username}-github-timelapse-${data.year}.webm`);
            onComplete();
        }
    }, [videoBlob, username, data.year, onComplete]);

    const handleReplay = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
        }
    }, []);

    const handleBackToPreview = useCallback(() => {
        setIsPlaying(false);
    }, []);

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
                className="absolute top-8 left-8 transition-colors flex items-center gap-2 hover:opacity-80"
                style={{ color: theme.textMuted }}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Change Theme
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
                            {data.totalContributions.toLocaleString()} contributions in {data.year}
                        </p>
                    </div>

                    {/* Year Selector */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm" style={{ color: theme.textMuted }}>Year:</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => onYearChange(Number(e.target.value))}
                            disabled={isGenerating || isPlaying}
                            className="px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: theme.empty,
                                color: theme.text,
                                border: `1px solid ${theme.border}`,
                            }}
                        >
                            {availableYears.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div
                    className="rounded-xl p-6 overflow-hidden"
                    style={{
                        backgroundColor: theme.background,
                        border: `1px solid ${theme.border}`,
                    }}
                >
                    {isPlaying && videoUrl ? (
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            autoPlay
                            className="mx-auto rounded-lg"
                            style={{ maxWidth: '100%' }}
                            onEnded={() => { }}
                        />
                    ) : (
                        <canvas
                            ref={canvasRef}
                            className="mx-auto"
                        />
                    )}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mt-8 flex flex-col items-center"
                >
                    {isGenerating ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-64 h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.empty }}>
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: theme.levels[4] }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                                    transition={{ duration: 0.1 }}
                                />
                            </div>
                            <p style={{ color: theme.textMuted }}>
                                Generating... Day {progress.current} of {progress.total}
                            </p>
                        </div>
                    ) : isPlaying ? (
                        <div className="flex gap-4">
                            <button
                                onClick={handleReplay}
                                className="px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                                style={{
                                    backgroundColor: theme.empty,
                                    color: theme.text,
                                    border: `1px solid ${theme.border}`,
                                }}
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Replay
                                </span>
                            </button>
                            <button
                                onClick={handleBackToPreview}
                                className="px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                                style={{
                                    backgroundColor: theme.empty,
                                    color: theme.text,
                                    border: `1px solid ${theme.border}`,
                                }}
                            >
                                Back to Preview
                            </button>
                            <button
                                onClick={handleDownload}
                                className="px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                                style={{
                                    backgroundColor: theme.levels[4],
                                    color: theme.name === 'Light GitHub' ? '#ffffff' : theme.background,
                                }}
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download
                                </span>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleGenerateAndPlay}
                            className="px-8 py-4 rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-lg"
                            style={{
                                backgroundColor: theme.levels[4],
                                color: theme.name === 'Light GitHub' ? '#ffffff' : theme.background,
                            }}
                        >
                            <span className="flex items-center gap-3">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                Watch Timelapse
                            </span>
                        </button>
                    )}
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
