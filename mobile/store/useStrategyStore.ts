import { create } from 'zustand';
import { StrategyPlan } from '../models/strategy';
import { requestStrategy } from '../services/strategyApi';

interface StrategyStore {
  plan: StrategyPlan | null;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
  cooldownUntil: number;
  generate: () => Promise<void>;
}

const COOLDOWN_MS = 15000;   // mirrors the backend; a 429 response overrides it

export const useStrategyStore = create<StrategyStore>((set, get) => ({
  plan: null, status: 'idle', error: null, cooldownUntil: 0,

  generate: async () => {
    const { status, cooldownUntil } = get();
    if (status === 'loading' || Date.now() < cooldownUntil) return;
    set({ status: 'loading', error: null });

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const r = await requestStrategy(ctrl.signal);
      if (r.kind === 'ok') set({ plan: r.plan, status: 'idle', cooldownUntil: Date.now() + COOLDOWN_MS });
      else set({ status: 'idle', cooldownUntil: Date.now() + r.retryAfterMs });
    } catch (e) {
      const msg = e instanceof Error ? (e.name === 'AbortError' ? 'Timed out' : e.message) : 'Request failed';
      set({ status: 'error', error: msg });
    } finally {
      clearTimeout(timer);
    }
  },
}));