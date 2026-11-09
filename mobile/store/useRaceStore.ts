import { create } from "zustand";

export interface RaceState {
  timestamp: number;
  sessionStatus: string;
  trackName: string;
  sessionType: string;
  totalLaps: number;
  pitStopWindowIdealLap: number;
  pitStatus: string;
  numPitStopsTaken: number;
  weather: string;
  weatherForecast: ForecastSample[];
  forecastAccuracy: string;
  safetyCarStatus: string;
  currentLap: number;
  playerPosition: number;
  gapAhead: number;
  carAheadLastLapTime: number;
  gapBehind: number;
  carBehindLastLapTime: number;
  lastLapTime: number;
  lapTimeHistory: number[];
  bestLapTime: number;
  carAheadActualTyreCompound: string;
  carAheadVisualTyreCompound: string;
  carAheadTireCompound: string;
  carAheadTireAgeLaps: number;
  carBehindActualTyreCompound: string;
  carBehindVisualTyreCompound: string;
  carBehindTireCompound: string;
  carBehindTireAgeLaps: number;
  actualTyreCompound: string;
  visualTyreCompound: string;
  tireCompound: string;
  tireWearLF: number;
  tireWearRF: number;
  tireWearLR: number;
  tireWearRR: number;
  tireAgeLaps: number;
  ersStorage: number;
  fuelRemainingLaps: number;
  carDamage: string[];
  playerPenalties: string[];
  totalPenaltySeconds: number;
  availableTires: TyreSet[];
}

const initialState: RaceState = {
  timestamp: 0,
  sessionStatus: "active",
  trackName: "",
  sessionType: "",
  totalLaps: 0,
  pitStopWindowIdealLap: 0,
  pitStatus: "",
  numPitStopsTaken: 0,
  weather: "",
  weatherForecast: [],
  forecastAccuracy: "",
  safetyCarStatus: "",
  currentLap: 0,
  playerPosition: 0,
  gapAhead: 0,
  carAheadLastLapTime: 0,
  gapBehind: 0,
  carBehindLastLapTime: 0,
  lastLapTime: 0,
  lapTimeHistory: [],
  bestLapTime: 0,
  carAheadActualTyreCompound: "",
  carAheadVisualTyreCompound: "",
  carAheadTireCompound: "",
  carAheadTireAgeLaps: 0,
  carBehindActualTyreCompound: "",
  carBehindVisualTyreCompound: "",
  carBehindTireCompound: "",
  carBehindTireAgeLaps: 0,
  actualTyreCompound: "",
  visualTyreCompound: "",
  tireCompound: "",
  tireWearLF: 0,
  tireWearRF: 0,
  tireWearLR: 0,
  tireWearRR: 0,
  tireAgeLaps: 0,
  ersStorage: 0,
  fuelRemainingLaps: 0,
  carDamage: [],
  playerPenalties: [],
  totalPenaltySeconds: 0,
  availableTires: [],
};

interface RaceStore extends RaceState {
  isConnected: boolean;
  lastUpdateMs: number; // client clock, used for the "stale data" indicator
  setConnectionStatus: (status: boolean) => void;
  updateTelemetry: (data: Partial<RaceState>) => void;
}
const ARRAY_KEYS = [
  "weatherForecast",
  "lapTimeHistory",
  "carDamage",
  "playerPenalties",
  "availableTires",
] as const;

function syncLegacyCompound<T extends keyof RaceState>(
  next: Partial<RaceState>,
  data: Partial<RaceState>,
  visualKey: T,
  legacyKey: T
) {
  if (data[visualKey] !== undefined && data[legacyKey] === undefined) {
    next[legacyKey] = data[visualKey];
  } else if (data[legacyKey] !== undefined && data[visualKey] === undefined) {
    next[visualKey] = data[legacyKey];
  }
}

export const useRaceStore = create<RaceStore>((set) => ({
  ...initialState,
  isConnected: false,
  lastUpdateMs: 0,
  setConnectionStatus: (isConnected) => set({ isConnected }),

  updateTelemetry: (data) =>
    set((s) => {
      const next: Partial<RaceState> = { ...data };

      // Dual compound backward-compatibility synchronization
      syncLegacyCompound(next, data, "visualTyreCompound", "tireCompound");
      syncLegacyCompound(
        next,
        data,
        "carAheadVisualTyreCompound",
        "carAheadTireCompound"
      );
      syncLegacyCompound(
        next,
        data,
        "carBehindVisualTyreCompound",
        "carBehindTireCompound"
      );

      // keep the old array reference when the content is identical, so widgets don't re-render
      for (const k of ARRAY_KEYS) {
        if (next[k] && JSON.stringify(next[k]) === JSON.stringify(s[k]))
          delete next[k];
      }
      // "fresh" = the game actually produced new data (backend timestamp changed)
      const fresh = !!data.timestamp && data.timestamp !== s.timestamp;
      return fresh ? { ...next, lastUpdateMs: Date.now() } : next;
    }),
}));

export interface ForecastSample {
  // note the PascalCase keys
  TimeOffsetMinutes: number;
  Weather: string;
  RainPercentage: number;
}

export interface TyreSet {
  visualCompound: string;
  wear: number; // %
  lapsLeft: number; // m_lifeSpan = Laps left in this tyre set
  usableLife: number; // max number of laps recommended for this compound
}

export function parseDamage(s: string) {
  const irreparable = s.startsWith("(Irreparable)");
  const [part, v] = s.replace("(Irreparable) ", "").split(": ");
  return { part, value: v ? Number(v) : null, irreparable };
}
