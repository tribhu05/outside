import { IntentExtractor } from './provider';
import { UserIntent, EnergyLevel, BudgetType, MoodType, ActivityPreference, SocialPreference, LocationTypePreference, TimeOfDay } from '../types';
import { validateUserIntent } from './validator';

export class HeuristicProvider implements IntentExtractor {
  readonly name = 'heuristic' as const;

  async extractIntent(text: string): Promise<UserIntent> {
    const lower = text.toLowerCase().trim();

    // 1. Duration parsing
    const duration = this.parseDuration(lower);

    // 2. Energy level parsing
    const energy = this.parseEnergy(lower);

    // 3. Mood parsing
    const mood = this.parseMood(lower);

    // 4. Budget parsing
    const budget = this.parseBudget(lower);

    // 5. Activity preference
    const activity = this.parseActivity(lower);

    // 6. Social preference
    const social = this.parseSocial(lower);

    // 7. Location preference
    const location = this.parseLocation(lower);

    // 8. Time of day
    const timeOfDay = this.parseTimeOfDay(lower);

    return validateUserIntent({
      durationMinutes: duration,
      energyLevel: energy,
      mood: mood,
      budget: budget,
      activityPreference: activity,
      socialPreference: social,
      locationPreference: location,
      timeOfDay: timeOfDay,
      notes: `Extracted via heuristic analysis of: "${text.slice(0, 80)}"`
    });
  }

  private parseDuration(text: string): number {
    // Check specific patterns like "half an hour" / "half hour"
    if (/(?:half\s+(?:an\s+)?hour|30\s*mins?)/i.test(text)) {
      return 30;
    }
    if (/(?:1\.5|1\s*and\s*a\s*half|one\s+and\s+a\s+half)\s*h(?:ours?|rs?)/i.test(text)) {
      return 90;
    }
    if (/(?:quarter\s+of\s+an\s+hour|15\s*mins?)/i.test(text)) {
      return 15;
    }

    // Number words + hour
    if (/(?:one|a|1)\s*h(?:our|r)s?/i.test(text)) {
      return 60;
    }
    if (/(?:two|2)\s*h(?:ours?|rs?)/i.test(text)) {
      return 120;
    }
    if (/(?:three|3)\s*h(?:ours?|rs?)/i.test(text)) {
      return 180;
    }

    // Numeric minutes e.g. "45 minutes", "45 mins", "45m", "90 min"
    const minMatch = text.match(/(\d+)\s*(?:minutes|minute|mins|min|m)\b/i);
    if (minMatch) {
      const parsed = parseInt(minMatch[1], 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }

    // Numeric hours e.g. "1.5 hours", "2 hr"
    const hrMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hours|hour|hrs|hr|h)\b/i);
    if (hrMatch) {
      const parsed = parseFloat(hrMatch[1]);
      if (!isNaN(parsed) && parsed > 0) return Math.round(parsed * 60);
    }

    // "quick" or "short"
    if (/\b(?:quick|brief|short\s+break)\b/i.test(text)) {
      return 25;
    }

    // "long" or "afternoon"
    if (/\b(?:long|afternoon|all\s+evening)\b/i.test(text)) {
      return 90;
    }

