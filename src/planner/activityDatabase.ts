import { EnergyLevel, BudgetType, SocialPreference, MoodType, ActivityPreference, LocationTypePreference } from '../types';

export interface ActivityDefinition {
  id: string;
  name: string;
  category: ActivityPreference;
  tagline: string;
  description: string;
  minDuration: number; // in minutes
  maxDuration: number;
  suitableEnergyLevels: EnergyLevel[];
  suitableMoods: MoodType[];
  suitableBudgets: BudgetType[];
  suitableSocial: SocialPreference[];
  preferredLocations: LocationTypePreference[];
  preparationTips: string[];
  itemsToBring?: string[];
  safetyNote?: string;
  shelteredAlternative?: string;
  mobilityFriendly?: boolean;
  iconName: string;
  defaultActionGuidance: string;
}

export const ACTIVITIES: ActivityDefinition[] = [
  {
    id: 'mindful-stroll',
    name: 'Mindful Decompression Walk',
    category: 'walking',
    tagline: 'An unhurried stroll to clear mental fatigue and reset your nervous system.',
    description: 'Leave headphones in your pocket. Walk at a deliberate, gentle pace and let your eyes wander naturally without an objective.',
    minDuration: 15,
    maxDuration: 60,
    suitableEnergyLevels: ['low', 'moderate'],
    suitableMoods: ['stressed', 'tired', 'restless', 'reflective', 'neutral'],
    suitableBudgets: ['free', 'low-cost'],
    suitableSocial: ['solo', 'partner', 'any'],
    preferredLocations: ['park', 'neighborhood', 'trail', 'garden'],
    preparationTips: [
      'Put your phone on Do Not Disturb',
      'Wear comfortable flat walking shoes',
      'Leave heavy bags at home'
    ],
    iconName: 'Footprints',
    mobilityFriendly: true,
    defaultActionGuidance: 'Walk slowly enough that you could comfortably speak without losing breath.'
  },
  {
    id: 'nature-bench-sitting',
    name: 'Park Bench Reflection',
    category: 'mindfulness',
    tagline: 'Stillness among greenery to let your thoughts settle down.',
    description: 'Find a comfortable outdoor bench or grassy spot shaded by trees. Sit, relax your jaw, and observe nature unfolding without rushing.',
    minDuration: 15,
    maxDuration: 45,
    suitableEnergyLevels: ['low'],
    suitableMoods: ['tired', 'stressed', 'reflective', 'neutral'],
    suitableBudgets: ['free'],
    suitableSocial: ['solo', 'partner', 'any'],
    preferredLocations: ['park', 'garden', 'quiet-bench', 'water'],
    preparationTips: [
      'Take a light jacket or scarf if there is a breeze',
      'Sit with relaxed posture and eyes softly open'
    ],
    mobilityFriendly: true,
    iconName: 'Armchair',
    defaultActionGuidance: 'Drop your shoulders down. Simply watch trees, birds, or drifting clouds.'
  },
  {
    id: 'sensory-nature-walk',
    name: 'Sensory Observation Walk',
    category: 'nature-observation',
    tagline: 'Re-engage your physical senses with living greenery.',
    description: 'A slow exploratory walk where you consciously shift focus between tactile textures, scents of soil and plants, and natural soundscapes.',
    minDuration: 20,
    maxDuration: 90,
    suitableEnergyLevels: ['low', 'moderate'],
    suitableMoods: ['stressed', 'tired', 'curious', 'reflective'],
    suitableBudgets: ['free'],
    suitableSocial: ['solo', 'partner', 'kids', 'any'],
    preferredLocations: ['park', 'garden', 'trail'],
    preparationTips: [
      'Slip phone into your pocket or bag',
      'Prepare to pause frequently when something catches your eye'
    ],
    iconName: 'Eye',
    defaultActionGuidance: 'Notice the contrast between dark shade and direct sunlight on foliage.'
  },
  {
    id: 'outdoor-reading',
    name: 'Outdoor Book Immersion',
    category: 'reading',
    tagline: 'Read physical pages under open sky and tree shade.',
    description: 'Take a physical book or paper journal to a quiet bench, grassy knoll, or tree shade. Natural daylight reduces eye strain and deepens focus.',
    minDuration: 30,
    maxDuration: 120,
    suitableEnergyLevels: ['low', 'moderate'],
    suitableMoods: ['reflective', 'tired', 'neutral'],
    suitableBudgets: ['free', 'low-cost'],
    suitableSocial: ['solo', 'partner', 'any'],
    preferredLocations: ['park', 'garden', 'quiet-bench', 'campus'],
    preparationTips: [
      'Bring a physical paperback or notebook (not a glowing screen)',
      'A small towel or jacket to sit on the grass'
    ],
    iconName: 'BookOpen',
    defaultActionGuidance: 'Read without rushing. Glance up at the trees every few pages to relax your eyes.'
  },
  {
    id: 'outdoor-journaling',
    name: 'Outdoor Pen & Paper Reflection',
    category: 'sketching',
    tagline: 'Write or sketch your thoughts surrounded by birdsong and breeze.',
    description: 'Unclutter your mind with freehand writing or simple observational doodling outdoors. The open horizon inspires perspective.',
    minDuration: 25,
    maxDuration: 90,
    suitableEnergyLevels: ['low', 'moderate'],
    suitableMoods: ['stressed', 'reflective', 'curious', 'restless'],
    suitableBudgets: ['free'],
    suitableSocial: ['solo', 'any'],
    preferredLocations: ['park', 'garden', 'water', 'quiet-bench'],
    preparationTips: [
      'Bring a pocket notebook and favorite pen',
      'Find a bench with back support or lean against a sturdy tree'
    ],
    iconName: 'PenTool',
    defaultActionGuidance: 'Write stream-of-consciousness: what you feel, what you see right now.'
  },
  {
    id: 'neighborhood-curiosity-wander',
    name: 'Neighborhood Micro-Discovery',
    category: 'exploration',
    tagline: 'Explore streets you normally rush past with fresh eyes.',
    description: 'Pick an unfamiliar side street, alleyway, or path. Look up at rooflines, garden gates, historic markers, and brickwork details.',
    minDuration: 30,
    maxDuration: 90,
    suitableEnergyLevels: ['moderate'],
    suitableMoods: ['restless', 'curious', 'neutral'],
    suitableBudgets: ['free'],
    suitableSocial: ['solo', 'friends', 'partner', 'any'],
    preferredLocations: ['neighborhood', 'campus'],
    preparationTips: [
      'No navigation map needed; turn wherever looks interesting',
      'Keep your eyes at eye level, not pointed down at a screen'
    ],
    iconName: 'Compass',
    defaultActionGuidance: 'Turn left at every second corner, or follow the path with the most trees.'
  },
  {
    id: 'unhurried-social-ramble',
    name: 'Walk & Talk with Company',
    category: 'walking',
    tagline: 'Real-life conversation without screens or distractions.',
    description: 'Side-by-side walking is one of the most natural human ways to connect. Share stories, silent companionship, or fresh perspective.',
    minDuration: 30,
    maxDuration: 120,
    suitableEnergyLevels: ['moderate', 'high'],
    suitableMoods: ['social', 'restless', 'neutral'],
    suitableBudgets: ['free', 'low-cost'],
    suitableSocial: ['friends', 'partner', 'family'],
    preferredLocations: ['park', 'neighborhood', 'water', 'campus'],
    preparationTips: [
      'Invite a friend or family member for a no-agenda walk',
      'Grab water or stop for a quick tea if desired'
    ],
    iconName: 'Users',
    defaultActionGuidance: 'Walk side-by-side. Notice how talking feels easier while moving outdoors.'
  },
  {
    id: 'brisk-nature-jog',
    name: 'Brisk Green Trail Run',
    category: 'jogging',
    tagline: 'Clear adrenaline and restless energy with an outdoor run.',
    description: 'An invigorating jog through natural terrain or quiet paths. Feel your heart pumping and wind cooling your skin.',
    minDuration: 20,
    maxDuration: 60,
    suitableEnergyLevels: ['high'],
    suitableMoods: ['restless', 'stressed', 'neutral'],
    suitableBudgets: ['free'],
    suitableSocial: ['solo', 'friends', 'any'],
    preferredLocations: ['park', 'trail', 'water'],
    preparationTips: [
      'Running shoes and lightweight weather layers',
      'Do a 3-minute walking warmup before picking up pace'
    ],
    iconName: 'Zap',
    defaultActionGuidance: 'Pace yourself so your breath stays steady. Listen to footsteps on gravel.'
  },
  {
    id: 'outdoor-stretch-mobility',
    name: 'Open Air Mobility & Stretch',
    category: 'mindfulness',
    tagline: 'Release desk tension with open air stretching and breathing.',
    description: 'A sequence of gentle standing and bench stretches to unlock tight hips, neck, and shoulders under open sky.',
    minDuration: 15,
    maxDuration: 40,
    suitableEnergyLevels: ['low', 'moderate'],
    suitableMoods: ['tired', 'stressed', 'restless'],
    suitableBudgets: ['free'],
    suitableSocial: ['solo', 'partner', 'any'],
    preferredLocations: ['park', 'garden', 'quiet-bench'],
    preparationTips: [
      'Wear clothes that allow freedom of movement',
      'Use a park bench for gentle hamstring and calf stretches'
    ],
    iconName: 'Activity',
    defaultActionGuidance: 'Reach arms overhead toward the sky and inhale deeply through your nose.'
  },
  {
    id: 'sunset-twilight-watch',
    name: 'Golden Hour / Sunset Vigil',
    category: 'nature-observation',
    tagline: 'Mark the transition of daylight into twilight.',
    description: 'Head to an open vantage point, waterfront, or field to witness the natural gradient of twilight. A primal marker of evening calm.',
    minDuration: 25,
    maxDuration: 60,
    suitableEnergyLevels: ['low', 'moderate'],
    suitableMoods: ['reflective', 'tired', 'stressed', 'neutral'],
    suitableBudgets: ['free'],
    suitableSocial: ['solo', 'partner', 'friends', 'any'],
    preferredLocations: ['water', 'park', 'quiet-bench', 'trail'],
    preparationTips: [
      'Check which direction faces the western horizon',
      'Bring an extra layer as ambient temperature drops with sunset'
    ],
    iconName: 'Sunset',
    defaultActionGuidance: 'Watch the colors soften from gold to dusky blue without taking photos.'
  },
  {
    id: 'casual-bike-cruise',
    name: 'Gentle Neighborhood Cycle',
    category: 'cycling',
    tagline: 'Feel the breeze on two wheels along low-traffic paths.',
    description: 'A relaxed bike ride without speed tracking or fitness targets. Just cruising through park paths and leafy lanes.',
    minDuration: 30,
    maxDuration: 90,
    suitableEnergyLevels: ['moderate', 'high'],
    suitableMoods: ['curious', 'restless', 'social', 'neutral'],
    suitableBudgets: ['free'],
    suitableSocial: ['solo', 'friends', 'partner', 'any'],
    preferredLocations: ['park', 'trail', 'neighborhood'],
    preparationTips: [
      'Check tire pressure and wear a helmet',
      'Choose a bike-friendly path with minimal car traffic'
    ],
    iconName: 'Bike',
    defaultActionGuidance: 'Coast smoothly and let the wind cool you down.'
  },
  {
    id: 'sheltered-porch-observation',
    name: 'Sheltered Porch & Fresh Air Reset',
    category: 'nature-observation',
    tagline: 'Experience outdoor breeze and natural light from a covered sanctuary.',
    description: 'Step onto a covered porch, balcony, gazebo, or doorway shelter. Watch changing clouds or rain, breathe fresh air, and decompress without needing clear weather.',
    minDuration: 15,
    maxDuration: 45,
    suitableEnergyLevels: ['low'],
    suitableMoods: ['tired', 'stressed', 'reflective', 'neutral'],
    suitableBudgets: ['free'],
    suitableSocial: ['solo', 'partner', 'any'],
    preferredLocations: ['neighborhood', 'quiet-bench', 'any'],
    preparationTips: [
      'Take a warm layer or throw blanket if it is breezy',
      'Leave your phone inside the room'
    ],
    itemsToBring: ['Light blanket or warm fleece', 'Warm mug of tea or water'],
    safetyNote: 'Ensure footing is dry and stable near doorway steps or balcony railings.',
    shelteredAlternative: 'This is an ideal sheltered activity for rainy or cold weather.',
    mobilityFriendly: true,
    iconName: 'Home',
    defaultActionGuidance: 'Lean back, breathe in the fresh outdoor coolness, and listen to the ambient breeze.'
  },
  {
    id: 'cloud-canopy-watching',
    name: 'Cloud & Tree Canopy Gazing',
    category: 'mindfulness',
    tagline: 'Rest your eyes on drifting clouds and swaying green branches.',
    description: 'Find a comfortable reclined park bench or dry grassy lawn. Lie or lean back and gaze upward into the movement of tree crowns and cloud patterns.',
    minDuration: 15,
    maxDuration: 45,
    suitableEnergyLevels: ['low', 'moderate'],
    suitableMoods: ['stressed', 'tired', 'reflective'],
    suitableBudgets: ['free'],
    suitableSocial: ['solo', 'partner', 'any'],
    preferredLocations: ['park', 'garden', 'quiet-bench'],
    preparationTips: [
      'Bring sunglasses or rest under leafy shade to protect your eyes',
      'Lie down or lean your head comfortably back'
    ],
    itemsToBring: ['Small towel or sit-pad', 'Sunglasses'],
    safetyNote: 'Avoid looking directly toward the sun; position yourself in tree shade.',
    shelteredAlternative: 'If the ground is damp, sit under an open pavilion or covered park bench.',
    mobilityFriendly: true,
    iconName: 'Eye',
    defaultActionGuidance: 'Fix your gaze on one drifting cloud until its shape naturally dissolves.'
  },
  {
    id: 'budget-refreshment-stroll',
    name: 'Neighborhood Chai & Stroll',
    category: 'walking',
    tagline: 'A gentle walk to pick up a warm tea or small fruit to enjoy outside.',
    description: 'Stroll through local street corners to pick up a modest beverage or small fresh snack (₹20-₹100 / $2-3). Sit outside to savor each sip in fresh air.',
    minDuration: 25,
    maxDuration: 60,
    suitableEnergyLevels: ['low', 'moderate'],
    suitableMoods: ['social', 'reflective', 'restless', 'neutral'],
    suitableBudgets: ['low-cost', 'free'],
    suitableSocial: ['solo', 'friends', 'partner', 'any'],
    preferredLocations: ['neighborhood', 'campus', 'park'],
    preparationTips: [
      'Keep a little pocket change or mobile pay ready for a modest local tea',
      'Find an outdoor bench or stoop away from crowded car traffic'
    ],
    itemsToBring: ['Pocket change or small cash (₹50-100 / $3-5)', 'Comfortable walking shoes'],
    safetyNote: 'Cross at pedestrian walkways and stay mindful of street traffic.',
    shelteredAlternative: 'Sit under a shop awning or outdoor café umbrella if it starts sprinkling.',
    mobilityFriendly: true,
    iconName: 'Coffee',
    defaultActionGuidance: 'Hold your warm cup with both hands and notice the aroma blending with outside air.'
  }
];
