'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import UsernameStep from '@/components/steps/UsernameStep';
import ThemeStep from '@/components/steps/ThemeStep';
import PreviewStep from '@/components/steps/PreviewStep';
import SuccessStep from '@/components/steps/SuccessStep';
import { themes, ThemeKey } from '@/lib/themes';
import { ContributionData, getContributionData, getAvailableYears } from '@/lib/github';

type Step = 'username' | 'theme' | 'preview' | 'success';

export default function Home() {
  const [step, setStep] = useState<Step>('username');
  const [username, setUsername] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>('dark');
  const [contributionData, setContributionData] = useState<ContributionData | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears] = useState(getAvailableYears());
  const [isLoading, setIsLoading] = useState(false);

  const handleUsernameSubmit = useCallback(async (name: string) => {
    setUsername(name);
    setIsLoading(true);

    try {
      const data = await getContributionData(name, selectedYear);
      setContributionData(data);
      setStep('theme');
    } catch (error) {
      console.error('Error fetching contribution data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear]);

  const handleThemeSelect = useCallback((theme: ThemeKey) => {
    setSelectedTheme(theme);
    setStep('preview');
  }, []);

  const handleYearChange = useCallback(async (year: number) => {
    setSelectedYear(year);
    setIsLoading(true);

    try {
      const data = await getContributionData(username, year);
      setContributionData(data);
    } catch (error) {
      console.error('Error fetching contribution data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  const handleComplete = useCallback(() => {
    setStep('success');
  }, []);

  const handleCreateAnother = useCallback(() => {
    setStep('username');
    setUsername('');
    setSelectedTheme('dark');
    setContributionData(null);
    setSelectedYear(new Date().getFullYear());
  }, []);

  const handleBackToUsername = useCallback(() => {
    setStep('username');
  }, []);

  const handleBackToTheme = useCallback(() => {
    setStep('theme');
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin" />
          <p className="text-gray-500">Fetching contributions from GitHub...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <AnimatePresence mode="wait">
        {step === 'username' && (
          <UsernameStep key="username" onContinue={handleUsernameSubmit} />
        )}
        {step === 'theme' && (
          <ThemeStep
            key="theme"
            onSelect={handleThemeSelect}
            onBack={handleBackToUsername}
          />
        )}
        {step === 'preview' && contributionData && (
          <PreviewStep
            key="preview"
            username={username}
            theme={themes[selectedTheme]}
            data={contributionData}
            availableYears={availableYears}
            selectedYear={selectedYear}
            onYearChange={handleYearChange}
            onComplete={handleComplete}
            onBack={handleBackToTheme}
          />
        )}
        {step === 'success' && (
          <SuccessStep
            key="success"
            username={username}
            onCreateAnother={handleCreateAnother}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
