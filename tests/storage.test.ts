import { describe, it, expect } from 'vitest';
import { getOutdoorStats } from '../src/services/storage';
import { CompletedSession } from '../src/types';

describe('Storage & Wellbeing Statistics', () => {
  it('calculates aggregate statistics correctly', () => {
    const mockSessions: CompletedSession[] = [
      {
        id: '1',
        completedAt: '2026-10-08T18:00:00Z',
        plannedDurationMinutes: 45,
        actualDurationMinutes: 45,
        planTitle: 'Mindful Walk',
        primaryActivity: 'Mindful Decompression Walk',
        moodBefore: 'stressed',
        moodAfter: 'better'
      },
      {
        id: '2',
        completedAt: '2026-10-09T08:00:00Z',
        plannedDurationMinutes: 30,
        actualDurationMinutes: 35,
        planTitle: 'Nature Sitting',
        primaryActivity: 'Park Bench Reflection',
        moodBefore: 'tired',
        moodAfter: 'relaxed'
      },
      {
        id: '3',
        completedAt: '2026-10-09T14:00:00Z',
        plannedDurationMinutes: 60,
        actualDurationMinutes: 60,
        planTitle: 'Active Jog',
        primaryActivity: 'Brisk Green Trail Run',
        moodBefore: 'restless',
        moodAfter: 'okay'
      }
    ];

    const stats = getOutdoorStats(mockSessions);
    expect(stats.totalMinutes).toBe(140);
    expect(stats.totalSessions).toBe(3);
    // 2 out of 3 sessions were 'better' or 'relaxed' -> 67%
    expect(stats.moodImprovementRate).toBe(67);
  });

  it('handles empty sessions safely', () => {
    const stats = getOutdoorStats([]);
    expect(stats.totalMinutes).toBe(0);
    expect(stats.totalSessions).toBe(0);
    expect(stats.moodImprovementRate).toBe(100);
  });
});
