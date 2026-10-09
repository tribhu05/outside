import React, { useState, useEffect } from 'react';
import { OutdoorPlan, PlanMilestone } from '../types';
import { playSingingBowlChime } from '../utils/audio';
import { 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  TreePine
} from 'lucide-react';

interface ScreenExitModeProps {
  plan: OutdoorPlan;
  onFinishSession: (actualMinutes: number) => void;
  onCancelSession: () => void;
}

export const ScreenExitMode: React.FC<ScreenExitModeProps> = ({
  plan,
  onFinishSession,
  onCancelSession
}) => {
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(plan.totalDurationMinutes * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play gentle bell on entrance
  useEffect(() => {
    if (soundEnabled) {
      playSingingBowlChime(432);
    }
  }, []);

  // Screen Wake Lock API if available
  useEffect(() => {
    let wakeLock: any = null;
    if ('wakeLock' in navigator) {
      (navigator as any).wakeLock.request('screen').then((lock: any) => {
        wakeLock = lock;
      }).catch(() => {
        // Ignore if user denies or unsupported
      });
    }
    return () => {
      if (wakeLock && wakeLock.release) {
        wakeLock.release().catch(() => {});
      }
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter out the 0-minute 'Done' milestone for active step navigation
  const activeMilestones = plan.milestones.filter(m => m.durationMinutes > 0);
  const currentMilestone: PlanMilestone = activeMilestones[currentMilestoneIndex] || activeMilestones[0];

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleNextPhase = () => {
    if (currentMilestoneIndex < activeMilestones.length - 1) {
      setCurrentMilestoneIndex(prev => prev + 1);
      if (soundEnabled) playSingingBowlChime(528);
    } else {
      handleComplete();
    }
  };

  const handlePrevPhase = () => {
    if (currentMilestoneIndex > 0) {
      setCurrentMilestoneIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    const actualMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    if (soundEnabled) playSingingBowlChime(432);
    onFinishSession(actualMinutes);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 text-stone-100 flex flex-col justify-between p-6 sm:p-10 select-none animate-fade-in overflow-y-auto">
      {/* Top minimal status bar */}
      <div className="flex items-center justify-between max-w-xl mx-auto w-full">
        <div className="flex items-center gap-2 text-stone-400 text-xs">
          <TreePine className="w-4 h-4 text-nature-400" />
          <span className="font-serif tracking-wider uppercase">Go Outside Mode</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 text-stone-400 hover:text-stone-200 transition-colors"
            title={soundEnabled ? "Mute chimes" : "Enable chimes"}
            aria-label="Toggle chime sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={onCancelSession}
            className="text-xs text-stone-400 hover:text-stone-200 px-2 py-1 rounded transition-colors"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Main Focus Center */}
      <div className="max-w-xl mx-auto w-full my-auto text-center py-8">
        {/* Step indicator */}
        <div className="text-xs font-mono tracking-widest text-nature-400 mb-3 uppercase">
          Phase {currentMilestoneIndex + 1} of {activeMilestones.length}
        </div>

        {/* Current Activity Title */}
        <h2 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-stone-100 mb-6 leading-tight">
          {currentMilestone?.title}
        </h2>

        {/* The One Simple Instruction */}
        <div className="max-w-md mx-auto mb-10">
          <p className="text-stone-300 text-base sm:text-xl font-light leading-relaxed">
            {currentMilestone?.actionGuidance || currentMilestone?.description}
          </p>
        </div>

        {/* Big Serene Countdown */}
        <div className="inline-block p-6 sm:p-8 rounded-3xl bg-stone-900/60 border border-stone-800 mb-8 backdrop-blur-sm">
          <div className="text-5xl sm:text-7xl font-mono font-light tracking-tight text-nature-200 mb-2">
            {formatTime(secondsRemaining)}
          </div>
          <div className="text-xs text-stone-400 uppercase tracking-widest font-mono">
            {secondsRemaining > 0 ? 'Remaining Time Outside' : 'Time Complete'}
          </div>
        </div>

        {/* The Sacred Reminder */}
        <div className="max-w-sm mx-auto">
          <p className="text-sm font-serif italic text-nature-300/80 mb-2">
            “Put your phone away when you're ready.”
          </p>
          <p className="text-xs text-stone-500">
            The real world doesn't live on this screen.
          </p>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="max-w-xl mx-auto w-full pt-4">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handlePrevPhase}
            disabled={currentMilestoneIndex === 0}
            className="px-4 py-3 rounded-xl border border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700 disabled:opacity-20 disabled:cursor-not-allowed text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <button
            onClick={handleComplete}
            className="flex-1 py-3.5 px-6 rounded-xl bg-nature-600 hover:bg-nature-500 text-white font-medium text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-nature-400"
          >
            <CheckCircle className="w-5 h-5 text-nature-200" />
            <span>I'm Back / Done Outside</span>
          </button>

          <button
            onClick={handleNextPhase}
            disabled={currentMilestoneIndex === activeMilestones.length - 1}
            className="px-4 py-3 rounded-xl border border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700 disabled:opacity-20 disabled:cursor-not-allowed text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
