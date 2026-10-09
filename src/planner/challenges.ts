import { OutdoorChallenge } from '../types';

export const OUTDOOR_CHALLENGES: OutdoorChallenge[] = [
  {
    id: 'five-senses',
    title: '5-Senses Grounding',
    instruction: 'Stop for 2 minutes: notice 5 things you see, 4 textures you can touch, 3 sounds you hear, 2 outdoor scents, and 1 physical feeling (wind, sun, or ground beneath your feet).',
    category: 'sensory',
    difficulty: 'easy'
  },
  {
    id: 'digital-pocket',
    title: 'Phone in Pocket',
    instruction: 'Leave your phone deep in your pocket or backpack for the entire outing. No notifications, no camera, just direct eyesight.',
    category: 'digital-detox',
    difficulty: 'easy'
  },
  {
    id: 'leaf-architectures',
    title: 'Find Three Leaf Shapes',
    instruction: 'Locate 3 distinctly different leaf patterns, shapes, or bark textures on your path without picking them.',
    category: 'botanical',
    difficulty: 'easy'
  },
  {
    id: 'sound-horizon',
    title: 'Expand Your Hearing',
    instruction: 'Close your eyes for 60 seconds. Try to hear the furthest possible sound in the distance, then the closest sound near your feet.',
    category: 'sensory',
    difficulty: 'easy'
  },
  {
    id: 'sky-watcher',
    title: 'Cloud & Canopy Gaze',
    instruction: 'Look straight up into the tree canopy or open sky for 2 uninterrupted minutes. Notice motion and shifting light.',
    category: 'mindfulness',
    difficulty: 'easy'
  },
  {
    id: 'hidden-detail',
    title: 'One Overlooked Detail',
    instruction: 'Find one tiny natural or architectural detail on a path you have walked before that you have never consciously noticed.',
    category: 'curiosity',
    difficulty: 'easy'
  },
  {
    id: 'breathing-bench',
    title: 'Ten Conscious Breaths',
    instruction: 'Sit down, drop your shoulders, and take 10 slow, deep belly breaths of fresh outside air without checking the time.',
    category: 'mindfulness',
    difficulty: 'easy'
  },
  {
    id: 'texture-touch',
    title: 'Touch Three Natural Surfaces',
    instruction: 'Touch raw tree bark, weathered stone or brick, and fresh grass or fallen leaves to physically connect with natural textures.',
    category: 'sensory',
    difficulty: 'easy'
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
