class RaceStateStore {
    static #instance;
    #state;
    #listeners;

    constructor() {
        if (RaceStateStore.#instance) {
            return RaceStateStore.#instance;
        }

        this.#listeners = new Set();
        
        // Define the initial shape of your telemetry data
        this.#state = {
            timestamp: 0,
            trackName: "",
            sessionType: "",
            totalLaps: 0,
            pitStopWindowIdealLap: 0,
            weather: "",
            weatherForecast: [],
            forecastAccuracy: "",
            trackStatus: "",
            currentLap: 0,
            playerPosition: 0,
            gapAhead: 0,
            carAheadLastLapTime: 0,
            gapBehind: 0,
            carBehindLastLapTime: 0,
            lastLapTime: 0,
            lapTimeHistory: [],
            bestLapTime: 0,
            carAheadTireCompound: "",
            carAheadTireAgeLaps: 0,
            carBehindTireCompound: "",
            carBehindTireAgeLaps: 0,
            tireCompound: "",
            tireWearLF: 0,
            tireWearRF: 0,
            tireWearLR: 0,
            tireWearRR: 0,
            tireAgeLaps: 0,
            ersStorage: 0,
            carDamage: [],
            playerPenalties: [],
            availableTires: []
        };

        RaceStateStore.#instance = this;
    }

    // Read-only access to current state
    get state() {
        return this.#state;
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