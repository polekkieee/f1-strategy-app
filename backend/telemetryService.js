import { F1TelemetryClient, constants } from "@deltazeroproduction/f1-udp-parser";
import { F1_25_CONSTANTS, F1_25_HELPERS } from "./udpAppendices.js";
import { raceStore, createInitialState } from "./raceStateStore.js";

const { PACKETS } = constants;
const { PACKET_IDS } = F1_25_CONSTANTS;

const ACTIONABLE_PENALTIES = {
    DRIVE_THROUGH: "Drive through",
    STOP_AND_GO: "Stop and go",
};

function removeFirstPlayerPenalty(state, penalty) {
    const idx = state.playerPenalties.indexOf(penalty);
    if (idx !== -1) state.playerPenalties.splice(idx, 1);
}

let client = null;

function getPacketTimestamp(packet) {
    const sessionTime = packet?.m_header?.m_sessionTime;
    return typeof sessionTime === "number" ? Math.round(sessionTime * 1000) : 0;
}

function getPlayerCarIndex(packet) {
    return packet?.m_header?.m_playerCarIndex ?? 0;
}

function updateGridOrder(state, lapDataPacket, playerPosition) {
    if (!lapDataPacket || !Array.isArray(lapDataPacket.m_lapData)) {
        state.carAheadIndex = -1;
        state.carBehindIndex = -1;
        return [];
    }

    const cars = lapDataPacket.m_lapData
        .map((car, idx) => ({
            position: car.m_carPosition,  // 1 = leader, 22 = last
            playerIndex: idx              // 0
        }))
        .filter(c => c.position > 0)     // ignore invalids
        .sort((a, b) => a.position - b.position);

    // Locate player in sorted active race order and resolve adjacent rivals
    const playerGridIndex = cars.findIndex(c => c.position === playerPosition);
    const indexAhead = playerGridIndex - 1;
    const indexBehind = playerGridIndex !== -1 ? playerGridIndex + 1 : -1;

    // Strict bounds checking to prevent undefined array reads
    state.carAheadIndex = checkGridIndexBounds(indexAhead, cars);
    state.carBehindIndex = checkGridIndexBounds(indexBehind, cars);

    return cars;
}

// Grid bound checking function
function checkGridIndexBounds(index, cars) {
    return (index >= 0 && index < cars.length)
        ? cars[index].playerIndex
        : -1;
}

/*
*   'port' is optional, defaults to 20777
*   'bigintEnabled' is optional, setting it to false makes the parser skip bigint values,
*                   defaults to true
*   'forwardAddresses' is optional, it's an array of Address objects to forward unparsed telemetry to. each address object is comprised of a port and an optional ip address
*                   defaults to undefined
*   'skipParsing' is optional, setting it to true will make the client not parse and emit content. You can consume telemetry data using forwardAddresses instead.
*                   defaults to false
*/

// client.on(PACKETS.participants, nothing);
// client.on(PACKETS.motion, nothing);
// client.on(PACKETS.carSetups, nothing);
// client.on(PACKETS.carTelemetry, nothing);
// client.on(PACKETS.finalClassification, nothing);
// client.on(PACKETS.lobbyInfo, nothing);
// client.on(PACKETS.sessionHistory, nothing);
// client.on(PACKETS.motionEx, nothing);
// function nothing() { }

function handleSession(state, sessionData) {
    state.timestamp = getPacketTimestamp(sessionData);
    state.trackName = F1_25_HELPERS.getTrackName(sessionData.m_trackId);
    state.sessionType = F1_25_HELPERS.getSessionTypeName(sessionData.m_sessionType);
    state.totalLaps = sessionData.m_totalLaps;
    state.pitStopWindowIdealLap = sessionData.m_pitStopWindowIdealLap;
    state.weather = F1_25_HELPERS.getWeatherDescription(sessionData.m_weather);

    const rawSamples = sessionData.m_weatherForecastSamples?.slice(
        0,
        sessionData.m_numWeatherForecastSamples
    ) || [];

    state.weatherForecast = rawSamples
        .filter(f => f.m_sessionType === sessionData.m_sessionType && f.m_timeOffset > 0)
        .map(forecast => ({
            TimeOffsetMinutes: forecast.m_timeOffset,
            Weather: F1_25_HELPERS.getWeatherDescription(forecast.m_weather),
            RainPercentage: forecast.m_rainPercentage
        }))
        .sort((a, b) => a.TimeOffsetMinutes - b.TimeOffsetMinutes);

    state.forecastAccuracy = sessionData.m_forecastAccuracy === 0 ? "Perfect" : "Approximate";
    state.safetyCarStatus = F1_25_HELPERS.getSafetyCarStatus(sessionData.m_safetyCarStatus);
}

