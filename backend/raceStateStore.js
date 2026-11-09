// raceStateStore.js
export function createInitialState() {
    return {
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
        carAheadIndex: -1,
        carBehindIndex: -1,
        gapAhead: 0,
        carAheadLastLapTime: 0,
        gapBehind: 0,
        carBehindLastLapTime: 0,
        lastLapTime: 0,
        lapTimeHistory: [],
        bestLapTime: 0,
        carAheadActualTyreCompound: "",
        carAheadVisualTyreCompound: "",
        carAheadTireAgeLaps: 0,
        carBehindActualTyreCompound: "",
        carBehindVisualTyreCompound: "",
        carBehindTireAgeLaps: 0,
        actualTyreCompound: "",
        visualTyreCompound: "",
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
        availableTires: []
    };
}

export function resetState(state) {
    for (const k of Object.keys(state)) delete state[k];
    return Object.assign(state, createInitialState());
}

class RaceStateStore {
    static #instance;
    #state;
    #listeners;

    constructor() {
        if (RaceStateStore.#instance) {
            return RaceStateStore.#instance;
        }

        this.#listeners = new Set();
        this.#state = createInitialState();

        RaceStateStore.#instance = this;
    }

    // Get the current state
    get state() {
        return this.#state;
    }

    reset() {
        resetState(this.#state);
        this.#notify();
    }

    // Pass a callback to safely mutate the state
    mutate(updaterFn) {
        updaterFn(this.#state);
        this.#notify();
    }

    // Observer pattern for event-driven reactions (e.g., logging a penalty the moment it happens)
    subscribe(listenerFn) {
        this.#listeners.add(listenerFn);
        return () => this.#listeners.delete(listenerFn); // Return unsubscribe function
    }

    #notify() {
        for (const listener of this.#listeners) {
            listener(this.#state);
        }
    }
}

// Export the single instance
export const raceStore = new RaceStateStore();
