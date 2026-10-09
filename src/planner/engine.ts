import { UserIntent, OutdoorPlan, PlanMilestone, EnergyLevel } from '../types';
import { ACTIVITIES, ActivityDefinition } from './activityDatabase';
import { getRecommendedChallenge } from './challenges';

function formatClockTime(startDate: Date, minutesToAdd: number): string {
  const d = new Date(startDate.getTime() + minutesToAdd * 60 * 1000);
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const minuteStr = minutes < 10 ? '0' + minutes : String(minutes);
  return `${hours}:${minuteStr} ${ampm}`;
}

export function selectBestActivity(intent: UserIntent): ActivityDefinition {
  const scored = ACTIVITIES.map(activity => {
    let score = 0;

    // Category preference match
    if (intent.activityPreference && intent.activityPreference !== 'any') {
      if (activity.category === intent.activityPreference) {
        score += 10;
      }
    }

    // Energy level match
    if (activity.suitableEnergyLevels.includes(intent.energyLevel)) {
      score += 5;
    } else {
      // Penalty for severe mismatch (e.g., high energy workout when exhausted)
      if (intent.energyLevel === 'low' && activity.suitableEnergyLevels.includes('high') && !activity.suitableEnergyLevels.includes('low')) {
        score -= 8;
      }
    }

    // Mood match
    if (activity.suitableMoods.includes(intent.mood)) {
      score += 4;
    }

    // Duration suitability
    if (intent.durationMinutes >= activity.minDuration && intent.durationMinutes <= activity.maxDuration * 1.5) {
      score += 4;
    } else if (intent.durationMinutes < activity.minDuration) {
      score -= 5;
    }

    // Social mode match
    if (activity.suitableSocial.includes(intent.socialPreference) || activity.suitableSocial.includes('any')) {
      score += 3;
    }

    // Budget match
    if (activity.suitableBudgets.includes(intent.budget)) {
      score += 2;
    }

    // Location preference match
    if (intent.locationPreference && intent.locationPreference !== 'any') {
      if (activity.preferredLocations.includes(intent.locationPreference)) {
        score += 3;
      }
    }

    return { activity, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.activity || ACTIVITIES[0];
}

export function generateOutdoorPlan(
  intent: UserIntent,
  providerUsed: 'gemma' | 'heuristic' = 'heuristic',
  startTime: Date = new Date()
): OutdoorPlan {
  const activity = selectBestActivity(intent);
  const totalDuration = Math.max(15, Math.min(240, intent.durationMinutes));
  const challenge = getRecommendedChallenge(
    intent.mood === 'stressed' ? 'mindfulness' :
    intent.mood === 'tired' ? 'sensory' :
    intent.mood === 'curious' ? 'curiosity' : undefined
  );

  const milestones: PlanMilestone[] = [];
  let currentOffset = 0;

  // 1. Departure milestone (3 to 7 mins)
  const departureDuration = totalDuration <= 30 ? 3 : 5;
  milestones.push({
    id: 'step-depart',
    timeLabel: formatClockTime(startTime, currentOffset),
    minuteOffset: currentOffset,
    durationMinutes: departureDuration,
    title: 'Leave home & silence screen',
    description: 'Slip into comfortable shoes, mute notifications, and step outside the door.',
    iconName: 'DoorOpen',
    actionGuidance: 'Place your phone in your pocket or bag right as you cross the threshold.'
  });
  currentOffset += departureDuration;

  // Calculate remaining time for core phases
  const remainingMinutes = totalDuration - departureDuration;

  if (totalDuration <= 35) {
    // Short session (~20-35 mins): Departure -> Walk/Activity -> Quick sensory pause -> Walk back
    const primaryTime = Math.round(remainingMinutes * 0.55);
    const challengeTime = 5;
    const returnTime = Math.max(5, remainingMinutes - primaryTime - challengeTime);

    milestones.push({
      id: 'step-primary',
      timeLabel: formatClockTime(startTime, currentOffset),
      minuteOffset: currentOffset,
      durationMinutes: primaryTime,
      title: `${activity.name}`,
      description: activity.description,
      iconName: activity.iconName,
      actionGuidance: activity.defaultActionGuidance
    });
    currentOffset += primaryTime;

    milestones.push({
      id: 'step-challenge',
      timeLabel: formatClockTime(startTime, currentOffset),
      minuteOffset: currentOffset,
      durationMinutes: challengeTime,
      title: `Observation pause: ${challenge.title}`,
      description: challenge.instruction,
      iconName: 'Sparkles',
      actionGuidance: 'Take this short moment to connect directly with your surroundings.'
    });
    currentOffset += challengeTime;

    milestones.push({
      id: 'step-return',
      timeLabel: formatClockTime(startTime, currentOffset),
      minuteOffset: currentOffset,
      durationMinutes: returnTime,
      title: 'Easy stroll back',
      description: 'Unhurried return walk with relaxed eyes and steady breath.',
      iconName: 'Home',
      actionGuidance: 'Notice how your mind feels now compared to when you left.'
    });
    currentOffset += returnTime;

  } else if (totalDuration <= 70) {
    // Standard session (~40-70 mins): Departure -> Outbound walk -> Anchor Activity -> Challenge -> Return
    const outboundTime = Math.round(remainingMinutes * 0.30);
    const anchorTime = Math.round(remainingMinutes * 0.38);
    const challengeTime = Math.round(remainingMinutes * 0.12);
    const returnTime = Math.max(8, remainingMinutes - outboundTime - anchorTime - challengeTime);

    milestones.push({
      id: 'step-outbound',
      timeLabel: formatClockTime(startTime, currentOffset),
      minuteOffset: currentOffset,
      durationMinutes: outboundTime,
      title: 'Outbound walk to your outdoor spot',
      description: 'Move naturally toward greenery, a park, or open streets. Keep eyes up.',
      iconName: 'Footprints',
      actionGuidance: 'Keep an easy, rhythmic pace. Let your eyes scan trees and horizons.'
    });
    currentOffset += outboundTime;

    milestones.push({
      id: 'step-anchor',
      timeLabel: formatClockTime(startTime, currentOffset),
      minuteOffset: currentOffset,
      durationMinutes: anchorTime,
      title: `${activity.name}`,
      description: activity.description,
      iconName: activity.iconName,
      actionGuidance: activity.defaultActionGuidance
    });
    currentOffset += anchorTime;

    milestones.push({
      id: 'step-challenge',
      timeLabel: formatClockTime(startTime, currentOffset),
      minuteOffset: currentOffset,
      durationMinutes: challengeTime,
      title: `Outdoor micro-challenge: ${challenge.title}`,
      description: challenge.instruction,
      iconName: 'Sparkles',
      actionGuidance: 'No rush. Be curious about the physical environment.'
    });
    currentOffset += challengeTime;

    milestones.push({
      id: 'step-return',
      timeLabel: formatClockTime(startTime, currentOffset),
      minuteOffset: currentOffset,
      durationMinutes: returnTime,
      title: 'Wander back home',
      description: 'Return at a calm pace. Take in the fresh air before stepping indoors.',
      iconName: 'Home',
      actionGuidance: 'Breathe deeply. Carry this open calm indoors with you.'
    });
    currentOffset += returnTime;

  } else {
    // Extended session (75-240 mins)
    const outboundTime = Math.round(remainingMinutes * 0.25);
    const anchorTime = Math.round(remainingMinutes * 0.40);
    const explorationTime = Math.round(remainingMinutes * 0.15);
    const returnTime = Math.max(15, remainingMinutes - outboundTime - anchorTime - explorationTime);

    milestones.push({
      id: 'step-outbound',
      timeLabel: formatClockTime(startTime, currentOffset),
      minuteOffset: currentOffset,
      durationMinutes: outboundTime,
      title: 'Journey outwards',
      description: 'A continuous, unhurried walk toward open parkland, trails, or waterfront.',
      iconName: 'Footprints',
      actionGuidance: 'Disconnect fully from screens. Settle into the physical movement.'
    });
    currentOffset += outboundTime;

    milestones.push({
      id: 'step-anchor',
      timeLabel: formatClockTime(startTime, currentOffset),
      minuteOffset: currentOffset,
      durationMinutes: anchorTime,
      title: `${activity.name}`,
      description: activity.description,
      iconName: activity.iconName,
      actionGuidance: activity.defaultActionGuidance
    });
    currentOffset += anchorTime;

    milestones.push({
      id: 'step-exploration',
      timeLabel: formatClockTime(startTime, currentOffset),
      minuteOffset: currentOffset,
      durationMinutes: explorationTime,
      title: `Free exploration & ${challenge.title}`,
      description: `${challenge.instruction} Follow whatever path or path view catches your eye.`,
      iconName: 'Compass',
      actionGuidance: 'Walk a trail or path you have never taken before.'
    });
    currentOffset += explorationTime;

    milestones.push({
      id: 'step-return',
      timeLabel: formatClockTime(startTime, currentOffset),
      minuteOffset: currentOffset,
      durationMinutes: returnTime,
      title: 'Reflective return stroll',
      description: 'Enjoy the golden light or evening breeze on your way back.',
      iconName: 'Home',
      actionGuidance: 'Enjoy the sense of time well-spent outside.'
    });
    currentOffset += returnTime;
  }

  // Done milestone
  milestones.push({
    id: 'step-done',
    timeLabel: formatClockTime(startTime, currentOffset),
    minuteOffset: currentOffset,
    durationMinutes: 0,
    title: 'Return refreshed',
    description: 'Arrive back home with cleared thoughts and grounded energy.',
    iconName: 'CheckCircle'
  });

  // Summary generation
  const intentSummary = `${totalDuration} mins · ${intent.energyLevel} energy · ${intent.budget === 'free' ? 'No cost' : 'Low cost'} · ${intent.socialPreference}`;

  return {
    id: 'plan-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    createdAt: new Date().toISOString(),
    title: generatePlanTitle(activity, intent.energyLevel),
    tagline: activity.tagline,
    totalDurationMinutes: totalDuration,
    energyLevel: intent.energyLevel,
    budget: intent.budget,
    socialMode: intent.socialPreference,
    preparationTips: [
      ...activity.preparationTips,
      'Leave notifications on silent',
      'Hydrate with a glass of water before heading out'
    ],
    milestones,
    challenge,
    intentSummary,
    extractedIntent: intent,
    providerUsed
  };
}

function generatePlanTitle(activity: ActivityDefinition, energy: EnergyLevel): string {
  if (energy === 'low') {
    return `Gentle Outside Reset: ${activity.name}`;
  } else if (energy === 'high') {
    return `Active Fresh Air Outing: ${activity.name}`;
  }
  return `Outside Reset: ${activity.name}`;
}
