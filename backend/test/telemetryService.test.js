import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { raceStore } from "../raceStateStore.js";
import { processPacket } from "../telemetryService.js";
import {
    createPacketHeader,
    createSessionPacket,
    createWeatherForecastSample,
    createLapDataPacket,
    createCarStatusPacket,
    createCarDamagePacket,
    createEventPacket,
    createTyreSetsPacket,
    sessionPacketFixture,
    lapDataPacketFixture,
    carStatusPacketFixture,
    carDamagePacketFixture,
    eventPacketFixture,
    tyreSetsPacketFixture,
} from "./fixtures/packets.js";

describe("processPacket - Session Packet", () => {
    beforeEach(() => {
        raceStore.reset();
    });

    it("updates session state fields deterministically from a Session packet fixture", () => {
        const header = createPacketHeader({ m_packetId: 1, m_playerCarIndex: 0 });
        const sessionPacket = createSessionPacket({
            m_header: header,
            m_trackId: 3, // Sakhir (Bahrain)
            m_sessionType: 15, // Race
            m_totalLaps: 57,
            m_pitStopWindowIdealLap: 18,
            m_weather: 0, // Clear
            m_forecastAccuracy: 0, // Perfect
            m_safetyCarStatus: 0, // No Safety Car
        });

        processPacket(raceStore.state, sessionPacket);

        assert.equal(raceStore.state.trackName, "Sakhir (Bahrain)");
        assert.equal(raceStore.state.sessionType, "Race");
        assert.equal(raceStore.state.totalLaps, 57);
        assert.equal(raceStore.state.pitStopWindowIdealLap, 18);
        assert.equal(raceStore.state.weather, "Clear");
        assert.equal(raceStore.state.forecastAccuracy, "Perfect");
        assert.equal(raceStore.state.safetyCarStatus, "No Safety Car");
        assert.deepEqual(raceStore.state.weatherForecast, [
            {
                TimeOffsetMinutes: 5,
                Weather: "Light Cloud",
                RainPercentage: 10,
            },
        ]);
    });
});

describe("processPacket - LapData Packet", () => {
    beforeEach(() => {
        raceStore.reset();
    });

    it("updates lap data, player position, lap times, and rival gaps from a LapData packet fixture", () => {
        processPacket(raceStore.state, sessionPacketFixture);
        processPacket(raceStore.state, lapDataPacketFixture);

        assert.equal(raceStore.state.playerPosition, 2);
        assert.equal(raceStore.state.currentLap, 3);
        assert.equal(raceStore.state.lastLapTime, 92.45);
        assert.equal(raceStore.state.bestLapTime, 92.45);
        assert.deepEqual(raceStore.state.lapTimeHistory, [92.45]);
        assert.equal(raceStore.state.pitStatus, "none");
        assert.equal(raceStore.state.numPitStopsTaken, 0);
        assert.equal(raceStore.state.totalPenaltySeconds, 0);
        assert.equal(raceStore.state.gapAhead, 1.5);
        assert.equal(raceStore.state.carAheadLastLapTime, 92.1);
        assert.equal(raceStore.state.gapBehind, 0.85);
        assert.equal(raceStore.state.carBehindLastLapTime, 92.8);
    });

    it("is deterministic when called repeatedly with identical state and packet fixtures", () => {
        const stateA = structuredClone(raceStore.state);
        const stateB = structuredClone(raceStore.state);

        const lapPacket = createLapDataPacket({
            carOverrides: {
                0: {
                    m_carPosition: 1,
                    m_currentLapNum: 5,
                    m_lastLapTimeInMS: 89500,
                    m_pitStatus: 1,
                    m_numPitStops: 1,
                    m_penalties: 5,
                },
            },
        });

        processPacket(stateA, sessionPacketFixture);
        processPacket(stateA, lapPacket);

        processPacket(stateB, sessionPacketFixture);
        processPacket(stateB, lapPacket);

        assert.deepEqual(stateA, stateB);
        assert.equal(stateA.timestamp, 120500);
        assert.equal(stateA.playerPosition, 1);
        assert.equal(stateA.currentLap, 5);
        assert.equal(stateA.lastLapTime, 89.5);
        assert.equal(stateA.pitStatus, "pitting");
        assert.equal(stateA.numPitStopsTaken, 1);
        assert.equal(stateA.totalPenaltySeconds, 5);
    });
});

