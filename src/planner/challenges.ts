import { OutdoorChallenge } from '../types';

export const OUTDOOR_CHALLENGES: OutdoorChallenge[] = [
  {
    id: 'five-senses',
    title: '5-Senses Grounding',
    instruction: 'Stop for 2 minutes: notice 5 things you see, 4 textures you can touch, 3 sounds you hear, 2 outdoor scents, and 1 physical feeling (wind, sun, or ground beneath your feet).',
    category: 'sensory',
    difficulty: 'easy',
    suggestedDurationMinutes: 2,
    completionAction: 'Name all 5 senses in sequence in your mind.',
    reflectionPrompt: 'Which sense brought you most immediately into the present moment?'
  },
  {
    id: 'digital-pocket',
    title: 'Phone in Pocket',
    instruction: 'Leave your phone deep in your pocket or backpack for the entire outing. No notifications, no camera, just direct eyesight.',
    category: 'digital-detox',
    difficulty: 'easy',
    suggestedDurationMinutes: 15,
    completionAction: 'Keep your hands free of screens until you return home.',
    reflectionPrompt: 'Did you notice a physical reflex to reach for your phone?'
  },
  {
    id: 'leaf-architectures',
    title: 'Find Three Leaf Shapes',
    instruction: 'Locate 3 distinctly different leaf patterns, shapes, or bark textures on your path without picking or damaging them.',
    category: 'botanical',
    difficulty: 'easy',
    suggestedDurationMinutes: 5,
    completionAction: 'Inspect the vein patterns on 3 different leaves.',
    reflectionPrompt: 'What geometric patterns or symmetry stood out most?'
  },
  {
    id: 'sound-horizon',
    title: 'Notice Five Distinct Sounds',
    instruction: 'Close your eyes for 90 seconds. Listen past nearby footsteps to identify 5 distinct sounds: birdsong, wind in leaves, distant traffic, distant chatter, water, or rustling.',
    category: 'sensory',
    difficulty: 'easy',
    suggestedDurationMinutes: 2,
    completionAction: 'Count 5 separate natural or ambient sound sources.',
    reflectionPrompt: 'Which was the quietest or most distant sound you were able to catch?'
  },
  {
    id: 'sky-watcher',
    title: 'Observe the Sky for Two Minutes',
    instruction: 'Look straight up into the tree canopy or open sky for 2 uninterrupted minutes. Watch moving clouds, birds soaring, and gradients of daylight.',
    category: 'mindfulness',
    difficulty: 'easy',
    suggestedDurationMinutes: 2,
    completionAction: 'Hold an unbroken gaze toward the open horizon or clouds.',
    reflectionPrompt: 'How did resting your eyes on the distance change how your head felt?'
  },
  {
    id: 'hidden-detail',
    title: 'One Overlooked Detail',
    instruction: 'Find one tiny natural or architectural detail on a path you have walked before that you have never consciously noticed before.',
    category: 'curiosity',
    difficulty: 'easy',
    suggestedDurationMinutes: 3,
    completionAction: 'Pause and examine the detail closely for 30 seconds.',
    reflectionPrompt: 'Why do you think your attention rushed past it on previous days?'
  },
  {
    id: 'breathing-bench',
    title: 'Ten Conscious Breaths',
    instruction: 'Sit down, drop your shoulders, and take 10 slow, deep belly breaths of fresh outside air without checking the time.',
    category: 'mindfulness',
    difficulty: 'easy',
    suggestedDurationMinutes: 3,
    completionAction: 'Count 10 complete cycles of inhalation and exhalation.',
    reflectionPrompt: 'How did your shoulder and neck muscles feel on breath 10 compared to breath 1?'
  },
  {
    id: 'texture-touch',
    title: 'Touch Three Natural Textures',
    instruction: 'Touch raw tree bark, weathered stone or brick, and fresh grass or dry soil without damaging living plants to physically ground yourself.',
    category: 'sensory',
    difficulty: 'easy',
    suggestedDurationMinutes: 3,
    completionAction: 'Touch 3 different natural textures with bare hands.',
    reflectionPrompt: 'Which texture felt most unexpectedly rough, cool, or smooth?'
  },
  {
    id: 'headphones-free-walk',
    title: 'Five Minutes Without Headphones',
    instruction: 'Remove headphones or earbuds for at least 5 minutes where safe. Reconnect your ears directly to the raw acoustics of your physical environment.',
    category: 'digital-detox',
    difficulty: 'easy',
    suggestedDurationMinutes: 5,
    completionAction: 'Pocket your earbuds and walk listening purely to open-air sounds.',
    reflectionPrompt: 'Did silence from audio streams make your thoughts feel clearer or louder?'
  }
];

export function getRecommendedChallenge(
  categoryPreference?: 'sensory' | 'botanical' | 'mindfulness' | 'curiosity' | 'digital-detox'
): OutdoorChallenge {
  if (categoryPreference) {
    const matched = OUTDOOR_CHALLENGES.filter(c => c.category === categoryPreference);
    if (matched.length > 0) {
      return matched[Math.floor(Math.random() * matched.length)];
    }
  }
  return OUTDOOR_CHALLENGES[Math.floor(Math.random() * OUTDOOR_CHALLENGES.length)];
}
