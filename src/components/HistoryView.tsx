import React from 'react';
import { CompletedSession } from '../types';
import { getOutdoorStats } from '../services/storage';
import { 
  X, 
  Trash2, 
  Clock, 
  Calendar, 
  Sparkles, 
  Download, 
  TreePine,
  ArrowRight
} from 'lucide-react';

interface HistoryViewProps {
  sessions: CompletedSession[];
  onClose: () => void;
  onDeleteSession: (id: string) => void;
  onClearAll: () => void;
  onSeedSamples?: () => void;
}

const MOOD_EMOJI_MAP: Record<string, string> = {
  better: '😊 Better',
  relaxed: '😌 Relaxing',
  energized: '⚡ Energizing',
  okay: '😐 Okay',
  'still-tired': '😴 Still tired'
};

export const HistoryView: React.FC<HistoryViewProps> = ({
  sessions,
  onClose,
  onDeleteSession,
  onClearAll,
  onSeedSamples
}) => {
  const stats = getOutdoorStats(sessions);

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `outside-sessions-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TreePine className="w-5 h-5 text-nature-600 dark:text-nature-400" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-50">
              Outside Log
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-50 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-3 divide-x divide-stone-200 dark:divide-stone-800 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/40">
          <div className="p-4 text-center">
            <div className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
              {stats.totalMinutes}
            </div>
            <div className="text-[11px] text-stone-600 dark:text-stone-300 uppercase tracking-wider">
              Total Mins
            </div>
          </div>
          <div className="p-4 text-center">
            <div className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
              {stats.totalSessions}
            </div>
            <div className="text-[11px] text-stone-600 dark:text-stone-300 uppercase tracking-wider">
              Outings
            </div>
          </div>
          <div className="p-4 text-center">
            <div className="font-serif text-xl sm:text-2xl font-bold text-nature-700 dark:text-nature-400">
              {stats.moodImprovementRate}%
            </div>
            <div className="text-[11px] text-stone-600 dark:text-stone-300 uppercase tracking-wider">
              Mood Reset
            </div>
          </div>
        </div>

        {/* Sessions list */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              <TreePine className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No outside sessions logged yet.</p>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 mb-4">
                Generate a plan and step outside to start your log.
              </p>
              {onSeedSamples && (
                <button
                  type="button"
                  onClick={onSeedSamples}
                  className="px-3.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-850 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-medium text-nature-700 dark:text-nature-400 transition-colors shadow-sm"
                >
                  Load demo sessions for preview
                </button>
              )}
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/40 relative group"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      {session.primaryActivity}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(session.completedAt)}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-medium text-stone-700 dark:text-stone-300">
                        <Clock className="w-3 h-3" />
                        {session.actualDurationMinutes} mins outside
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteSession(session.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-red-500 transition-opacity"
                    title="Delete log entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Mood shift */}
                <div className="flex items-center gap-2 text-xs mt-2 text-stone-700 dark:text-stone-300">
                  <span className="capitalize text-stone-600 dark:text-stone-400">Before: {session.moodBefore}</span>
                  <ArrowRight className="w-3 h-3 text-stone-400" />
                  <span className="font-medium text-nature-700 dark:text-nature-400">
                    After: {MOOD_EMOJI_MAP[session.moodAfter] || session.moodAfter}
                  </span>
                </div>

                {/* Challenge tag */}
                {session.challengeTitle && (
                  <div className="text-[11px] text-stone-600 dark:text-stone-300 mt-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-nature-600" />
                    <span>Challenge: {session.challengeTitle}</span>
                    {session.challengeCompleted && (
                      <span className="text-nature-700 dark:text-nature-400 font-semibold">(Done)</span>
                    )}
                  </div>
                )}

                {/* Reflection note */}
                {session.reflectionNote && (
                  <p className="mt-2 text-xs text-stone-700 dark:text-stone-300 italic border-l-2 border-stone-300 dark:border-stone-700 pl-2">
                    “{session.reflectionNote}”
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {sessions.length > 0 && (
          <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
            <button
              onClick={handleExportJson}
              className="inline-flex items-center gap-1 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={onClearAll}
              className="text-stone-600 dark:text-stone-400 hover:text-red-500 transition-colors"
            >
              Clear Log
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