function handleLapData(state, lapData) {
    state.timestamp = getPacketTimestamp(lapData);
    const playerCarIndex = getPlayerCarIndex(lapData);
    const me = lapData.m_lapData?.[playerCarIndex];
    if (!me) return;

    state.playerPosition = me.m_carPosition;
    updateGridOrder(state, lapData, state.playerPosition);

    state.pitStatus = me.m_pitStatus !== 0 ? "pitting" : "none";   // 1 = pit lane, 2 = pit area
    state.numPitStopsTaken = me.m_numPitStops;
    state.totalPenaltySeconds = me.m_penalties; // accumulated seconds

    if (state.currentLap < me.m_currentLapNum) {
        state.lastLapTime = me.m_lastLapTimeInMS / 1000;
        state.lapTimeHistory.push(state.lastLapTime);
        state.currentLap = me.m_currentLapNum;
        if (state.bestLapTime === 0 || (state.lastLapTime > 0 && state.lastLapTime < state.bestLapTime)) {
            state.bestLapTime = state.lastLapTime;
        }
    }

    const carAhead = state.carAheadIndex ?? -1;
    const carBehind = state.carBehindIndex ?? -1;

    if (carAhead !== -1) {
        state.gapAhead = me.m_deltaToCarInFrontMinutesPart * 60 + me.m_deltaToCarInFrontMSPart / 1000;
        state.carAheadLastLapTime = lapData.m_lapData[carAhead].m_lastLapTimeInMS / 1000;
    } else {
        state.gapAhead = 0;
        state.carAheadLastLapTime = 0;
    }
    if (carBehind !== -1) {
        state.gapBehind = lapData.m_lapData[carBehind].m_deltaToCarInFrontMinutesPart * 60 + lapData.m_lapData[carBehind].m_deltaToCarInFrontMSPart / 1000;
        state.carBehindLastLapTime = lapData.m_lapData[carBehind].m_lastLapTimeInMS / 1000;
    } else {
        state.gapBehind = 0;
        state.carBehindLastLapTime = 0;
    }
}

function handleCarStatus(state, carStatusData) {
    state.timestamp = getPacketTimestamp(carStatusData);
    const playerCarIndex = getPlayerCarIndex(carStatusData);
    const carAhead = state.carAheadIndex ?? -1;
    const carBehind = state.carBehindIndex ?? -1;

    if (carAhead !== -1 && carStatusData.m_carStatusData[carAhead]) {
        state.carAheadTireCompound = F1_25_HELPERS.getTyreCompound(carStatusData.m_carStatusData[carAhead].m_visualTyreCompound, true);
        state.carAheadTireAgeLaps = carStatusData.m_carStatusData[carAhead].m_tyresAgeLaps;
    } else {
        state.carAheadTireCompound = "";
        state.carAheadTireAgeLaps = 0;
    }
    if (carBehind !== -1 && carStatusData.m_carStatusData[carBehind]) {
        state.carBehindTireCompound = F1_25_HELPERS.getTyreCompound(carStatusData.m_carStatusData[carBehind].m_visualTyreCompound, true);
        state.carBehindTireAgeLaps = carStatusData.m_carStatusData[carBehind].m_tyresAgeLaps;
    } else {
        state.carBehindTireCompound = "";
        state.carBehindTireAgeLaps = 0;
    }

    const myStatus = carStatusData.m_carStatusData?.[playerCarIndex];
    if (!myStatus) return;

    state.tireCompound = F1_25_HELPERS.getTyreCompound(myStatus.m_visualTyreCompound, true);
    state.tireAgeLaps = myStatus.m_tyresAgeLaps;
    state.ersStorage = myStatus.m_ersStoreEnergy;
    state.fuelRemainingLaps = myStatus.m_fuelRemainingLaps;
}

