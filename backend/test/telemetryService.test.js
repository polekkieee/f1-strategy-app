import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { raceStore } from "../raceStateStore.js";
import { processPacket } from "../telemetryService.js";
import {
    createPacketHeader,
    createSessionPacket,
    createLapDataPacket,
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

        assert.equal(raceStore.state.tireCompound, "Soft");
        assert.equal(raceStore.state.tireAgeLaps, 4);
        assert.equal(raceStore.state.ersStorage, 3200000);
        assert.equal(raceStore.state.fuelRemainingLaps, 1.8);
        assert.equal(raceStore.state.carAheadTireCompound, "Medium");
        assert.equal(raceStore.state.carAheadTireAgeLaps, 6);
        assert.equal(raceStore.state.carBehindTireCompound, "Hard");
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
        assert.equal(raceStore.state.carAheadTireCompound, "");
        assert.equal(raceStore.state.carBehindTireCompound, "");
        assert.equal(freshState.playerPosition, 2);
    });
});


