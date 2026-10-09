import { describe, it, expect } from 'vitest';
import { generateOutdoorPlan, selectBestActivity } from '../src/planner/engine';
import { UserIntent } from '../src/types';

describe('Outdoor Activity Engine', () => {
  const baseIntent: UserIntent = {
    durationMinutes: 45,
    energyLevel: 'moderate',
    mood: 'neutral',
    budget: 'free',
    activityPreference: 'any',
    socialPreference: 'solo'
  };

  describe('selectBestActivity', () => {
    it('prioritizes user activity preference when specified', () => {
      const intent: UserIntent = {
        ...baseIntent,
        activityPreference: 'reading'
      };
      const activity = selectBestActivity(intent);
      expect(activity.category).toBe('reading');
    });

    it('matches low energy intent with low energy activity', () => {
      const intent: UserIntent = {
        ...baseIntent,
        energyLevel: 'low',
        mood: 'tired'
      };
      const activity = selectBestActivity(intent);
      expect(activity.suitableEnergyLevels).toContain('low');
    });

    it('matches high energy intent with active outdoor movement', () => {
      const intent: UserIntent = {
        ...baseIntent,
        energyLevel: 'high',
        activityPreference: 'jogging'
      };
      const activity = selectBestActivity(intent);
      expect(activity.suitableEnergyLevels).toContain('high');
      expect(activity.category).toBe('jogging');
    });

    it('selects social activity when socialPreference is friends', () => {
      const intent: UserIntent = {
        ...baseIntent,
        socialPreference: 'friends',
        mood: 'social'
      };
      const activity = selectBestActivity(intent);
      expect(activity.suitableSocial).toContain('friends');
    });
  });

  describe('generateOutdoorPlan', () => {
    it('generates a realistic plan for a 90-minute evening walk', () => {
      const intent: UserIntent = {
        durationMinutes: 90,
        energyLevel: 'low',
        mood: 'stressed',
        budget: 'free',
        activityPreference: 'walking',
        socialPreference: 'solo',
        timeOfDay: 'evening'
      };

      const startTime = new Date('2026-10-09T18:00:00');
      const plan = generateOutdoorPlan(intent, 'heuristic', startTime);

      expect(plan.totalDurationMinutes).toBe(90);
      expect(plan.milestones.length).toBeGreaterThanOrEqual(4);

      // Check departure milestone starts at 6:00 PM
      expect(plan.milestones[0].timeLabel).toBe('6:00 PM');
      expect(plan.milestones[0].id).toBe('step-depart');

      // Check done milestone exists
      const lastMilestone = plan.milestones[plan.milestones.length - 1];
      expect(lastMilestone.id).toBe('step-done');

      // Check challenge exists
      expect(plan.challenge).toBeDefined();
      expect(plan.challenge?.instruction.length).toBeGreaterThan(10);

      // Check preparation tips
      expect(plan.preparationTips.length).toBeGreaterThan(0);
    });

    it('handles short 20-minute sessions gracefully', () => {
      const intent: UserIntent = {
        ...baseIntent,
        durationMinutes: 20
      };
      const plan = generateOutdoorPlan(intent);
      expect(plan.totalDurationMinutes).toBe(20);
      expect(plan.milestones.length).toBeGreaterThanOrEqual(3);
    });

    it('properly stamps providerUsed in generated plan', () => {
      const planGemma = generateOutdoorPlan(baseIntent, 'gemma');
      expect(planGemma.providerUsed).toBe('gemma');

      const planHeuristic = generateOutdoorPlan(baseIntent, 'heuristic');
      expect(planHeuristic.providerUsed).toBe('heuristic');
    });
  });
});