function handleCarDamage(state, carDamageData) {
    const playerCarIndex = getPlayerCarIndex(carDamageData);
    const damage = carDamageData.m_carDamageData?.[playerCarIndex];
    if (!damage) return;

    state.carDamage = [];

    if (damage.m_frontLeftWingDamage > 0) state.carDamage.push("Front Left Wing: " + damage.m_frontLeftWingDamage);
    if (damage.m_frontRightWingDamage > 0) state.carDamage.push("Front Right Wing: " + damage.m_frontRightWingDamage);
    if (damage.m_rearWingDamage > 0) state.carDamage.push("Rear Wing: " + damage.m_rearWingDamage);
    if (damage.m_floorDamage > 0) state.carDamage.push("Floor: " + damage.m_floorDamage);
    if (damage.m_diffuserDamage > 0) state.carDamage.push("Diffuser: " + damage.m_diffuserDamage);
    if (damage.m_sidepodDamage > 0) state.carDamage.push("Sidepod: " + damage.m_sidepodDamage);
    if (damage.m_drsFault) state.carDamage.push("(Irreparable) DRS fault");
    if (damage.m_ersFault) state.carDamage.push("(Irreparable) ERS fault");

    state.tireWearLR = damage.m_tyresWear[0];
    state.tireWearRR = damage.m_tyresWear[1];
    state.tireWearLF = damage.m_tyresWear[2];
    state.tireWearRF = damage.m_tyresWear[3];
}

function handleEvent(state, eventData) {
    if (eventData.m_eventStringCode === "SEND") {
        for (const k of Object.keys(state)) delete state[k];
        Object.assign(state, createInitialState());
        return;
    }

    state.timestamp = getPacketTimestamp(eventData);
    const playerCarIndex = getPlayerCarIndex(eventData);

    switch (eventData.m_eventStringCode) {
        case "SSTA": // Session Started
            break;
        case "PENA": // Penalty
            if (eventData.m_eventDetails?.vehicleIdx === playerCarIndex) {
                switch (eventData.m_eventDetails.penaltyType) {
                    case 0: state.playerPenalties.push(ACTIONABLE_PENALTIES.DRIVE_THROUGH); break;
                    case 1: state.playerPenalties.push(ACTIONABLE_PENALTIES.STOP_AND_GO); break;
                    default: break;
                }
            }
            break;
        case "DTSV": // Drive through served
            if (eventData.m_eventDetails?.vehicleIdx === playerCarIndex) {
                removeFirstPlayerPenalty(state, ACTIONABLE_PENALTIES.DRIVE_THROUGH);
            }
            break;
        case "SGSV": // Stop go served
            if (eventData.m_eventDetails?.vehicleIdx === playerCarIndex) {
                removeFirstPlayerPenalty(state, ACTIONABLE_PENALTIES.STOP_AND_GO);
            }
            break;
        default: break;
    }
}

function handleTyreSets(state, tyreSetsData) {
    const playerCarIndex = getPlayerCarIndex(tyreSetsData);
    if (tyreSetsData.m_carIdx === playerCarIndex) {
        state.timestamp = getPacketTimestamp(tyreSetsData);
        state.availableTires = [];
        tyreSetsData.m_tyreSetData.forEach(set => {
            if (!set.m_fitted && set.m_available) {
                state.availableTires.push({
                    visualCompound: F1_25_HELPERS.getTyreCompound(set.m_visualTyreCompound, true),
                    wear: set.m_wear,
                    lapsLeft: set.m_lifeSpan,
                    usableLife: set.m_usableLife,
                });
            }
        });
    }
}

export function processPacket(state, packet) {
    if (!state || !packet?.m_header) {
        return state;
    }

    switch (packet.m_header.m_packetId) {
        case PACKET_IDS.SESSION:
            handleSession(state, packet);
            break;
        case PACKET_IDS.LAP_DATA:
            handleLapData(state, packet);
            break;
        case PACKET_IDS.EVENT:
            handleEvent(state, packet);
            break;
        case PACKET_IDS.CAR_STATUS:
            handleCarStatus(state, packet);
            break;
        case PACKET_IDS.CAR_DAMAGE:
            handleCarDamage(state, packet);
            break;
        case PACKET_IDS.TYRE_SETS:
            handleTyreSets(state, packet);
            break;
        default:
            break;
    }

    return state;
}

export function start() {
    if (!client) {
        client = new F1TelemetryClient({ port: 20777 });
        const dispatch = (data) => raceStore.mutate((state) => processPacket(state, data));
        client.on(PACKETS.event, dispatch);
        client.on(PACKETS.lapData, dispatch);
        client.on(PACKETS.session, dispatch);
        client.on(PACKETS.carStatus, dispatch);
        client.on(PACKETS.carDamage, dispatch);
        client.on(PACKETS.tyreSets, dispatch);
    }
    client.start();
}

export function stop() {
    if (client) {
        client.stop();
        client = null;
    }
}

export default { processPacket, start, stop };
