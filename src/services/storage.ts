import { CompletedSession } from '../types';

const STORAGE_KEY = 'outside_completed_sessions_v1';

export function getSessions(): CompletedSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse completed sessions:', e);
    return [];
  }
}

export function saveSession(session: CompletedSession): CompletedSession[] {
  const current = getSessions();
  const updated = [session, ...current];
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

