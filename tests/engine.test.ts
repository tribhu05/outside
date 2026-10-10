import { describe, it, expect } from 'vitest';
import { generateOutdoorPlan, selectBestActivity, rankActivities } from '../src/planner/engine';
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

    it('computes top suitable alternatives for a plan', () => {
      const plan = generateOutdoorPlan(baseIntent);
      expect(plan.alternatives).toBeDefined();
      expect(plan.alternatives?.length).toBeGreaterThanOrEqual(1);
      expect(plan.alternatives?.[0].activityId).toBeDefined();
      expect(plan.alternatives?.[0].name).toBeDefined();
    });

    it('respects forcedActivityId when switching plans to an alternative', () => {
      const initialPlan = generateOutdoorPlan(baseIntent);
      const alt = initialPlan.alternatives?.[0];
      expect(alt).toBeDefined();

      if (alt) {
        const switchedPlan = generateOutdoorPlan(baseIntent, 'heuristic', new Date(), alt.activityId);
        expect(switchedPlan.title).toContain(alt.name);
      }
    });

    it('ranks activities deterministically via rankActivities', () => {
      const ranked = rankActivities(baseIntent);
      expect(ranked.length).toBeGreaterThan(0);
      expect(ranked[0].score).toBeGreaterThanOrEqual(ranked[ranked.length - 1].score);
    });

    it('attaches itemsToBring, safetyNote, and indoorShelteredAlternative to the generated plan', () => {
      const plan = generateOutdoorPlan(baseIntent);
      expect(plan.itemsToBring).toBeDefined();
      expect(Array.isArray(plan.itemsToBring)).toBe(true);
      expect(plan.safetyNote).toBeDefined();
      expect(typeof plan.safetyNote).toBe('string');
      expect(plan.indoorShelteredAlternative).toBeDefined();
      expect(typeof plan.indoorShelteredAlternative).toBe('string');
    });

    it('enriches micro-challenge with suggestedDuration, completionAction, and reflectionPrompt', () => {
      const plan = generateOutdoorPlan(baseIntent);
      expect(plan.challenge).toBeDefined();
      expect(plan.challenge?.suggestedDurationMinutes).toBeGreaterThan(0);
      expect(plan.challenge?.completionAction).toBeDefined();
      expect(plan.challenge?.reflectionPrompt).toBeDefined();
    });

    it('prioritizes step-free and sheltered activities when mobility or shelter requested', () => {
      const mobilityIntent: UserIntent = {
        ...baseIntent,
        mobilityPreference: 'step-free'
      };
      const activity = selectBestActivity(mobilityIntent);
      expect(activity.mobilityFriendly).toBe(true);
    });

    it('adapts plan dynamically when user intent is adjusted (Plans changed flow)', () => {
      const initialIntent: UserIntent = {
        ...baseIntent,
        durationMinutes: 60,
        energyLevel: 'moderate'
      };
      const initialPlan = generateOutdoorPlan(initialIntent);
      expect(initialPlan.totalDurationMinutes).toBe(60);

      // User adjusts: sudden rain, only 15 minutes left, exhausted, step-free
      const adjustedIntent: UserIntent = {
        ...initialPlan.extractedIntent,
        durationMinutes: 15,
        energyLevel: 'low',
        weatherCondition: 'rainy',
        mobilityPreference: 'step-free'
      };
      const adaptedPlan = generateOutdoorPlan(adjustedIntent, initialPlan.providerUsed);
      expect(adaptedPlan.totalDurationMinutes).toBe(15);
      expect(adaptedPlan.energyLevel).toBe('low');
      expect(adaptedPlan.extractedIntent.durationMinutes).toBe(15);
      expect(adaptedPlan.extractedIntent.mobilityPreference).toBe('step-free');
      expect(adaptedPlan.indoorShelteredAlternative).toBeDefined();

      const selectedActivity = selectBestActivity(adjustedIntent);
      expect(selectedActivity.suitableEnergyLevels).toContain('low');
      expect(selectedActivity.mobilityFriendly).toBe(true);
    });
  });
});
