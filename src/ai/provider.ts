import { UserIntent } from '../types';

export interface IntentExtractor {
  readonly name: 'gemma' | 'heuristic';
  extractIntent(text: string, options?: { signal?: AbortSignal }): Promise<UserIntent>;
}
