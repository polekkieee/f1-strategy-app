import { F1_25_CONSTANTS } from "../../udpAppendices.js";

const { PACKET_IDS } = F1_25_CONSTANTS;
const GRID_SIZE = 22;

function buildCarArray(createCarItem, carOverrides = {}) {
    return Array.from({ length: GRID_SIZE }, (_, idx) =>
        carOverrides[idx] ? createCarItem(carOverrides[idx]) : createCarItem()
    );
}

export function createPacketHeader(overrides = {}) {
    return {
        m_packetFormat: 2025,
        m_gameYear: 25,
        m_gameMajorVersion: 1,
        m_gameMinorVersion: 0,
        m_packetVersion: 1,
        m_packetId: PACKET_IDS.SESSION,
        m_sessionUID: 123456789n,
        m_sessionTime: 120.5,
        m_frameIdentifier: 100,
        m_overallFrameIdentifier: 100,
        m_playerCarIndex: 0,
        m_secondaryPlayerCarIndex: 255,
        ...overrides,
    };
}

export function createWeatherForecastSample(overrides = {}) {
    return {
        m_sessionType: 15,
        m_timeOffset: 5,
        m_weather: 0,
        m_trackTemperature: 32,
        m_trackTemperatureChange: 0,
        m_airTemperature: 25,
        m_airTemperatureChange: 0,
        m_rainPercentage: 5,
        ...overrides,
    };
}

export function createSessionPacket(overrides = {}) {
    const { m_header, m_weatherForecastSamples, ...rest } = overrides;
    const sessionType = rest.m_sessionType ?? 15;
    return {
        m_header: createPacketHeader({
            m_packetId: PACKET_IDS.SESSION,
            ...m_header,
        }),
        m_weather: 0,
        m_trackTemperature: 32,
        m_airTemperature: 25,
        m_totalLaps: 57,
        m_trackLength: 5412,
        m_sessionType: sessionType,
        m_trackId: 3,
        m_formula: 0,
        m_sessionTimeLeft: 3600,
        m_sessionDuration: 5400,
        m_pitSpeedLimit: 80,
        m_gamePaused: 0,
        m_isSpectating: 0,
        m_spectatorCarIndex: 255,
        m_sliProNativeSupport: 0,
        m_numMarshalZones: 0,
        m_marshalZones: [],
        m_safetyCarStatus: 0,
        m_networkGame: 0,
        m_numWeatherForecastSamples: m_weatherForecastSamples ? m_weatherForecastSamples.length : 1,
        m_weatherForecastSamples: m_weatherForecastSamples ?? [
            createWeatherForecastSample({ m_sessionType: sessionType, m_timeOffset: 5, m_weather: 1, m_rainPercentage: 10 }),
        ],
        m_forecastAccuracy: 0,
        m_aiDifficulty: 95,
        m_pitStopWindowIdealLap: 18,
        m_pitStopWindowLatestLap: 24,
        m_pitStopRejoinPosition: 6,
        ...rest,
    };
}

export function createCarLapData(overrides = {}) {
    return {
        m_lastLapTimeInMS: 0,
        m_currentLapTimeInMS: 0,
        m_sector1TimeMSPart: 0,
        m_sector1TimeMinutesPart: 0,
        m_sector2TimeMSPart: 0,
        m_sector2TimeMinutesPart: 0,
        m_deltaToCarInFrontMSPart: 0,
        m_deltaToCarInFrontMinutesPart: 0,
        m_deltaToRaceLeaderMSPart: 0,
        m_deltaToRaceLeaderMinutesPart: 0,
        m_lapDistance: 0,
        m_totalDistance: 0,
        m_safetyCarDelta: 0,
        m_carPosition: 0,
        m_currentLapNum: 1,
        m_pitStatus: 0,
        m_numPitStops: 0,
        m_sector: 0,
        m_currentLapInvalid: 0,
        m_penalties: 0,
        m_totalWarnings: 0,
        m_cornerCuttingWarnings: 0,
        m_numUnservedDriveThroughPens: 0,
        m_numUnservedStopGoPens: 0,
        m_gridPosition: 0,
        m_driverStatus: 4,
        m_resultStatus: 2,
        m_pitLaneTimerActive: 0,
        m_pitLaneTimeInLaneInMS: 0,
        m_pitStopTimerInMS: 0,
        m_pitStopShouldServePen: 0,
        m_speedTrapFastestSpeed: 0,
        m_speedTrapFastestLap: 0,
        ...overrides,
    };
}

export function createLapDataPacket(overrides = {}) {
    const { m_header, m_lapData, carOverrides, ...rest } = overrides;
    return {
        m_header: createPacketHeader({
            m_packetId: PACKET_IDS.LAP_DATA,
            ...m_header,
        }),
        m_lapData: m_lapData ?? buildCarArray(createCarLapData, carOverrides),
        m_timeTrialPBCarIdx: 255,
        m_timeTrialRivalCarIdx: 255,
        ...rest,
    };
}

export function createCarStatusData(overrides = {}) {
    return {
        m_tractionControl: 0,
        m_antiLockBrakes: 0,
        m_fuelMix: 1,
        m_frontBrakeBias: 56,
        m_pitLimiterStatus: 0,
        m_fuelInTank: 30,
        m_fuelCapacity: 110,
        m_fuelRemainingLaps: 1.5,
        m_maxRPM: 13500,
        m_idleRPM: 4000,
        m_maxGears: 8,
        m_drsAllowed: 1,
        m_drsActivationDistance: 0,
        m_actualTyreCompound: 16, // C5
        m_visualTyreCompound: 16, // Soft
        m_tyresAgeLaps: 3,
        m_vehicleFiaFlags: 0,
        m_enginePowerICE: 550000,
        m_enginePowerMGUK: 120000,
        m_ersStoreEnergy: 3000000,
        m_ersDeployMode: 1,
        m_ersHarvestedThisLapMGUK: 0,
        m_ersHarvestedThisLapMGUH: 0,
        m_ersDeployedThisLap: 0,
        m_networkPaused: 0,
        ...overrides,
    };
}

