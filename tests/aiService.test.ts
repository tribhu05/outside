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

  it('parses markdown codeblock JSON output from Gemma', async () => {
    const markdownContent = 'Here is the extracted plan:\n```json\n{\n  "durationMinutes": 60,\n  "energyLevel": "high",\n  "mood": "restless",\n  "budget": "free",\n  "activityPreference": "jogging",\n  "socialPreference": "solo"\n}\n```\nEnjoy your run!';

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: markdownContent } }] })
    }));

    const result = await aiService.extractIntent('Run for an hour', 'gemma');
    expect(result.providerUsed).toBe('gemma');
    expect(result.intent.durationMinutes).toBe(60);
    expect(result.intent.activityPreference).toBe('jogging');
  });

  it('falls back to heuristic when Gemma returns malformed non-JSON output', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Sorry, I cannot parse this.' } }] })
    }));

    const result = await aiService.extractIntent('I have 30 minutes free and low energy', 'auto');
    expect(result.providerUsed).toBe('heuristic');
    expect(result.intent.durationMinutes).toBe(30);
    expect(result.fallbackReason).toBeDefined();
  });

  describe('testGemmaHealth', () => {
    it('reports isOnline: true with latency when model responds', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'OK' } }] })
      }));

      const health = await aiService.testGemmaHealth();
      expect(health.isOnline).toBe(true);
      expect(health.latencyMs).toBeGreaterThanOrEqual(0);
      expect(health.model).toBeDefined();
    });

    it('reports isOnline: false with clear error when endpoint returns 404 (model missing)', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'model "gemma2:2b" not found, try pulling it first'
      }));

      const health = await aiService.testGemmaHealth();
      expect(health.isOnline).toBe(false);
      expect(health.errorMessage).toContain('404');
    });

    it('reports isOnline: false with clear error when connection refused', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')));

      const health = await aiService.testGemmaHealth();
      expect(health.isOnline).toBe(false);
      expect(health.errorMessage).toContain('Could not reach');
    });

    it('reports isOnline: false with timeout guidance when fetch is aborted', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));

      const health = await aiService.testGemmaHealth();
      expect(health.isOnline).toBe(false);
      expect(health.errorMessage).toContain('timed out');
    });
  });
});
