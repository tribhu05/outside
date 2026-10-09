import { GemmaProvider, GemmaConfig } from './gemmaProvider';
import { HeuristicProvider } from './heuristicProvider';
import { UserIntent } from '../types';

export interface ExtractionResult {
  intent: UserIntent;
  providerUsed: 'gemma' | 'heuristic';
  durationMs: number;
  modelUsed?: string;
  fallbackReason?: string;
}

export interface ConnectionHealth {
  isOnline: boolean;
  endpoint: string;
  model: string;
  latencyMs?: number;
  errorMessage?: string;
}

class AIService {
  private gemmaProvider: GemmaProvider;
  private heuristicProvider: HeuristicProvider;
  private preferHeuristic: boolean = false;

  constructor(config?: GemmaConfig) {
    this.gemmaProvider = new GemmaProvider(config);
    this.heuristicProvider = new HeuristicProvider();

    // Load saved settings if in browser
    if (typeof window !== 'undefined') {
      const savedEndpoint = localStorage.getItem('outside_gemma_endpoint');
      const savedModel = localStorage.getItem('outside_gemma_model');
      const savedPreferFallback = localStorage.getItem('outside_prefer_fallback');

      if (savedEndpoint || savedModel) {
        this.updateConfig({
          endpoint: savedEndpoint || undefined,
          model: savedModel || undefined
        });
      }
      if (savedPreferFallback === 'true') {
        this.preferHeuristic = true;
      }
    }
  }

  updateConfig(config: GemmaConfig) {
    this.gemmaProvider = new GemmaProvider(config);
    if (typeof window !== 'undefined') {
      if (config.endpoint) localStorage.setItem('outside_gemma_endpoint', config.endpoint);
      if (config.model) localStorage.setItem('outside_gemma_model', config.model);
    }
  }

  setPreferHeuristic(prefer: boolean) {
    this.preferHeuristic = prefer;
    if (typeof window !== 'undefined') {
      localStorage.setItem('outside_prefer_fallback', prefer ? 'true' : 'false');
    }
  }

  getPreferHeuristic(): boolean {
    return this.preferHeuristic;
  }

  getConfig(): { endpoint: string; model: string } {
    return {
      endpoint: this.gemmaProvider.getEndpoint(),
      model: this.gemmaProvider.getModel()
    };
  }

  async testGemmaHealth(): Promise<ConnectionHealth> {
    const start = performance.now();
    const endpoint = this.gemmaProvider.getEndpoint();
    const model = this.gemmaProvider.getModel();

    try {
      // Test quick inference with tiny prompt
      const result = await this.gemmaProvider.extractIntent('30 minutes walking');
      const latency = Math.round(performance.now() - start);
      if (result && result.durationMinutes > 0) {
        return {
          isOnline: true,
          endpoint,
          model,
          latencyMs: latency
        };
      }
      throw new Error('Unexpected response format');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        isOnline: false,
        endpoint,
        model,
        latencyMs: Math.round(performance.now() - start),
        errorMessage: msg
      };
    }
  }

  async extractIntent(
    text: string, 
    forceMode?: 'auto' | 'gemma' | 'heuristic'
  ): Promise<ExtractionResult> {
    const start = performance.now();
    const mode = (forceMode && forceMode !== 'auto') 
      ? forceMode 
      : (this.preferHeuristic ? 'heuristic' : 'auto');

    // 1. Explicit heuristic
    if (mode === 'heuristic') {
      const intent = await this.heuristicProvider.extractIntent(text);
      return {
        intent,
        providerUsed: 'heuristic',
        durationMs: Math.round(performance.now() - start)
      };
    }

    // 2. Explicit Gemma
    if (mode === 'gemma') {
      const intent = await this.gemmaProvider.extractIntent(text);
      return {
        intent,
        providerUsed: 'gemma',
        durationMs: Math.round(performance.now() - start),
        modelUsed: this.gemmaProvider.getModel()
      };
    }

    // 3. Auto: Try Gemma with automatic fallback to heuristic
    try {
      const intent = await this.gemmaProvider.extractIntent(text);
      return {
        intent,
        providerUsed: 'gemma',
        durationMs: Math.round(performance.now() - start),
        modelUsed: this.gemmaProvider.getModel()
      };
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      console.info(`Outside AI: Gemma unavailable (${reason}). Falling back to local heuristic engine.`);
      
      const intent = await this.heuristicProvider.extractIntent(text);
      return {
        intent,
        providerUsed: 'heuristic',
        durationMs: Math.round(performance.now() - start),
        fallbackReason: reason
      };
    }
  }
}

export const aiService = new AIService();