describe("processPacket - Additional F1 24/25 Packet Fixtures", () => {
    beforeEach(() => {
        raceStore.reset();
    });

    it("updates tyre, fuel, and ERS telemetry from a CarStatus packet fixture", () => {
        processPacket(raceStore.state, sessionPacketFixture);
        processPacket(raceStore.state, lapDataPacketFixture);
        processPacket(raceStore.state, carStatusPacketFixture);

        assert.equal(raceStore.state.actualTyreCompound, "C5");
        assert.equal(raceStore.state.visualTyreCompound, "Soft");
        assert.equal(raceStore.state.tireAgeLaps, 4);
        assert.equal(raceStore.state.ersStorage, 3200000);
        assert.equal(raceStore.state.fuelRemainingLaps, 1.8);
        assert.equal(raceStore.state.carAheadActualTyreCompound, "C4");
        assert.equal(raceStore.state.carAheadVisualTyreCompound, "Medium");
        assert.equal(raceStore.state.carAheadTireAgeLaps, 6);
        assert.equal(raceStore.state.carBehindActualTyreCompound, "C3");
        assert.equal(raceStore.state.carBehindVisualTyreCompound, "Hard");
        assert.equal(raceStore.state.carBehindTireAgeLaps, 2);
    });

    it("updates tyre wear and structural damage from a CarDamage packet fixture", () => {
        processPacket(raceStore.state, sessionPacketFixture);
        processPacket(raceStore.state, carDamagePacketFixture);

        assert.equal(raceStore.state.tireWearLR, 12);
        assert.equal(raceStore.state.tireWearRR, 14);
        assert.equal(raceStore.state.tireWearLF, 18);
        assert.equal(raceStore.state.tireWearRF, 19);
        assert.deepEqual(raceStore.state.carDamage, ["Front Left Wing: 15"]);
    });

    it("updates player penalties from an Event packet fixture and available tyres from TyreSets fixture", () => {
        processPacket(raceStore.state, sessionPacketFixture);
        processPacket(raceStore.state, eventPacketFixture);
        processPacket(raceStore.state, tyreSetsPacketFixture);

        assert.deepEqual(raceStore.state.playerPenalties, ["Drive through"]);
        assert.deepEqual(raceStore.state.availableTires, [
            {
                actualCompound: "C4",
                visualCompound: "Medium",
                wear: 0,
                lapsLeft: 25,
                usableLife: 22,
            },
        ]);
    });

    it("does not leak rival grid state across reset or separate state instances", () => {
        processPacket(raceStore.state, sessionPacketFixture);
        processPacket(raceStore.state, lapDataPacketFixture);

        const freshState = structuredClone(raceStore.state);
        raceStore.reset();

        // After reset, processing CarStatus without prior LapData should not read stale carAhead/carBehind
        processPacket(raceStore.state, carStatusPacketFixture);
        assert.equal(raceStore.state.carAheadActualTyreCompound, "");
        assert.equal(raceStore.state.carAheadVisualTyreCompound, "");
        assert.equal(raceStore.state.carBehindActualTyreCompound, "");
        assert.equal(raceStore.state.carBehindVisualTyreCompound, "");
        assert.equal(freshState.playerPosition, 2);
    });
});

