import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { PlanView } from './components/PlanView';
import { ScreenExitMode } from './components/ScreenExitMode';
import { ReflectionModal } from './components/ReflectionModal';
import { HistoryView } from './components/HistoryView';
import { AISettingsModal } from './components/AISettingsModal';

import { OutdoorPlan, LocationTypePreference, CompletedSession, UserIntent } from './types';
import { aiService } from './ai/aiService';
import { generateOutdoorPlan } from './planner/engine';
import { getRecommendedChallenge } from './planner/challenges';
import { getSessions, saveSession, deleteSession, seedSampleSessions, clearSessions } from './services/storage';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'input' | 'plan' | 'screen-exit'>('input');
  const [currentPlan, setCurrentPlan] = useState<OutdoorPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<'gemma' | 'heuristic'>(
    aiService.getPreferHeuristic() ? 'heuristic' : 'gemma'
  );

  // Modals & sub-flows
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);
  const [isReflectionOpen, setIsReflectionOpen] = useState(false);
  const [actualDurationMinutes, setActualDurationMinutes] = useState(0);

  // History & storage
  const [sessions, setSessions] = useState<CompletedSession[]>([]);

  // Theme
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('outside_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('outside_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('outside_theme', 'light');
    }
  }, [darkMode]);

  const handleGenerate = async (
    prompt: string, 
    locationPref?: LocationTypePreference,
    mobilityPref?: 'step-free' | 'seated' | 'any'
  ) => {
    setIsLoading(true);
    try {
      const extraction = await aiService.extractIntent(prompt);
      
      // If user selected explicit location chip, apply it
      if (locationPref && locationPref !== 'any') {
        extraction.intent.locationPreference = locationPref;
      }
      if (mobilityPref && mobilityPref !== 'any') {
        extraction.intent.mobilityPreference = mobilityPref;
      }

      const plan = generateOutdoorPlan(extraction.intent, extraction.providerUsed);
      setCurrentPlan(plan);
      setActiveProvider(extraction.providerUsed);
      setActiveView('plan');
    } catch (err) {
      console.error('Plan generation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShuffleChallenge = () => {
    if (!currentPlan) return;
    const newChallenge = getRecommendedChallenge();
    setCurrentPlan({
      ...currentPlan,
      challenge: newChallenge
    });
  };

  const handleSelectAlternative = (activityId: string) => {
    if (!currentPlan) return;
    const newPlan = generateOutdoorPlan(
      currentPlan.extractedIntent,
      currentPlan.providerUsed,
      new Date(),
      activityId
    );
    setCurrentPlan(newPlan);
  };

  const handleAdjustPlan = (adjustments: Partial<UserIntent>) => {
    if (!currentPlan) return;
    const updatedIntent: UserIntent = { ...currentPlan.extractedIntent, ...adjustments };
    const newPlan = generateOutdoorPlan(updatedIntent, currentPlan.providerUsed, new Date());
    setCurrentPlan(newPlan);
  };

  const handleStartSession = () => {
    setActiveView('screen-exit');
  };

  const handleFinishOutsideTime = (actualMinutes: number) => {
    setActualDurationMinutes(actualMinutes);
    setActiveView('input');
    setIsReflectionOpen(true);
  };

  const handleCancelSession = () => {
    setActiveView('plan');
  };

  const handleSaveSession = (newSession: CompletedSession) => {
    const updated = saveSession(newSession);
    setSessions(updated);
    setIsReflectionOpen(false);
    setCurrentPlan(null);
    setActiveView('input');
  };

  const handleDeleteSession = (id: string) => {
    const updated = deleteSession(id);
    setSessions(updated);
  };

  const handleClearAllSessions = () => {
    if (window.confirm('Are you sure you want to clear your outdoor log?')) {
      const cleared = clearSessions();
      setSessions(cleared);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100 transition-colors">
      {/* Header */}
      {activeView !== 'screen-exit' && (
        <Header
          providerUsed={activeProvider}
          sessionCount={sessions.length}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenAISettings={() => setIsAISettingsOpen(true)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onResetToInput={() => {
            setCurrentPlan(null);
            setActiveView('input');
          }}
        />
      )}

      {/* Main Content Areas */}
      <main className="flex-1 flex flex-col justify-center">
        {activeView === 'input' && (
          <InputSection
            onGenerate={handleGenerate}
            isLoading={isLoading}
            activeProvider={activeProvider}
          />
        )}

        {activeView === 'plan' && currentPlan && (
          <PlanView
            plan={currentPlan}
            onStartSession={handleStartSession}
            onBackToInput={() => setActiveView('input')}
            onShuffleChallenge={handleShuffleChallenge}
            onSelectAlternative={handleSelectAlternative}
            onAdjustPlan={handleAdjustPlan}
          />
        )}

        {activeView === 'screen-exit' && currentPlan && (
          <ScreenExitMode
            plan={currentPlan}
            onFinishSession={handleFinishOutsideTime}
            onCancelSession={handleCancelSession}
          />
        )}
      </main>

      {/* Footer (only when not in screen exit) */}
      {activeView !== 'screen-exit' && (
        <footer className="w-full border-t border-stone-200/80 dark:border-stone-850 py-6 text-center text-xs text-stone-600 dark:text-stone-300">
          <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="font-serif font-medium">Outside</span> — Open-source outdoor activity engine. Built for DEV Hacktoberfest 2026.
            </div>
            <div className="flex items-center gap-4 text-stone-700 dark:text-stone-300">
              <button 
                onClick={() => setIsAISettingsOpen(true)} 
                className="hover:text-stone-900 dark:hover:text-stone-100 underline underline-offset-2"
              >
                Gemma / Heuristic Architecture
              </button>
              <span>·</span>
              <button 
                onClick={() => setIsHistoryOpen(true)} 
                className="hover:text-stone-900 dark:hover:text-stone-100 underline underline-offset-2"
              >
                Local Log
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Modals */}
      {isReflectionOpen && currentPlan && (
        <ReflectionModal
          plan={currentPlan}
          actualDurationMinutes={actualDurationMinutes}
          onSaveSession={handleSaveSession}
          onDiscard={() => {
            setIsReflectionOpen(false);
            setCurrentPlan(null);
          }}
        />
      )}

      {isHistoryOpen && (
        <HistoryView
          sessions={sessions}
          onClose={() => setIsHistoryOpen(false)}
          onDeleteSession={handleDeleteSession}
          onClearAll={handleClearAllSessions}
          onSeedSamples={() => setSessions(seedSampleSessions())}
        />
      )}

      {isAISettingsOpen && (
        <AISettingsModal
          onClose={() => setIsAISettingsOpen(false)}
          onConfigChanged={() => {
            setActiveProvider(aiService.getPreferHeuristic() ? 'heuristic' : 'gemma');
          }}
        />
      )}
    </div>
  );
};
