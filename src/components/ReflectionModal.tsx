import React, { useState } from 'react';
import { OutdoorPlan, AfterMood, CompletedSession } from '../types';
import { TreePine, CheckCircle2 } from 'lucide-react';

interface ReflectionModalProps {
  plan: OutdoorPlan;
  actualDurationMinutes: number;
  onSaveSession: (session: CompletedSession) => void;
  onDiscard: () => void;
}

const MOOD_OPTIONS: { key: AfterMood; emoji: string; label: string }[] = [
  { key: 'better', emoji: '😊', label: 'Better' },
  { key: 'relaxed', emoji: '😌', label: 'Relaxing' },
  { key: 'energized', emoji: '⚡', label: 'Energizing' },
  { key: 'okay', emoji: '😐', label: 'Okay' },
  { key: 'still-tired', emoji: '😴', label: 'Still tired' }
];

export const ReflectionModal: React.FC<ReflectionModalProps> = ({
  plan,
  actualDurationMinutes,
  onSaveSession,
  onDiscard
}) => {
  const [selectedMood, setSelectedMood] = useState<AfterMood>('better');
  const [reflectionNote, setReflectionNote] = useState('');
  const [challengeCompleted, setChallengeCompleted] = useState(true);

  const handleSave = () => {
    const session: CompletedSession = {
      id: 'session-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      completedAt: new Date().toISOString(),
      plannedDurationMinutes: plan.totalDurationMinutes,
      actualDurationMinutes,
      planTitle: plan.title,
      primaryActivity: plan.milestones.find(m => m.id === 'step-primary' || m.id === 'step-anchor')?.title || plan.title,
      moodBefore: plan.extractedIntent.mood,
      moodAfter: selectedMood,
      reflectionNote: reflectionNote.trim() || undefined,
      challengeCompleted: plan.challenge ? challengeCompleted : undefined,
      challengeTitle: plan.challenge?.title
    };
    onSaveSession(session);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-nature-100 dark:bg-nature-950 text-nature-800 dark:text-nature-300 flex items-center justify-center mx-auto mb-3">
            <TreePine className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50 mb-1">
            Welcome back 🌿
          </h2>
          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300">
            You spent {actualDurationMinutes} minutes outside away from screens.
          </p>
        </div>

        {/* How was it? */}
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-3 text-center">
            How do you feel now?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {MOOD_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSelectedMood(opt.key)}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  selectedMood === opt.key
                    ? 'border-nature-600 bg-nature-50/80 dark:bg-nature-950/80 text-nature-900 dark:text-nature-200 font-medium'
                    : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-850 text-stone-700 dark:text-stone-300'
                }`}
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className="text-xs">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Challenge tick if applicable */}
        {plan.challenge && (
          <div className="mb-5 p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 flex items-center justify-between">
            <div className="text-xs">
              <span className="font-semibold text-stone-900 dark:text-stone-100 block">Outdoor Challenge</span>
              <span className="text-stone-600 dark:text-stone-300">{plan.challenge.title}</span>
            </div>
            <button
              type="button"
              onClick={() => setChallengeCompleted(!challengeCompleted)}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                challengeCompleted 
                  ? 'bg-nature-700 text-white border-nature-700' 
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-300 dark:border-stone-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{challengeCompleted ? 'Completed' : 'Skipped'}</span>
            </button>
          </div>
        )}

        {/* Reflection Note */}
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
            What did you actually do or observe? (optional)
          </label>
          <textarea
            value={reflectionNote}
            onChange={(e) => setReflectionNote(e.target.value)}
            rows={2}
            placeholder="e.g. Saw golden light on the birch trees, felt the breeze, took deep breaths..."
            className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-transparent text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-nature-500 resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onDiscard}
            className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-xs sm:text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-850 font-medium transition-colors"
          >
            Skip Log
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 px-4 rounded-xl bg-nature-700 hover:bg-nature-800 dark:bg-nature-600 dark:hover:bg-nature-500 text-white font-medium text-xs sm:text-sm shadow-sm transition-all text-center"
          >
            Save to Log
          </button>
        </div>
      </div>
    </div>
  );
};