describe("processPacket - Dynamic Player Car Index & Rival Interval Resolution (#3)", () => {
    beforeEach(() => {
        raceStore.reset();
    });

    it("resolves mid-session player telemetry and rival intervals for non-zero m_playerCarIndex without a prior Session packet", () => {
        const lapPacket = createLapDataPacket({
            m_header: { m_playerCarIndex: 7, m_sessionTime: 300.0 },
            carOverrides: {
                3: {
                    m_carPosition: 9,
                    m_currentLapNum: 12,
                    m_lastLapTimeInMS: 88100,
                    m_deltaToCarInFrontMinutesPart: 0,
                    m_deltaToCarInFrontMSPart: 900,
                },
                7: {
                    m_carPosition: 10,
                    m_currentLapNum: 12,
                    m_lastLapTimeInMS: 88450,
                    m_deltaToCarInFrontMinutesPart: 1,
                    m_deltaToCarInFrontMSPart: 2345,
                    m_pitStatus: 0,
                    m_numPitStops: 1,
                    m_penalties: 3,
                },
                12: {
                    m_carPosition: 11,
                    m_currentLapNum: 12,
                    m_lastLapTimeInMS: 89200,
                    m_deltaToCarInFrontMinutesPart: 0,
                    m_deltaToCarInFrontMSPart: 640,
                },
            },
        });

        processPacket(raceStore.state, lapPacket);

        assert.equal(raceStore.state.playerPosition, 10);
        assert.equal(raceStore.state.currentLap, 12);
        assert.equal(raceStore.state.lastLapTime, 88.45);
        assert.equal(raceStore.state.numPitStopsTaken, 1);
        assert.equal(raceStore.state.totalPenaltySeconds, 3);
        assert.equal(raceStore.state.carAheadIndex, 3);
        assert.equal(raceStore.state.gapAhead, 62.345);
        assert.equal(raceStore.state.carAheadLastLapTime, 88.1);
        assert.equal(raceStore.state.carBehindIndex, 12);
        assert.equal(raceStore.state.gapBehind, 0.64);
        assert.equal(raceStore.state.carBehindLastLapTime, 89.2);
    });

    it("extracts dynamic non-zero m_playerCarIndex across CarStatus, CarDamage, Event, and TyreSets mid-session without Session packet", () => {
        const playerIdx = 14;

        const lapPacket = createLapDataPacket({
            m_header: { m_playerCarIndex: playerIdx },
            carOverrides: {
                5: { m_carPosition: 1, m_lastLapTimeInMS: 90100 },
                [playerIdx]: {
                    m_carPosition: 2,
                    m_currentLapNum: 8,
                    m_lastLapTimeInMS: 90500,
                    m_deltaToCarInFrontMSPart: 1200,
                },
                19: {
                    m_carPosition: 3,
                    m_lastLapTimeInMS: 91000,
                    m_deltaToCarInFrontMSPart: 750,
                },
            },
        });

        const statusPacket = createCarStatusPacket({
            m_header: { m_playerCarIndex: playerIdx },
            carOverrides: {
                5: { m_actualTyreCompound: 19, m_visualTyreCompound: 17, m_tyresAgeLaps: 10 }, // C2 / Medium
                [playerIdx]: {
                    m_actualTyreCompound: 18, // C3
                    m_visualTyreCompound: 16, // Soft
                    m_tyresAgeLaps: 5,
                    m_ersStoreEnergy: 2500000,
                    m_fuelRemainingLaps: 2.4,
                },
                19: { m_actualTyreCompound: 20, m_visualTyreCompound: 18, m_tyresAgeLaps: 12 }, // C1 / Hard
            },
        });

        const damagePacket = createCarDamagePacket({
            m_header: { m_playerCarIndex: playerIdx },
            carOverrides: {
                0: { m_frontLeftWingDamage: 99 }, // Another car's damage should be ignored
                [playerIdx]: {
                    m_tyresWear: [20, 21, 22, 23],
                    m_rearWingDamage: 10,
                },
            },
        });

        const rivalPenaltyEvent = createEventPacket({
            m_header: { m_playerCarIndex: playerIdx },
            m_eventStringCode: "PENA",
            m_eventDetails: { vehicleIdx: 0, penaltyType: 0 },
        });

        const playerPenaltyEvent = createEventPacket({
            m_header: { m_playerCarIndex: playerIdx },
            m_eventStringCode: "PENA",
            m_eventDetails: { vehicleIdx: playerIdx, penaltyType: 1 }, // Stop and go
        });

        const rivalTyreSets = createTyreSetsPacket({
            m_header: { m_playerCarIndex: playerIdx },
            m_carIdx: 0,
        });

        const playerTyreSets = createTyreSetsPacket({
            m_header: { m_playerCarIndex: playerIdx },
            m_carIdx: playerIdx,
        });

        processPacket(raceStore.state, lapPacket);
        processPacket(raceStore.state, statusPacket);
        processPacket(raceStore.state, damagePacket);
        processPacket(raceStore.state, rivalPenaltyEvent);
        processPacket(raceStore.state, playerPenaltyEvent);
        processPacket(raceStore.state, rivalTyreSets);
        assert.deepEqual(raceStore.state.availableTires, []);
        processPacket(raceStore.state, playerTyreSets);

        assert.equal(raceStore.state.actualTyreCompound, "C3");
        assert.equal(raceStore.state.visualTyreCompound, "Soft");
        assert.equal(raceStore.state.tireAgeLaps, 5);
        assert.equal(raceStore.state.ersStorage, 2500000);
        assert.equal(raceStore.state.fuelRemainingLaps, 2.4);
        assert.equal(raceStore.state.carAheadActualTyreCompound, "C2");
        assert.equal(raceStore.state.carAheadVisualTyreCompound, "Medium");
        assert.equal(raceStore.state.carAheadTireAgeLaps, 10);
        assert.equal(raceStore.state.carBehindActualTyreCompound, "C1");
        assert.equal(raceStore.state.carBehindVisualTyreCompound, "Hard");
        assert.equal(raceStore.state.carBehindTireAgeLaps, 12);
        assert.equal(raceStore.state.tireWearLR, 20);
        assert.equal(raceStore.state.tireWearRR, 21);
        assert.equal(raceStore.state.tireWearLF, 22);
        assert.equal(raceStore.state.tireWearRF, 23);
        assert.deepEqual(raceStore.state.carDamage, ["Rear Wing: 10"]);
        assert.deepEqual(raceStore.state.playerPenalties, ["Stop and go"]);
        assert.equal(raceStore.state.availableTires.length, 1);
    });

    it("resolves leader (P1 with no car ahead) gapAhead and carAheadLastLapTime cleanly to 0", () => {
        // First put player in P2 so gapAhead is non-zero
        processPacket(raceStore.state, lapDataPacketFixture);
        assert.equal(raceStore.state.gapAhead, 1.5);

        // Now player overtakes for P1 (leader)
        const leaderLapPacket = createLapDataPacket({
            m_header: { m_playerCarIndex: 4 },
            carOverrides: {
                4: {
                    m_carPosition: 1,
                    m_currentLapNum: 4,
                    m_lastLapTimeInMS: 91200,
                    m_deltaToCarInFrontMinutesPart: 0,
                    m_deltaToCarInFrontMSPart: 0,
                },
                9: {
                    m_carPosition: 2,
                    m_currentLapNum: 4,
                    m_lastLapTimeInMS: 91800,
                    m_deltaToCarInFrontMinutesPart: 0,
                    m_deltaToCarInFrontMSPart: 1125,
                },
            },
        });

        processPacket(raceStore.state, leaderLapPacket);

        assert.equal(raceStore.state.playerPosition, 1);
        assert.equal(raceStore.state.carAheadIndex, -1);
        assert.equal(raceStore.state.gapAhead, 0);
        assert.equal(raceStore.state.carAheadLastLapTime, 0);
        assert.equal(raceStore.state.carBehindIndex, 9);
        assert.equal(raceStore.state.gapBehind, 1.125);
        assert.equal(raceStore.state.carBehindLastLapTime, 91.8);
    });

    it("resolves last place (no car behind) gapBehind and carBehindLastLapTime cleanly to 0 without out-of-bounds errors", () => {
        // First put player in P2 so gapBehind is non-zero
        processPacket(raceStore.state, lapDataPacketFixture);
        assert.equal(raceStore.state.gapBehind, 0.85);

        // Now player drops to last place (P22) behind P21
        const lastPlaceLapPacket = createLapDataPacket({
            m_header: { m_playerCarIndex: 21 },
            carOverrides: {
                15: {
                    m_carPosition: 21,
                    m_currentLapNum: 4,
                    m_lastLapTimeInMS: 93400,
                    m_deltaToCarInFrontMinutesPart: 0,
                    m_deltaToCarInFrontMSPart: 2100,
                },
                21: {
                    m_carPosition: 22,
                    m_currentLapNum: 4,
                    m_lastLapTimeInMS: 94100,
                    m_deltaToCarInFrontMinutesPart: 0,
                    m_deltaToCarInFrontMSPart: 3450,
                },
            },
        });

        processPacket(raceStore.state, lastPlaceLapPacket);

        assert.equal(raceStore.state.playerPosition, 22);
        assert.equal(raceStore.state.carAheadIndex, 15);
        assert.equal(raceStore.state.gapAhead, 3.45);
        assert.equal(raceStore.state.carAheadLastLapTime, 93.4);
        assert.equal(raceStore.state.carBehindIndex, -1);
        assert.equal(raceStore.state.gapBehind, 0);
        assert.equal(raceStore.state.carBehindLastLapTime, 0);
    });
});

