import React, { useState } from 'react';
import { UserIntent, EnergyLevel, SocialPreference } from '../types';
import { RotateCcw, Clock, Battery, CloudRain, Accessibility, Users, X, Check } from 'lucide-react';

interface PlansChangedModalProps {
  currentIntent: UserIntent;
  onApplyAdjustments: (adjustments: Partial<UserIntent>) => void;
  onClose: () => void;
}

export const PlansChangedModal: React.FC<PlansChangedModalProps> = ({
  currentIntent,
  onApplyAdjustments,
  onClose
}) => {
  const [duration, setDuration] = useState<number>(currentIntent.durationMinutes);
  const [energy, setEnergy] = useState<EnergyLevel>(currentIntent.energyLevel);
  const [rainy, setRainy] = useState<boolean>(false);
  const [stepFree, setStepFree] = useState<boolean>(currentIntent.mobilityPreference === 'step-free');
  const [social, setSocial] = useState<SocialPreference>(currentIntent.socialPreference);

  const handleApply = () => {
    const adjustments: Partial<UserIntent> = {
      durationMinutes: duration,
      energyLevel: energy,
      socialPreference: social,
      mobilityPreference: stepFree ? 'step-free' : undefined
    };

    if (rainy) {
      // Prioritize sheltered or porch observation
      adjustments.activityPreference = 'mindfulness';
      adjustments.energyLevel = 'low';
    }

    onApplyAdjustments(adjustments);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-nature-100 dark:bg-nature-950 text-nature-800 dark:text-nature-300 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-50">
                Plans Changed?
              </h2>
              <p className="text-[11px] text-stone-600 dark:text-stone-400">
                Adapt your mission to what is actually happening.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Time adjustment */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-nature-600 dark:text-nature-400" />
              <span>Available Time</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 45, 60].map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDuration(mins)}
                  className={`py-2 rounded-xl text-xs font-medium border text-center transition-colors ${
                    duration === mins
                      ? 'bg-nature-700 text-white border-nature-700 shadow-sm'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Energy adjustment */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5 mb-2">
              <Battery className="w-3.5 h-3.5 text-nature-600 dark:text-nature-400" />
              <span>Energy State</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'moderate', 'high'] as EnergyLevel[]).map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setEnergy(lvl)}
                  className={`py-2 rounded-xl text-xs font-medium border text-center capitalize transition-colors ${
                    energy === lvl
                      ? 'bg-nature-700 text-white border-nature-700 shadow-sm'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {lvl === 'low' ? 'Exhausted' : lvl === 'moderate' ? 'Moderate' : 'Energized'}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles: Weather and Accessibility */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => setRainy(!rainy)}
              className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                rainy
                  ? 'border-nature-500 bg-nature-50/80 dark:bg-nature-950/60 text-nature-900 dark:text-nature-200'
                  : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CloudRain className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <div>
                  <span className="font-semibold block text-xs">Weather turned wet or cold</span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">Switch to covered porch or sheltered canopy</span>
                </div>
              </div>
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${rainy ? 'bg-nature-700 border-nature-700 text-white' : 'border-stone-400'}`}>
                {rainy && <Check className="w-3 h-3" />}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStepFree(!stepFree)}
              className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                stepFree
                  ? 'border-nature-500 bg-nature-50/80 dark:bg-nature-950/60 text-nature-900 dark:text-nature-200'
                  : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Accessibility className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="font-semibold block text-xs">Need step-free / flat route</span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">Paved paths, no stairs, nearby resting benches</span>
                </div>
              </div>
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${stepFree ? 'bg-nature-700 border-nature-700 text-white' : 'border-stone-400'}`}>
                {stepFree && <Check className="w-3 h-3" />}
              </div>
            </button>
          </div>

          {/* Social dynamic */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5 mb-2">
              <Users className="w-3.5 h-3.5 text-nature-600 dark:text-nature-400" />
              <span>Company</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSocial('solo')}
                className={`py-2 rounded-xl text-xs font-medium border text-center transition-colors ${
                  social === 'solo'
                    ? 'bg-nature-700 text-white border-nature-700 shadow-sm'
                    : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50 text-stone-700 dark:text-stone-300'
                }`}
              >
                Solo Quiet Time
              </button>
              <button
                type="button"
                onClick={() => setSocial('friends')}
                className={`py-2 rounded-xl text-xs font-medium border text-center transition-colors ${
                  social === 'friends'
                    ? 'bg-nature-700 text-white border-nature-700 shadow-sm'
                    : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50 text-stone-700 dark:text-stone-300'
                }`}
              >
                With a Friend
              </button>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            Keep Current Plan
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-nature-700 hover:bg-nature-800 transition-colors shadow-sm"
          >
            Adapt Mission 🌿
          </button>
        </div>
      </div>
    </div>
  );
};
