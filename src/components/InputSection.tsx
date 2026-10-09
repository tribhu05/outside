import React, { useState } from 'react';
import { ArrowRight, Compass, Sparkles, MapPin } from 'lucide-react';
import { LocationTypePreference } from '../types';

interface InputSectionProps {
  onGenerate: (prompt: string, locationPref?: LocationTypePreference) => void;
  isLoading: boolean;
  activeProvider: 'gemma' | 'heuristic';
}

const EXAMPLE_PROMPTS = [
  "I have 45 minutes and need to clear my head.",
  "I have 90 minutes free this evening. I don't want to spend money and I want something relaxing.",
  "Plan something fun with two friends.",
  "I don't want to spend any money.",
  "I want something active this evening.",
  "I have 2 hours, I'm tired, and I don't want anything expensive."
];

const LOCATION_OPTIONS: { label: string; value: LocationTypePreference }[] = [
  { label: 'Anywhere', value: 'any' },
  { label: 'Local Park', value: 'park' },
  { label: 'Neighborhood', value: 'neighborhood' },
  { label: 'Quiet Bench', value: 'quiet-bench' },
  { label: 'Trail / Woods', value: 'trail' },
  { label: 'Waterfront', value: 'water' },
  { label: 'Campus / Plaza', value: 'campus' }
];

export const InputSection: React.FC<InputSectionProps> = ({
  onGenerate,
  isLoading,
  activeProvider
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationTypePreference>('any');
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onGenerate(prompt.trim(), selectedLocation !== 'any' ? selectedLocation : undefined);
  };

  const handleSelectExample = (example: string) => {
    setPrompt(example);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-14 animate-fade-in">
      {/* Philosophy banner */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nature-100/80 dark:bg-nature-950/80 border border-nature-200 dark:border-nature-800 text-nature-800 dark:text-nature-300 text-xs font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5 text-nature-600 dark:text-nature-400" />
          <span>AI understands you. The app gets you outside.</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-semibold tracking-tight text-stone-900 dark:text-stone-50 mb-3 leading-tight">
          What do you feel like doing outside?
        </h1>
        <p className="text-stone-700 dark:text-stone-300 text-base sm:text-lg max-w-lg mx-auto">
          Share your free time, energy, and mood. We'll turn it into a realistic step-by-step outdoor plan.
        </p>
      </div>

      {/* Main input card */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm transition-all focus-within:ring-2 focus-within:ring-nature-600/40 focus-within:border-nature-600">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={3}
            placeholder="e.g. I have 90 minutes free this evening. I don't want to spend money and I want something relaxing..."
            className="w-full resize-none p-4 sm:p-5 text-base sm:text-lg bg-transparent text-stone-900 dark:text-stone-50 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none rounded-2xl"
          />

          {/* Bar controls */}
          <div className="px-4 pb-4 pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 dark:border-stone-850">
            {/* Optional Location Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLocationPicker(!showLocationPicker)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                title="Optional location setting"
              >
                <MapPin className="w-3.5 h-3.5 text-nature-600 dark:text-nature-400" />
                <span>
                  {selectedLocation === 'any' ? 'Nearby Setting' : LOCATION_OPTIONS.find(l => l.value === selectedLocation)?.label}
                </span>
              </button>

              {showLocationPicker && (
                <div className="absolute bottom-full left-0 mb-2 w-48 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-lg z-20 text-xs">
                  <div className="px-3 py-1 text-[11px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                    Preferred Space
                  </div>
                  {LOCATION_OPTIONS.map((loc) => (
                    <button
                      key={loc.value}
                      type="button"
                      onClick={() => {
                        setSelectedLocation(loc.value);
                        setShowLocationPicker(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors ${
                        selectedLocation === loc.value ? 'font-semibold text-nature-700 dark:text-nature-400' : 'text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <span>{loc.label}</span>
                      {selectedLocation === loc.value && <span className="w-1.5 h-1.5 rounded-full bg-nature-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-nature-700 hover:bg-nature-800 dark:bg-nature-600 dark:hover:bg-nature-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-nature-500"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Planning...</span>
                </>
              ) : (
                <>
                  <span>Plan Outside Time</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Engine indicator */}
        <div className="mt-2 text-right">
          <span className="text-[11px] text-stone-700 dark:text-stone-300">
            {activeProvider === 'gemma' ? 'Analyzing with Google Gemma' : 'Using local heuristic activity engine'}
          </span>
        </div>
      </form>

      {/* Suggested prompts */}
      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-3 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5" />
          <span>Try an example</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EXAMPLE_PROMPTS.map((ex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectExample(ex)}
              disabled={isLoading}
              className="text-left p-3 rounded-xl border border-stone-200/80 dark:border-stone-800/80 bg-white/50 dark:bg-stone-900/40 hover:bg-white dark:hover:bg-stone-900 hover:border-nature-300 dark:hover:border-nature-700 text-xs sm:text-sm text-stone-700 dark:text-stone-300 transition-all text-balance"
            >
              “{ex}”
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
