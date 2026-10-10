import { CompletedSession, AfterMood } from '../types';

const STORAGE_KEY = 'outside_completed_sessions_v1';

export function sanitizeSession(raw: unknown): CompletedSession | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Record<string, unknown>;

  if (typeof s.id !== 'string' || !s.id.trim()) return null;
  if (typeof s.planTitle !== 'string' || !s.planTitle.trim()) return null;

  const plannedDurationMinutes =
    typeof s.plannedDurationMinutes === 'number' && !isNaN(s.plannedDurationMinutes) && s.plannedDurationMinutes > 0
      ? s.plannedDurationMinutes
      : 30;

  const actualDurationMinutes =
    typeof s.actualDurationMinutes === 'number' && !isNaN(s.actualDurationMinutes) && s.actualDurationMinutes >= 0
      ? s.actualDurationMinutes
      : plannedDurationMinutes;

  const completedAt =
    typeof s.completedAt === 'string' && !isNaN(Date.parse(s.completedAt))
      ? s.completedAt
      : new Date().toISOString();

  const primaryActivity =
    typeof s.primaryActivity === 'string' && s.primaryActivity.trim()
      ? s.primaryActivity
      : s.planTitle;

  const moodBefore =
    typeof s.moodBefore === 'string' && s.moodBefore.trim()
      ? s.moodBefore
      : 'neutral';

  const validAfterMoods: AfterMood[] = ['better', 'relaxed', 'energized', 'okay', 'still-tired'];
  const moodAfter: AfterMood =
    typeof s.moodAfter === 'string' && validAfterMoods.includes(s.moodAfter as AfterMood)
      ? (s.moodAfter as AfterMood)
      : 'better';

  const reflectionNote =
    typeof s.reflectionNote === 'string' && s.reflectionNote.trim()
      ? s.reflectionNote.trim()
      : undefined;

  const challengeCompleted =
    typeof s.challengeCompleted === 'boolean' ? s.challengeCompleted : undefined;

  const challengeTitle =
    typeof s.challengeTitle === 'string' && s.challengeTitle.trim()
      ? s.challengeTitle.trim()
      : undefined;

  const fullOutingCompleted =
    typeof s.fullOutingCompleted === 'boolean' ? s.fullOutingCompleted : true;

  const validNextPrefs = ['similar', 'different', 'any'] as const;
  const nextTimePreference =
    typeof s.nextTimePreference === 'string' && validNextPrefs.includes(s.nextTimePreference as any)
      ? (s.nextTimePreference as 'similar' | 'different' | 'any')
      : undefined;

  return {
    id: s.id,
    completedAt,
    plannedDurationMinutes,
    actualDurationMinutes,
    planTitle: s.planTitle,
    primaryActivity,
    moodBefore,
    moodAfter,
    reflectionNote,
    challengeCompleted,
    challengeTitle,
    fullOutingCompleted,
    nextTimePreference
  };
}

export function getSessions(): CompletedSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(item => sanitizeSession(item))
      .filter((s): s is CompletedSession => s !== null);
  } catch (e) {
    console.error('Failed to parse completed sessions:', e);
    return [];
  }
}

export function saveSession(session: CompletedSession): CompletedSession[] {
  const current = getSessions();
  const sanitized = sanitizeSession(session);
  if (!sanitized) return current;
  const updated = [sanitized, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save session:', e);
  }
  return updated;
}

export function deleteSession(id: string): CompletedSession[] {
  const current = getSessions();
  const updated = current.filter(s => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete session:', e);
  }
  return updated;
}

export function clearSessions(): CompletedSession[] {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear sessions:', e);
    }
  }
  return [];
}

export function getOutdoorStats(sessions: CompletedSession[]) {
  const totalMinutes = sessions.reduce((acc, s) => acc + (s.actualDurationMinutes || s.plannedDurationMinutes), 0);
  const totalSessions = sessions.length;
  
  // Calculate how many reported feeling better, relaxed, or energized
  const positiveCount = sessions.filter(s => 
    s.moodAfter === 'better' || s.moodAfter === 'relaxed' || s.moodAfter === 'energized'
  ).length;

  const moodImprovementRate = totalSessions > 0 ? Math.round((positiveCount / totalSessions) * 100) : 100;

  return {
    totalMinutes,
    totalSessions,
    moodImprovementRate
  };
}

export const SAMPLE_SESSIONS: CompletedSession[] = [
  {
    id: 'sample-1',
    completedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    plannedDurationMinutes: 45,
    actualDurationMinutes: 50,
    planTitle: 'Gentle Outside Reset: Mindful Decompression Walk',
    primaryActivity: 'Mindful Decompression Walk',
    moodBefore: 'stressed',
    moodAfter: 'relaxed',
    reflectionNote: 'Walked through the park loop without checking my phone once. Noticed the evening golden light on the birch trees.',
    challengeCompleted: true,
    challengeTitle: '5-Senses Grounding'
  },
  {
    id: 'sample-2',
    completedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    plannedDurationMinutes: 30,
    actualDurationMinutes: 30,
    planTitle: 'Quiet Bench Reflection',
    primaryActivity: 'Park Bench Reflection',
    moodBefore: 'tired',
    moodAfter: 'better',
    reflectionNote: 'Sat by the garden fountain and closed my eyes for 10 slow breaths. Felt my shoulders drop.',
    challengeCompleted: true,
    challengeTitle: 'Ten Conscious Breaths'
  },
  {
    id: 'sample-3',
    completedAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    plannedDurationMinutes: 60,
    actualDurationMinutes: 65,
    planTitle: 'Neighborhood Micro-Discovery',
    primaryActivity: 'Neighborhood Micro-Discovery',
    moodBefore: 'restless',
    moodAfter: 'energized',
    reflectionNote: 'Explored two side streets I always drive past. Found three different leaf shapes on the oak trees.',
    challengeCompleted: true,
    challengeTitle: 'Find Three Leaf Shapes'
  }
];

export function seedSampleSessions(): CompletedSession[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_SESSIONS));
  } catch (e) {
    console.error('Failed to seed sample sessions:', e);
  }
  return SAMPLE_SESSIONS;
}

