import { getHttpUrl } from "../config";
import { type StrategyPlan, StrategyPlanSchema } from "../models/strategy";

export type StrategyResult =
  | { kind: "ok"; plan: StrategyPlan }
  | { kind: "cooldown"; retryAfterMs: number };

export async function requestStrategy(
  signal?: AbortSignal,
  fetchFn: typeof fetch = fetch
): Promise<StrategyResult> {
  const res = await fetchFn(`${getHttpUrl()}/api/generate-strategy`, {
    method: "POST",
    signal,
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 429) {
    return { kind: "cooldown", retryAfterMs: body.retryAfterMs ?? 15000 };
  }
  if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
  return { kind: "ok", plan: StrategyPlanSchema.parse(body.strategy) }; // validate, never trust
}