    // Default to a wholesome 45 minutes
    return 45;
  }

  private parseEnergy(text: string): EnergyLevel {
    // Low energy indicators
    if (/\b(?:tired|exhausted|drained|sleepy|lazy|low\s*energy|fatigued|burnt\s*out|burnout|unwind|chill)\b/i.test(text)) {
      return 'low';
    }
    // High energy indicators
    if (/\b(?:active|high\s*energy|energetic|run|running|jog|jogging|sweat|vigorous|workout|fast|pumped|cycle|cycling|bike)\b/i.test(text)) {
      return 'high';
    }
    return 'moderate';
  }

  private parseMood(text: string): MoodType {
    if (/\b(?:stress(?:ed)?|overwhelm(?:ed)?|frazzled|anxious|anxiety|clear\s*my\s*head|reset|decompress)\b/i.test(text)) {
      return 'stressed';
    }
    if (/\b(?:tired|exhausted|drained|heavy|sleepy)\b/i.test(text)) {
      return 'tired';
    }
    if (/\b(?:restless|bored|cooped\s*up|cabin\s*fever|stuck\s*inside|fidgety)\b/i.test(text)) {
      return 'restless';
    }
    if (/\b(?:reflect|think|quiet|journal|write|contemplate|peaceful|relax(?:ing|ed)?)\b/i.test(text)) {
      return 'reflective';
    }
    if (/\b(?:curious|explore|discover|wander|look\s*around|new\s*places?)\b/i.test(text)) {
      return 'curious';
    }
    if (/\b(?:friends?|social|hang\s*out|talk|together|partner|date)\b/i.test(text)) {
      return 'social';
    }
    return 'neutral';
  }

  private parseBudget(text: string): BudgetType {
    // Mentions of free / zero money
    if (/\b(?:free|no\s*money|don'?t\s*want\s*to\s*spend|not\s*spending|zero\s*cost|\$0|broke|cheap|inexpensive|no\s*cost)\b/i.test(text)) {
      return 'free';
    }
    // Mention of coffee or cafe or buying a drink
    if (/\b(?:caf[eé]|coffee|tea|snack|drink|buy)\b/i.test(text)) {
      return 'low-cost';
    }
    return 'free';
  }

  private parseActivity(text: string): ActivityPreference {
    if (/\b(?:jog|jogging|run|running)\b/i.test(text)) return 'jogging';
    if (/\b(?:bike|biking|cycle|cycling)\b/i.test(text)) return 'cycling';
    if (/\b(?:read|reading|book)\b/i.test(text)) return 'reading';
    if (/\b(?:sketch|sketching|draw|drawing|journal|journaling|write|writing)\b/i.test(text)) return 'sketching';
    if (/\b(?:sit|sitting|meditat(?:e|ion)|breathe|breathwork|mindful(?:ness)?|stretch|stretching)\b/i.test(text)) return 'mindfulness';
    if (/\b(?:bird|birds|tree|trees|leaves|botanical|nature\s*observation|observe)\b/i.test(text)) return 'nature-observation';
    if (/\b(?:explore|exploring|wander|wanderlust|streets?|architecture|neighborhood)\b/i.test(text)) return 'exploration';
    if (/\b(?:walk|walking|stroll|ramble)\b/i.test(text)) return 'walking';
    return 'any';
  }

  private parseSocial(text: string): SocialPreference {
    if (/\b(?:alone|solo|myself|by\s*myself|just\s*me|quiet\s*time)\b/i.test(text)) return 'solo';
    if (/\b(?:friend|friends|budd(?:y|ies)|pal|pals|group|two\s*people|three\s*people)\b/i.test(text)) return 'friends';
    if (/\b(?:partner|date|husband|wife|boyfriend|girlfriend|couple)\b/i.test(text)) return 'partner';
    if (/\b(?:kids|children|family|son|daughter|toddler)\b/i.test(text)) return 'family';
    return 'solo';
  }

  private parseLocation(text: string): LocationTypePreference | undefined {
    if (/\b(?:park|greenspace)\b/i.test(text)) return 'park';
    if (/\b(?:lake|water|river|beach|pond|waterfront)\b/i.test(text)) return 'water';
    if (/\b(?:trail|woods|forest)\b/i.test(text)) return 'trail';
    if (/\b(?:garden|botanical)\b/i.test(text)) return 'garden';
    if (/\b(?:campus|university|college)\b/i.test(text)) return 'campus';
    if (/\b(?:bench)\b/i.test(text)) return 'quiet-bench';
    if (/\b(?:neighborhood|streets?)\b/i.test(text)) return 'neighborhood';
    return undefined;
  }

  private parseTimeOfDay(text: string): TimeOfDay | undefined {
    if (/\b(?:morning|sunrise|dawn|breakfast)\b/i.test(text)) return 'morning';
    if (/\b(?:sunset|dusk|golden\s*hour)\b/i.test(text)) return 'sunset';
    if (/\b(?:evening|tonight|dinner|after\s*work)\b/i.test(text)) return 'evening';
    if (/\b(?:afternoon|lunch|midday)\b/i.test(text)) return 'afternoon';
    if (/\b(?:night|stargazing|dark)\b/i.test(text)) return 'night';
    return undefined;
  }
}