export function createCarStatusPacket(overrides = {}) {
    const { m_header, m_carStatusData, carOverrides, ...rest } = overrides;
    return {
        m_header: createPacketHeader({
            m_packetId: PACKET_IDS.CAR_STATUS,
            ...m_header,
        }),
        m_carStatusData: m_carStatusData ?? buildCarArray(createCarStatusData, carOverrides),
        ...rest,
    };
}

export function createCarDamageData(overrides = {}) {
    return {
        m_tyresWear: [10, 10, 12, 12],
        m_tyresDamage: [0, 0, 0, 0],
        m_brakesDamage: [0, 0, 0, 0],
        m_tyreBlisters: [0, 0, 0, 0],
        m_frontLeftWingDamage: 0,
        m_frontRightWingDamage: 0,
        m_rearWingDamage: 0,
        m_floorDamage: 0,
        m_diffuserDamage: 0,
        m_sidepodDamage: 0,
        m_drsFault: 0,
        m_ersFault: 0,
        m_gearBoxDamage: 0,
        m_engineDamage: 0,
        ...overrides,
    };
}

export function createCarDamagePacket(overrides = {}) {
    const { m_header, m_carDamageData, carOverrides, ...rest } = overrides;
    return {
        m_header: createPacketHeader({
            m_packetId: PACKET_IDS.CAR_DAMAGE,
            ...m_header,
        }),
        m_carDamageData: m_carDamageData ?? buildCarArray(createCarDamageData, carOverrides),
        ...rest,
    };
}

export function createEventPacket(overrides = {}) {
    const { m_header, m_eventDetails = {}, ...rest } = overrides;
    return {
        m_header: createPacketHeader({
            m_packetId: PACKET_IDS.EVENT,
            ...m_header,
        }),
        m_eventStringCode: "PENA",
        m_eventDetails: {
            vehicleIdx: 0,
            penaltyType: 0, // Drive through
            infringementType: 7,
            otherVehicleIdx: 255,
            time: 0,
            lapNum: 3,
            placesGained: 0,
            ...m_eventDetails,
        },
        ...rest,
    };
}

export function createTyreSetData(overrides = {}) {
    return {
        m_actualTyreCompound: 17, // C4
        m_visualTyreCompound: 17, // Medium
        m_wear: 0,
        m_available: 1,
        m_recommendedSession: 15,
        m_lifeSpan: 25,
        m_usableLife: 22,
        m_lapDeltaTime: 0,
        m_fitted: 0,
        ...overrides,
    };
}

export function createTyreSetsPacket(overrides = {}) {
    const { m_header, m_tyreSetData, ...rest } = overrides;
    return {
        m_header: createPacketHeader({
            m_packetId: PACKET_IDS.TYRE_SETS,
            ...m_header,
        }),
        m_carIdx: 0,
        m_tyreSetData: m_tyreSetData ?? [createTyreSetData()],
        m_fittedIdx: 0,
        ...rest,
    };
}

export const headerFixture = createPacketHeader();
export const sessionPacketFixture = createSessionPacket();
export const lapDataPacketFixture = createLapDataPacket({
    carOverrides: {
        0: {
            m_carPosition: 2,
            m_currentLapNum: 3,
            m_lastLapTimeInMS: 92450,
            m_deltaToCarInFrontMinutesPart: 0,
            m_deltaToCarInFrontMSPart: 1500,
            m_pitStatus: 0,
            m_numPitStops: 0,
            m_penalties: 0,
        },
        1: {
            m_carPosition: 1,
            m_currentLapNum: 3,
            m_lastLapTimeInMS: 92100,
            m_deltaToCarInFrontMinutesPart: 0,
            m_deltaToCarInFrontMSPart: 0,
        },
        2: {
            m_carPosition: 3,
            m_currentLapNum: 3,
            m_lastLapTimeInMS: 92800,
            m_deltaToCarInFrontMinutesPart: 0,
            m_deltaToCarInFrontMSPart: 850,
        },
    },
});
export const carStatusPacketFixture = createCarStatusPacket({
    carOverrides: {
        0: {
            m_actualTyreCompound: 16, // C5
            m_visualTyreCompound: 16, // Soft
            m_tyresAgeLaps: 4,
            m_ersStoreEnergy: 3200000,
            m_fuelRemainingLaps: 1.8,
        },
        1: {
            m_actualTyreCompound: 17, // C4
            m_visualTyreCompound: 17, // Medium
            m_tyresAgeLaps: 6,
        },
        2: {
            m_actualTyreCompound: 18, // C3
            m_visualTyreCompound: 18, // Hard
            m_tyresAgeLaps: 2,
        },
    },
});
export const carDamagePacketFixture = createCarDamagePacket({
    carOverrides: {
        0: {
            m_tyresWear: [12, 14, 18, 19],
            m_frontLeftWingDamage: 15,
        },
    },
});
export const eventPacketFixture = createEventPacket();
export const tyreSetsPacketFixture = createTyreSetsPacket();