describe("processPacket - Segregated Penalty Pipeline (#4)", () => {
    beforeEach(() => {
        raceStore.reset();
    });

    it("segregates time penalties from playerPenalties while tracking cumulative totalPenaltySeconds from lap data", () => {
        const timePenaltyEvent = createEventPacket({
            m_eventStringCode: "PENA",
            m_eventDetails: { vehicleIdx: 0, penaltyType: 4, time: 5 },
        });
        const secondTimePenaltyEvent = createEventPacket({
            m_eventStringCode: "PENA",
            m_eventDetails: { vehicleIdx: 0, penaltyType: 4, time: 3 },
        });
        const lapWithAccumulatedPenalties = createLapDataPacket({
            carOverrides: {
                0: {
                    m_carPosition: 3,
                    m_currentLapNum: 10,
                    m_penalties: 8,
                },
            },
        });

        processPacket(raceStore.state, timePenaltyEvent);
        processPacket(raceStore.state, secondTimePenaltyEvent);
        processPacket(raceStore.state, lapWithAccumulatedPenalties);

        assert.deepEqual(raceStore.state.playerPenalties, []);
        assert.equal(raceStore.state.totalPenaltySeconds, 8);
    });

    it("records actionable penalties for the player and removes a single matching instance upon receiving DTSV or SGSV", () => {
        const driveThroughEvent = createEventPacket({
            m_eventStringCode: "PENA",
            m_eventDetails: { vehicleIdx: 0, penaltyType: 0 },
        });
        const stopAndGoEvent = createEventPacket({
            m_eventStringCode: "PENA",
            m_eventDetails: { vehicleIdx: 0, penaltyType: 1 },
        });
        const rivalDriveThroughServed = createEventPacket({
            m_eventStringCode: "DTSV",
            m_eventDetails: { vehicleIdx: 5 },
        });
        const playerDriveThroughServed = createEventPacket({
            m_eventStringCode: "DTSV",
            m_eventDetails: { vehicleIdx: 0 },
        });
        const playerStopAndGoServed = createEventPacket({
            m_eventStringCode: "SGSV",
            m_eventDetails: { vehicleIdx: 0 },
        });

        // Player receives two Drive throughs and two Stop and go penalties
        processPacket(raceStore.state, driveThroughEvent);
        processPacket(raceStore.state, stopAndGoEvent);
        processPacket(raceStore.state, driveThroughEvent);
        processPacket(raceStore.state, stopAndGoEvent);

        assert.deepEqual(raceStore.state.playerPenalties, [
            "Drive through",
            "Stop and go",
            "Drive through",
            "Stop and go",
        ]);

        // Rival serving a penalty does not affect playerPenalties
        processPacket(raceStore.state, rivalDriveThroughServed);
        assert.equal(raceStore.state.playerPenalties.length, 4);

        // Serving one Drive through removes only one instance
        processPacket(raceStore.state, playerDriveThroughServed);
        assert.deepEqual(raceStore.state.playerPenalties, [
            "Stop and go",
            "Drive through",
            "Stop and go",
        ]);

        // Serving one Stop and go removes only one instance
        processPacket(raceStore.state, playerStopAndGoServed);
        assert.deepEqual(raceStore.state.playerPenalties, [
            "Drive through",
            "Stop and go",
        ]);

        // Serving remaining penalties clears the list
        processPacket(raceStore.state, playerDriveThroughServed);
        processPacket(raceStore.state, playerStopAndGoServed);
        assert.deepEqual(raceStore.state.playerPenalties, []);
    });
});

