import React, { useState } from 'react';
import { aiService, ConnectionHealth } from '../ai/aiService';
import { 
  X, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Terminal, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

interface AISettingsModalProps {
  onClose: () => void;
  onConfigChanged: () => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({
  onClose,
  onConfigChanged
}) => {
  const currentConfig = aiService.getConfig();
  const [endpoint, setEndpoint] = useState(currentConfig.endpoint);
  const [model, setModel] = useState(currentConfig.model);
  const [preferFallback, setPreferFallback] = useState(aiService.getPreferHeuristic());
  const [healthStatus, setHealthStatus] = useState<ConnectionHealth | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setHealthStatus(null);
    // Apply temporary values for testing
    aiService.updateConfig({ endpoint, model });
    const health = await aiService.testGemmaHealth();
    setHealthStatus(health);
    setIsTesting(false);
  };

  const handleSave = () => {
    aiService.updateConfig({ endpoint, model });
    aiService.setPreferHeuristic(preferFallback);
    onConfigChanged();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-nature-600 dark:text-nature-400" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-50">
              AI Engine & Privacy
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-50 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* Architecture principle */}
          <div className="p-4 rounded-xl bg-nature-50 dark:bg-nature-950/60 border border-nature-200 dark:border-nature-900/60">
            <div className="flex items-center gap-2 font-semibold text-nature-800 dark:text-nature-300 mb-1 text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-nature-600" />
              <span>Core Philosophy</span>
            </div>
            <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-xs sm:text-sm">
              Outside uses <strong>Google Gemma</strong> strictly to extract structured human intent (duration, energy, mood, budget). A deterministic activity engine creates the realistic outdoor plan. AI never invents arbitrary schedules.
            </p>
          </div>

          {/* Fallback mode toggle */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50">
            <div>
              <label htmlFor="offline-mode-toggle" className="font-semibold text-stone-900 dark:text-stone-100 text-xs sm:text-sm block cursor-pointer">
                Offline Heuristic Engine
              </label>
              <p className="text-stone-600 dark:text-stone-300 text-xs mt-0.5">
                Always use local regex and deterministic NLP parsing without sending requests to Gemma.
              </p>
            </div>
            <input
              id="offline-mode-toggle"
              type="checkbox"
              aria-label="Offline Heuristic Engine"
              checked={preferFallback}
              onChange={(e) => setPreferFallback(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-nature-600 focus:ring-nature-500 cursor-pointer"
            />
          </div>

          {/* Local Gemma Settings */}
          {!preferFallback && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-xs">
                  Gemma Endpoint Configuration
                </span>
                <span className="text-[11px] text-stone-600 dark:text-stone-300">
                  Default: Ollama OpenAI-compatible API
                </span>
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 text-xs mb-1 font-medium">
                  Endpoint URL
                </label>
                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="http://localhost:11434/v1/chat/completions"
                  className="w-full p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 font-mono text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-nature-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 text-xs mb-1 font-medium">
                  Model Identifier
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="gemma2:2b"
                  className="w-full p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 font-mono text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-nature-500"
                />
              </div>

              {/* Test Button */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-3.5 py-2 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium text-stone-800 dark:text-stone-200 inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                </button>

                {healthStatus && (
                  <div className="flex items-center gap-1.5 text-xs">
                    {healthStatus.isOnline ? (
                      <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Connected ({healthStatus.latencyMs}ms)
                      </span>
                    ) : (
                      <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-4 h-4" />
                        Offline (Falling back to local heuristic)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* How to run Ollama */}
              <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-850">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Run Gemma locally with Ollama</span>
                </div>
                <code className="block bg-stone-200/70 dark:bg-stone-900 p-2 rounded text-[11px] font-mono text-stone-800 dark:text-stone-200 select-all">
                  ollama run gemma2:2b
                </code>
                <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1.5">
                  If Ollama isn't running, Outside automatically uses the built-in deterministic heuristic engine.
                </p>
              </div>
            </div>
          )}

          {/* Privacy promise */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2 text-stone-600 dark:text-stone-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-nature-600 flex-shrink-0" />
            <span>Zero cloud analytics. All history and settings stay 100% in your browser.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-850 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-nature-700 hover:bg-nature-800 dark:bg-nature-600 dark:hover:bg-nature-500 text-white text-xs sm:text-sm font-medium shadow-sm transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
