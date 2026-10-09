import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiService } from '../src/ai/aiService';

describe('AIService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    aiService.setPreferHeuristic(false);
  });

  it('falls back to heuristic engine when Gemma endpoint is unreachable', async () => {
    // Mock global fetch to reject (simulating Gemma offline)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to connect to localhost:11434')));

    const result = await aiService.extractIntent('I have 45 minutes to clear my head', 'auto');
    expect(result.providerUsed).toBe('heuristic');
    expect(result.intent.durationMinutes).toBe(45);
    expect(result.intent.mood).toBe('stressed');
    expect(result.fallbackReason).toContain('Failed to connect');
  });

  it('uses heuristic directly when preferHeuristic is toggled', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    aiService.setPreferHeuristic(true);
    const result = await aiService.extractIntent('Plan a 30 minute walk', 'auto');

    expect(result.providerUsed).toBe('heuristic');
    expect(result.intent.durationMinutes).toBe(30);
    // Fetch should not have been called
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('successfully extracts intent when Gemma responds with valid JSON', async () => {
    const mockGemmaResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              durationMinutes: 90,
              energyLevel: 'low',
              mood: 'reflective',
              budget: 'free',
              activityPreference: 'walking',
              socialPreference: 'solo',
              locationPreference: 'park'
            })
          }
        }
      ]
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockGemmaResponse
    }));

    const result = await aiService.extractIntent('I have 90 minutes for a peaceful walk', 'auto');
    expect(result.providerUsed).toBe('gemma');
    expect(result.intent.durationMinutes).toBe(90);
    expect(result.intent.energyLevel).toBe('low');
    expect(result.intent.locationPreference).toBe('park');
  });
});