describe("processPacket - Weather Forecast Sanitization & Padding Removal (#5)", () => {
    beforeEach(() => {
        raceStore.reset();
    });

    it("strips 0-offset and trailing padding slots from a 64-sample Session packet fixture, retains only matching session samples, and sorts by TimeOffsetMinutes", () => {
        const activeSamples = [
            // Present (0-offset) sample for current session - should be discarded
            createWeatherForecastSample({ m_sessionType: 15, m_timeOffset: 0, m_weather: 0, m_rainPercentage: 0 }),
            // Out-of-order future samples for current session (15 = Race)
            createWeatherForecastSample({ m_sessionType: 15, m_timeOffset: 30, m_weather: 3, m_rainPercentage: 65 }),
            createWeatherForecastSample({ m_sessionType: 15, m_timeOffset: 5, m_weather: 1, m_rainPercentage: 15 }),
            // Sample from another session (e.g. Qualifying 1 = 5)
            createWeatherForecastSample({ m_sessionType: 5, m_timeOffset: 10, m_weather: 2, m_rainPercentage: 25 }),
            createWeatherForecastSample({ m_sessionType: 15, m_timeOffset: 15, m_weather: 2, m_rainPercentage: 40 }),
        ];

        // Trailing slots beyond m_numWeatherForecastSamples (createSessionPacket pads remaining slots to 64)
        const trailingSlots = [
            createWeatherForecastSample({ m_sessionType: 15, m_timeOffset: 0, m_weather: 0, m_rainPercentage: 0 }),
            createWeatherForecastSample({ m_sessionType: 0, m_timeOffset: 45, m_weather: 0, m_rainPercentage: 0 }),
        ];

        const sessionPacket = createSessionPacket({
            m_sessionType: 15, // Race
            m_numWeatherForecastSamples: activeSamples.length,
            m_weatherForecastSamples: [...activeSamples, ...trailingSlots],
            m_forecastAccuracy: 1, // Approximate
        });

        processPacket(raceStore.state, sessionPacket);

        assert.equal(sessionPacket.m_weatherForecastSamples.length, 64);
        assert.equal(raceStore.state.forecastAccuracy, "Approximate");
        assert.deepEqual(raceStore.state.weatherForecast, [
            {
                TimeOffsetMinutes: 5,
                Weather: "Light Cloud",
                RainPercentage: 15,
            },
            {
                TimeOffsetMinutes: 15,
                Weather: "Overcast",
                RainPercentage: 40,
            },
            {
                TimeOffsetMinutes: 30,
                Weather: "Light Rain",
                RainPercentage: 65,
            },
        ]);
    });

    it("strips zero-offset padding slots even when m_sessionType is 0 and records Perfect forecastAccuracy", () => {
        const sessionPacket = createSessionPacket({
            m_sessionType: 0, // Unknown (matches default 0 in raw zero-filled padding buffers)
            m_numWeatherForecastSamples: 64,
            m_weatherForecastSamples: [
                createWeatherForecastSample({ m_sessionType: 0, m_timeOffset: 0, m_weather: 0, m_rainPercentage: 0 }),
                createWeatherForecastSample({ m_sessionType: 0, m_timeOffset: 10, m_weather: 4, m_rainPercentage: 85 }),
                createWeatherForecastSample({ m_sessionType: 0, m_timeOffset: 5, m_weather: 3, m_rainPercentage: 55 }),
            ],
            m_forecastAccuracy: 0, // Perfect
        });

        processPacket(raceStore.state, sessionPacket);

        assert.equal(sessionPacket.m_weatherForecastSamples.length, 64);
        assert.equal(raceStore.state.forecastAccuracy, "Perfect");
        assert.deepEqual(raceStore.state.weatherForecast, [
            {
                TimeOffsetMinutes: 5,
                Weather: "Light Rain",
                RainPercentage: 55,
            },
            {
                TimeOffsetMinutes: 10,
                Weather: "Heavy Rain",
                RainPercentage: 85,
            },
        ]);
    });
});

