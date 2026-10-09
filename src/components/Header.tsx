import React from 'react';
import { TreePine, History, Cpu, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  providerUsed: 'gemma' | 'heuristic';
  sessionCount: number;
  onOpenHistory: () => void;
  onOpenAISettings: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onResetToInput: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  providerUsed,
  sessionCount,
  onOpenHistory,
  onOpenAISettings,
  darkMode,
  onToggleDarkMode,
  onResetToInput
}) => {
  return (
    <header className="w-full border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <button 
          onClick={onResetToInput}
          className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-nature-500 rounded-lg p-1"
          title="Return to input"
        >
          <div className="w-9 h-9 rounded-xl bg-nature-700 dark:bg-nature-600 flex items-center justify-center text-white shadow-sm group-hover:bg-nature-800 dark:group-hover:bg-nature-500 transition-colors">
            <TreePine className="w-5 h-5 text-nature-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
                Outside
              </span>
              <span className="hidden sm:inline-block text-[11px] font-medium tracking-wide px-2 py-0.5 rounded-full bg-nature-100 dark:bg-nature-900/60 text-nature-800 dark:text-nature-300">
                Touch Grass
              </span>
            </div>
            <p className="hidden md:block text-xs text-stone-700 dark:text-stone-300 -mt-0.5">
              Turn free time into time outside
            </p>
          </div>
        </button>

        {/* Right tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Status Badge */}
          <button
            onClick={onOpenAISettings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-850 text-stone-800 dark:text-stone-200 transition-colors"
            title="Configure AI Provider & Engine"
          >
            {providerUsed === 'gemma' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium">Gemma AI</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-stone-500" />
                <span className="font-medium text-stone-800 dark:text-stone-200">Local Engine</span>
              </>
            )}
            <Cpu className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400 ml-0.5" />
          </button>

          {/* History */}
          <button
            onClick={onOpenHistory}
            className="relative p-2 rounded-lg text-stone-800 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-850 transition-colors"
            title="Outdoor History & Stats"
            aria-label="Outdoor History"
          >
            <History className="w-4 h-4" />
            {sessionCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-nature-600 text-white text-[10px] font-bold flex items-center justify-center">
                {sessionCount > 9 ? '9+' : sessionCount}
              </span>
            )}
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-stone-800 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-850 transition-colors"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
