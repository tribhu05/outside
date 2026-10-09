import { UserIntent, EnergyLevel, BudgetType, MoodType, ActivityPreference, SocialPreference, LocationTypePreference, TimeOfDay } from '../types';

export function validateUserIntent(input: unknown): UserIntent {
  const data = (typeof input === 'object' && input !== null) ? (input as Record<string, unknown>) : {};

  // 1. Duration validation
  let duration = 45;
  if (typeof data.durationMinutes === 'number' && !isNaN(data.durationMinutes)) {
    duration = Math.round(data.durationMinutes);
  } else if (typeof data.durationMinutes === 'string') {
    const parsed = parseInt(data.durationMinutes, 10);
    if (!isNaN(parsed)) duration = parsed;
  }
  // Clamp between 15 and 240 mins
  duration = Math.max(15, Math.min(240, duration));

  // 2. Energy level
  const validEnergy: EnergyLevel[] = ['low', 'moderate', 'high'];
  const energyLevel: EnergyLevel = (typeof data.energyLevel === 'string' && validEnergy.includes(data.energyLevel.toLowerCase() as EnergyLevel))
    ? (data.energyLevel.toLowerCase() as EnergyLevel)
    : 'moderate';

  // 3. Mood
  const validMoods: MoodType[] = ['stressed', 'tired', 'restless', 'reflective', 'curious', 'social', 'neutral'];
  const mood: MoodType = (typeof data.mood === 'string' && validMoods.includes(data.mood.toLowerCase() as MoodType))
    ? (data.mood.toLowerCase() as MoodType)
    : 'neutral';

  // 4. Budget
  const validBudgets: BudgetType[] = ['free', 'low-cost'];
  const budget: BudgetType = (typeof data.budget === 'string' && validBudgets.includes(data.budget.toLowerCase() as BudgetType))
    ? (data.budget.toLowerCase() as BudgetType)
    : 'free';

  // 5. Activity preference
  const validActivities: ActivityPreference[] = [
    'walking', 'nature-observation', 'mindfulness', 'reading', 'sketching', 'jogging', 'cycling', 'exploration', 'any'
  ];
  const activityPreference: ActivityPreference = (typeof data.activityPreference === 'string' && validActivities.includes(data.activityPreference.toLowerCase() as ActivityPreference))
    ? (data.activityPreference.toLowerCase() as ActivityPreference)
    : 'any';

  // 6. Social preference
  const validSocial: SocialPreference[] = ['solo', 'friends', 'partner', 'family', 'any'];
  const socialPreference: SocialPreference = (typeof data.socialPreference === 'string' && validSocial.includes(data.socialPreference.toLowerCase() as SocialPreference))
    ? (data.socialPreference.toLowerCase() as SocialPreference)
    : 'solo';

  // 7. Location preference
  const validLocations: LocationTypePreference[] = ['park', 'neighborhood', 'water', 'trail', 'quiet-bench', 'campus', 'garden', 'any'];
  let locationPreference: LocationTypePreference | undefined;
  if (typeof data.locationPreference === 'string' && validLocations.includes(data.locationPreference.toLowerCase() as LocationTypePreference)) {
    locationPreference = data.locationPreference.toLowerCase() as LocationTypePreference;
  }

  // 8. Time of day
  const validTimes: TimeOfDay[] = ['morning', 'afternoon', 'sunset', 'evening', 'night'];
  let timeOfDay: TimeOfDay | undefined;
  if (typeof data.timeOfDay === 'string' && validTimes.includes(data.timeOfDay.toLowerCase() as TimeOfDay)) {
    timeOfDay = data.timeOfDay.toLowerCase() as TimeOfDay;
  }

  const notes = typeof data.notes === 'string' ? data.notes.slice(0, 200) : undefined;

  return {
    durationMinutes: duration,
    energyLevel,
    mood,
    budget,
    activityPreference,
    socialPreference,
    locationPreference,
    timeOfDay,
    notes
  };
}
