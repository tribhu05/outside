export type EnergyLevel = 'low' | 'moderate' | 'high';
export type BudgetType = 'free' | 'low-cost';
export type SocialPreference = 'solo' | 'friends' | 'partner' | 'family' | 'kids' | 'any';
export type MoodType = 'stressed' | 'tired' | 'restless' | 'reflective' | 'curious' | 'social' | 'neutral';
export type ActivityPreference = 
  | 'walking' 
  | 'nature-observation' 
  | 'mindfulness' 
  | 'reading' 
  | 'sketching' 
  | 'jogging' 
  | 'cycling' 
  | 'exploration' 
  | 'any';

export type LocationTypePreference = 
  | 'park' 
  | 'neighborhood' 
  | 'water' 
  | 'trail' 
  | 'quiet-bench' 
  | 'campus' 
  | 'garden'
  | 'any';

export type TimeOfDay = 'morning' | 'afternoon' | 'sunset' | 'evening' | 'night';

export interface UserIntent {
  durationMinutes: number;
  energyLevel: EnergyLevel;
  mood: MoodType;
  budget: BudgetType;
  activityPreference: ActivityPreference;
  socialPreference: SocialPreference;
  locationPreference?: LocationTypePreference;
  timeOfDay?: TimeOfDay;
  notes?: string;
}

export interface OutdoorChallenge {
  id: string;
  title: string;
  instruction: string;
  category: 'sensory' | 'botanical' | 'mindfulness' | 'curiosity' | 'digital-detox';
  difficulty: 'easy' | 'moderate';
}

export interface PlanMilestone {
  id: string;
  timeLabel: string;
  minuteOffset: number;
  durationMinutes: number;
  title: string;
  description: string;
  iconName: string;
  actionGuidance?: string;
}

export interface PlanAlternative {
  activityId: string;
  name: string;
  tagline: string;
  iconName: string;
  energyLevel: EnergyLevel;
  budget: BudgetType;
  durationMinutes: number;
}

export interface OutdoorPlan {
  id: string;
  createdAt: string;
  title: string;
  tagline: string;
  totalDurationMinutes: number;
  energyLevel: EnergyLevel;
  budget: BudgetType;
  socialMode: SocialPreference;
  preparationTips: string[];
  milestones: PlanMilestone[];
  challenge?: OutdoorChallenge;
  intentSummary: string;
  extractedIntent: UserIntent;
  providerUsed: 'gemma' | 'heuristic';
  alternatives?: PlanAlternative[];
}

export type AfterMood = 'better' | 'relaxed' | 'energized' | 'okay' | 'still-tired';

export interface CompletedSession {
  id: string;
  completedAt: string;
  plannedDurationMinutes: number;
  actualDurationMinutes: number;
  planTitle: string;
  primaryActivity: string;
  moodBefore: string;
  moodAfter: AfterMood;
  reflectionNote?: string;
  challengeCompleted?: boolean;
  challengeTitle?: string;
}

export interface AIServiceConfig {
  endpoint: string;
  model: string;
  timeoutMs: number;
  useFallbackOnly: boolean;
}
