import { describe, it, expect } from 'vitest';
import { getOutdoorStats, sanitizeSession } from '../src/services/storage';
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

  describe('sanitizeSession', () => {
    it('validates and sanitizes well-formed sessions', () => {
      const raw = {
        id: 'sess-123',
        planTitle: 'Park Walk',
        plannedDurationMinutes: 45,
        actualDurationMinutes: 50,
        fullOutingCompleted: true,
        nextTimePreference: 'similar'
      };
      const sanitized = sanitizeSession(raw);
      expect(sanitized).not.toBeNull();
      expect(sanitized?.id).toBe('sess-123');
      expect(sanitized?.planTitle).toBe('Park Walk');
      expect(sanitized?.actualDurationMinutes).toBe(50);
      expect(sanitized?.fullOutingCompleted).toBe(true);
      expect(sanitized?.nextTimePreference).toBe('similar');
    });

    it('rejects null, non-objects, or items without id and title', () => {
      expect(sanitizeSession(null)).toBeNull();
      expect(sanitizeSession(undefined)).toBeNull();
      expect(sanitizeSession('corrupted-string')).toBeNull();
      expect(sanitizeSession({ id: '123' })).toBeNull();
      expect(sanitizeSession({ planTitle: 'Walk' })).toBeNull();
    });

    it('provides safe fallbacks for corrupted properties', () => {
      const sanitized = sanitizeSession({
        id: 'sess-fallback',
        planTitle: 'Quick Breath Outside',
        plannedDurationMinutes: 'invalid' as any,
        actualDurationMinutes: -10,
        moodAfter: 'invalid-mood' as any
      });
      expect(sanitized).not.toBeNull();
      expect(sanitized?.plannedDurationMinutes).toBe(30);
      expect(sanitized?.actualDurationMinutes).toBe(30);
      expect(sanitized?.moodAfter).toBe('better');
      expect(sanitized?.fullOutingCompleted).toBe(true);
    });
  });
});
