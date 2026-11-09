import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export const DEFAULT_BACKEND_HOST = "localhost:5000";
export const BACKEND_HOST_STORAGE_KEY = "f1_settings_backend_host";

export interface SettingsStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
}

const resolvedAsyncStorage: SettingsStorage =
  "getItem" in AsyncStorage
    ? AsyncStorage
    : (AsyncStorage as unknown as { default: SettingsStorage }).default;

let activeStorage: SettingsStorage = resolvedAsyncStorage;

export function configureSettingsStorage(
  storage: SettingsStorage = resolvedAsyncStorage
): void {
  activeStorage = storage;
}

export function normalizeBackendHost(raw: string | null | undefined): string {
  if (!raw) return DEFAULT_BACKEND_HOST;
  const cleaned = raw
    .trim()
    .replace(/^(?:https?|wss?):\/\//i, "")
    .replace(/\/+$/, "");
  return cleaned || DEFAULT_BACKEND_HOST;
}

export interface SettingsStore {
  backendHost: string;
  isHydrated: boolean;
  isSettingsOpen: boolean;
  hasAutoPromptedConnection: boolean;
  connectionEpoch: number;
  loadSettings: () => Promise<string>;
  setBackendHost: (host: string) => Promise<string>;
  openSettings: () => void;
  closeSettings: () => void;
  notifyConnectionFailed: () => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  backendHost: DEFAULT_BACKEND_HOST,
  isHydrated: false,
  isSettingsOpen: false,
  hasAutoPromptedConnection: false,
  connectionEpoch: 0,

  loadSettings: async () => {
    try {
      const saved = await activeStorage.getItem(BACKEND_HOST_STORAGE_KEY);
      const normalized = normalizeBackendHost(saved);
      set({ backendHost: normalized, isHydrated: true });
      return normalized;
    } catch {
      set({ backendHost: DEFAULT_BACKEND_HOST, isHydrated: true });
      return DEFAULT_BACKEND_HOST;
    }
  },

  setBackendHost: async (rawHost: string) => {
    const normalized = normalizeBackendHost(rawHost);
    set((s) => ({
      backendHost: normalized,
      connectionEpoch: s.connectionEpoch + 1,
    }));
    try {
      await activeStorage.setItem(BACKEND_HOST_STORAGE_KEY, normalized);
    } catch {
      // Ignore storage write errors while keeping in-memory host updated
    }
    return normalized;
  },

  openSettings: () => set({ isSettingsOpen: true }),

  closeSettings: () => set({ isSettingsOpen: false }),

  notifyConnectionFailed: () => {
    if (!get().hasAutoPromptedConnection) {
      set({ isSettingsOpen: true, hasAutoPromptedConnection: true });
    }
  },
}));
