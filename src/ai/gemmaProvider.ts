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
    this.timeoutMs = config?.timeoutMs || 5000;
  }

  getEndpoint(): string {
    return this.endpoint;
  }

  getModel(): string {
    return this.model;
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
        throw new Error(`Gemma endpoint responded with HTTP ${response.status}: ${response.statusText}`);
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
        throw new Error(`Gemma request timed out after ${this.timeoutMs}ms`);
      }
      throw new Error(`Gemma extraction failed: ${errorMsg}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private extractJsonString(content: string): string {
    const trimmed = content.trim();
    // Check for ```json ... ``` codeblock
    const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
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
