import { describe, it, expect } from 'vitest';
import { validateUserIntent } from '../src/ai/validator';

describe('validateUserIntent', () => {
  it('returns sensible defaults when given empty object', () => {
    const validated = validateUserIntent({});
    expect(validated.durationMinutes).toBe(45);
    expect(validated.energyLevel).toBe('moderate');
    expect(validated.mood).toBe('neutral');
    expect(validated.budget).toBe('free');
    expect(validated.activityPreference).toBe('any');
    expect(validated.socialPreference).toBe('solo');
  });

  it('clamps duration between 15 and 240 minutes', () => {
    expect(validateUserIntent({ durationMinutes: 5 }).durationMinutes).toBe(15);
    expect(validateUserIntent({ durationMinutes: 500 }).durationMinutes).toBe(240);
    expect(validateUserIntent({ durationMinutes: 60 }).durationMinutes).toBe(60);
  });

  it('normalizes string input for duration', () => {
    expect(validateUserIntent({ durationMinutes: '90' }).durationMinutes).toBe(90);
  });

  it('rejects invalid energy level and falls back to moderate', () => {
    const validated = validateUserIntent({ energyLevel: 'supercharged' });
    expect(validated.energyLevel).toBe('moderate');
  });

  it('preserves valid structured fields', () => {
    const validated = validateUserIntent({
      durationMinutes: 90,
      energyLevel: 'low',
      mood: 'stressed',
      budget: 'free',
      activityPreference: 'walking',
      socialPreference: 'solo',
      locationPreference: 'park',
      timeOfDay: 'evening'
    });

    expect(validated.durationMinutes).toBe(90);
    expect(validated.energyLevel).toBe('low');
    expect(validated.mood).toBe('stressed');
    expect(validated.budget).toBe('free');
    expect(validated.activityPreference).toBe('walking');
    expect(validated.socialPreference).toBe('solo');
    expect(validated.locationPreference).toBe('park');
    expect(validated.timeOfDay).toBe('evening');
  });
});
