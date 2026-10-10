import { IntentExtractor } from './provider';
import { UserIntent } from '../types';
import { validateUserIntent } from './validator';

export interface GemmaConfig {
  endpoint?: string;
  model?: string;
  timeoutMs?: number;
}

export class GemmaProvider implements IntentExtractor {
  readonly name = 'gemma' as const;
  private endpoint: string;
  private model: string;
  private timeoutMs: number;

  constructor(config?: GemmaConfig) {
    this.endpoint = config?.endpoint || 
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMMA_API_URL) || 
      'http://localhost:11434/v1/chat/completions';
    this.model = config?.model || 
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMMA_MODEL) || 
      'gemma2:2b';
    this.timeoutMs = config?.timeoutMs || 30000; // 30s realistic timeout for local models
  }

  getEndpoint(): string {
    return this.endpoint;
  }

  getModel(): string {
    return this.model;
  }

  getTimeoutMs(): number {
    return this.timeoutMs;
  }

  /**
   * Genuine health & connectivity verification.
   * Sends a minimal completion request to the configured model.
   */
  async checkHealth(options?: { timeoutMs?: number }): Promise<{
    isOnline: boolean;
    endpoint: string;
    model: string;
    latencyMs: number;
    errorMessage?: string;
  }> {
    const start = performance.now();
    const timeout = options?.timeoutMs || 25000; // 25s for verification
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'user', content: 'Respond with OK.' }
          ],
          max_tokens: 5,
          temperature: 0.1,
          stream: false
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status} (${response.statusText}): ${errorText.slice(0, 120)}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content || data?.response;
      if (!content) {
        throw new Error('Received empty completion response from model');
      }

      return {
        isOnline: true,
        endpoint: this.endpoint,
        model: this.model,
        latencyMs: Math.round(performance.now() - start)
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAbort = err instanceof Error && err.name === 'AbortError';
      const msg = isAbort
        ? `Request timed out after ${Math.round(timeout / 1000)}s (Local models take time on cold start)`
        : (err instanceof Error ? err.message : String(err));

      return {
        isOnline: false,
        endpoint: this.endpoint,
        model: this.model,
        latencyMs: Math.round(performance.now() - start),
        errorMessage: msg.includes('Failed to fetch')
          ? `Could not reach ${this.endpoint}. Please verify Ollama is running ('ollama run ${this.model}')`
          : msg
      };
    }
  }

  async extractIntent(text: string, options?: { signal?: AbortSignal }): Promise<UserIntent> {
    const systemPrompt = `You are an AI that extracts structured user intent for outdoor plans. You do NOT write the activity plan yourself. Your job is ONLY to extract the user's intent into a clean JSON object conforming strictly to this format:

{
  "durationMinutes": number, // total available time in minutes (15 to 240)
  "energyLevel": "low" | "moderate" | "high",
  "mood": "stressed" | "tired" | "restless" | "reflective" | "curious" | "social" | "neutral",
  "budget": "free" | "low-cost",
  "activityPreference": "walking" | "nature-observation" | "mindfulness" | "reading" | "sketching" | "jogging" | "cycling" | "exploration" | "any",
  "socialPreference": "solo" | "friends" | "partner" | "family" | "any",
  "locationPreference": "park" | "neighborhood" | "water" | "trail" | "quiet-bench" | "campus" | "garden" | "any",
  "timeOfDay": "morning" | "afternoon" | "sunset" | "evening" | "night"
}

Output ONLY valid raw JSON. Do not include markdown backticks or explanations.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    // If caller provided a signal, chain it
    if (options?.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ],
          temperature: 0.1,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Gemma endpoint responded with HTTP ${response.status}: ${errorText.slice(0, 100)}`);
      }

      const data = await response.json();
      const rawContent: string = data?.choices?.[0]?.message?.content || data?.response || '';
      
      if (!rawContent) {
        throw new Error('Empty response from Gemma endpoint');
      }

      // Extract JSON from potential markdown formatting
      const cleanedJson = this.extractJsonString(rawContent);
      const parsed = JSON.parse(cleanedJson);
      
      const validated = validateUserIntent(parsed);
      validated.notes = `Extracted via Gemma (${this.model})`;
      return validated;

    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`Gemma request timed out after ${Math.round(this.timeoutMs / 1000)}s`);
      }
      throw new Error(`Gemma extraction failed: ${errorMsg}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private extractJsonString(content: string): string {
    const trimmed = content.trim();
    // Check for ```json ... ``` codeblock
    const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch) {
      const inner = codeBlockMatch[1].trim();
      const first = inner.indexOf('{');
      const last = inner.lastIndexOf('}');
      if (first !== -1 && last !== -1 && last > first) {
        return inner.slice(first, last + 1);
      }
      return inner;
    }
    // Check for outer braces
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return trimmed.slice(firstBrace, lastBrace + 1);
    }
    return trimmed;
  }
}