describe("processPacket - Dual Tyre Compound (Actual C1-C5 & Visual) Tracking (#6)", () => {
    beforeEach(() => {
        raceStore.reset();
    });

    it("resolves actual Pirelli compounds (C1-C5, Inter, Wet) and visual compounds (Soft, Medium, Hard, Inter, Wet) alongside tyre age for player and rivals", () => {
        // Set up grid: car 1 in P1 (ahead), player (car 0) in P2, car 2 in P3 (behind)
        processPacket(raceStore.state, lapDataPacketFixture);

        // Stint 1: Hard allocation (C1 = Hard, C2 = Medium, C3 = Soft)
        const stint1Status = createCarStatusPacket({
            carOverrides: {
                0: { m_actualTyreCompound: 20, m_visualTyreCompound: 18, m_tyresAgeLaps: 14 }, // Player: C1 / Hard
                1: { m_actualTyreCompound: 19, m_visualTyreCompound: 17, m_tyresAgeLaps: 11 }, // Ahead: C2 / Medium
                2: { m_actualTyreCompound: 18, m_visualTyreCompound: 16, m_tyresAgeLaps: 7 },  // Behind: C3 / Soft
            },
        });

        processPacket(raceStore.state, stint1Status);

        assert.equal(raceStore.state.actualTyreCompound, "C1");
        assert.equal(raceStore.state.visualTyreCompound, "Hard");
        assert.equal(raceStore.state.tireAgeLaps, 14);
        assert.equal(raceStore.state.carAheadActualTyreCompound, "C2");
        assert.equal(raceStore.state.carAheadVisualTyreCompound, "Medium");
        assert.equal(raceStore.state.carAheadTireAgeLaps, 11);
        assert.equal(raceStore.state.carBehindActualTyreCompound, "C3");
        assert.equal(raceStore.state.carBehindVisualTyreCompound, "Soft");
        assert.equal(raceStore.state.carBehindTireAgeLaps, 7);

        // Legacy single-compound fields should not exist on state
        assert.equal("tireCompound" in raceStore.state, false);
        assert.equal("carAheadTireCompound" in raceStore.state, false);
        assert.equal("carBehindTireCompound" in raceStore.state, false);

        // Stint 2: Softest dry & wet weather transitions (C4, C5, Inter, Wet)
        const stint2Status = createCarStatusPacket({
            carOverrides: {
                0: { m_actualTyreCompound: 17, m_visualTyreCompound: 17, m_tyresAgeLaps: 1 }, // Player: C4 / Medium
                1: { m_actualTyreCompound: 7, m_visualTyreCompound: 7, m_tyresAgeLaps: 3 },   // Ahead: Inter / Inter
                2: { m_actualTyreCompound: 8, m_visualTyreCompound: 8, m_tyresAgeLaps: 2 },   // Behind: Wet / Wet
            },
        });

        processPacket(raceStore.state, stint2Status);

        assert.equal(raceStore.state.actualTyreCompound, "C4");
        assert.equal(raceStore.state.visualTyreCompound, "Medium");
        assert.equal(raceStore.state.tireAgeLaps, 1);
        assert.equal(raceStore.state.carAheadActualTyreCompound, "Inter");
        assert.equal(raceStore.state.carAheadVisualTyreCompound, "Inter");
        assert.equal(raceStore.state.carAheadTireAgeLaps, 3);
        assert.equal(raceStore.state.carBehindActualTyreCompound, "Wet");
        assert.equal(raceStore.state.carBehindVisualTyreCompound, "Wet");
        assert.equal(raceStore.state.carBehindTireAgeLaps, 2);

        // Clears rival dual tyre compounds when player moves to P1 (no car ahead)
        const leaderLapPacket = createLapDataPacket({
            carOverrides: {
                0: { m_carPosition: 1, m_currentLapNum: 4 },
                1: { m_carPosition: 2, m_currentLapNum: 4 },
            },
        });
        processPacket(raceStore.state, leaderLapPacket);
        processPacket(raceStore.state, stint2Status);

        assert.equal(raceStore.state.carAheadActualTyreCompound, "");
        assert.equal(raceStore.state.carAheadVisualTyreCompound, "");
        assert.equal(raceStore.state.carAheadTireAgeLaps, 0);
        assert.equal(raceStore.state.carBehindActualTyreCompound, "Inter");
        assert.equal(raceStore.state.carBehindVisualTyreCompound, "Inter");
        assert.equal(raceStore.state.carBehindTireAgeLaps, 3);
    });
});





