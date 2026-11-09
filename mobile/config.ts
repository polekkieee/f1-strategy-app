import {
  DEFAULT_BACKEND_HOST,
  normalizeBackendHost,
  useSettingsStore,
} from "./store/useSettingsStore";

export { DEFAULT_BACKEND_HOST, normalizeBackendHost };

export function getBackendHost(): string {
  return normalizeBackendHost(useSettingsStore.getState().backendHost);
}

export function getWsUrl(host: string = getBackendHost()): string {
  return `ws://${normalizeBackendHost(host)}`;
}

export function getHttpUrl(host: string = getBackendHost()): string {
  return `http://${normalizeBackendHost(host)}`;
}

export type ConnectionTestResult =
  { ok: true; host: string } | { ok: false; host: string; error: string };

export async function testBackendConnection(
  rawHost: string,
  fetchFn: typeof fetch = fetch
): Promise<ConnectionTestResult> {
  const host = normalizeBackendHost(rawHost);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const res = await fetchFn(`${getHttpUrl(host)}/health`, {
      method: "GET",
      signal: ctrl.signal,
    });
    if (!res.ok) {
      return { ok: false, host, error: `HTTP ${res.status}` };
    }
    return { ok: true, host };
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.name === "AbortError"
          ? "Connection timed out"
          : err.message
        : "Connection failed";
    return { ok: false, host, error: msg };
  } finally {
    clearTimeout(timer);
  }
}
