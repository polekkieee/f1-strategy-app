import { F1TelemetryClient, constants } from "@deltazeroproduction/f1-udp-parser";
import { F1_25_CONSTANTS, F1_25_HELPERS } from "./udpAppendices.js"
import { broadcast } from "./websocketServer.js";
import { raceStore } from "./raceStateStore.js";
const { PACKETS } = constants;


let initialize = false;

let packetInfo = {
    format: 2025,                   // Header
    playerCarIndex: 0,              // Header
}

let gridOrder = []
let carAhead = -1;
let carBehind = -1;

function updateGridOrder(lapDataPacket, playerPosition) {
    if (!lapDataPacket || !Array.isArray(lapDataPacket.m_lapData)) return [];

    const cars = lapDataPacket.m_lapData
        .map((car, idx) => ({
            position: car.m_carPosition,  // 1 = leader, 22 = last
            playerIndex: idx              // 0
        }))
        .filter(c => c.position > 0)     // ignore invalids
        .sort((a, b) => a.position - b.position);

    // Calculate target array indices based on current player position
    const indexAhead = playerPosition - 2;
    const indexBehind = playerPosition;

    // Strict bounds checking to prevent undefined array reads
    carAhead = checkGridIndexBounds(indexAhead, cars);

    carBehind = checkGridIndexBounds(indexBehind, cars);

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

const client = new F1TelemetryClient({ port: 20777 });
client.on(PACKETS.event, (data) => handleEvent(data));
client.on(PACKETS.lapData, (data) => handleLapData(data));
client.on(PACKETS.session, (data) => handleSession(data));
client.on(PACKETS.carStatus, (data) => handleCarStatus(data));
client.on(PACKETS.carDamage, (data) => handleCarDamage(data));
client.on(PACKETS.tyreSets, (data) => handleTyreSets(data));

// client.on(PACKETS.participants, nothing);
// client.on(PACKETS.motion, nothing);
// client.on(PACKETS.carSetups, nothing);
// client.on(PACKETS.carTelemetry, nothing);
// client.on(PACKETS.finalClassification, nothing);
// client.on(PACKETS.lobbyInfo, nothing);
// client.on(PACKETS.sessionHistory, nothing);
// client.on(PACKETS.motionEx, nothing);
// function nothing() { }

function initialPacketInfo(packetInfoData) {
    packetInfo.format = packetInfoData.m_header.m_packetFormat;
    packetInfo.playerCarIndex = packetInfoData.m_header.m_playerCarIndex;
}

function handleSession(sessionData) {
    if (initialize) {
        initialPacketInfo(sessionData);
        initialize = false;
    }

    raceStore.mutate((state) => {
        state.timestamp = Date.now();
        state.trackName = F1_25_HELPERS.getTrackName(sessionData.m_trackId);
        state.sessionType = F1_25_HELPERS.getSessionTypeName(sessionData.m_sessionType);
        state.totalLaps = sessionData.m_totalLaps;
        state.pitStopWindowIdealLap = sessionData.m_pitStopWindowIdealLap;
        state.weather = F1_25_HELPERS.getWeatherDescription(sessionData.m_weather);

        state.weatherForecast = sessionData.m_weatherForecastSamples?.map(forecast => ({
            TimeOffsetMinutes: forecast.m_timeOffset,
            Weather: F1_25_HELPERS.getWeatherDescription(forecast.m_weather),
            RainPercentage: forecast.m_rainPercentage
        })) || [];

        state.forecastAccuracy = sessionData.m_forecastAccuracy === 0 ? "Perfect" : "Approximate";
        state.trackStatus = F1_25_HELPERS.getTrackStatus(sessionData.m_trackStatus);
    });
}

function handleLapData(lapData) {
    raceStore.mutate((state) => {
        state.timestamp = Date.now();

        state.playerPosition = lapData.m_lapData[packetInfo.playerCarIndex].m_carPosition;
        gridOrder = updateGridOrder(lapData, state.playerPosition);

        if (state.currentLap < lapData.m_lapData[packetInfo.playerCarIndex].m_currentLapNum) {
            state.lapTimeHistory.push(state.lastLapTime);
            state.currentLap = lapData.m_lapData[packetInfo.playerCarIndex].m_currentLapNum;
            state.lastLapTime = lapData.m_lapData[packetInfo.playerCarIndex].m_lastLapTimeInMS / 1000;
            if (state.bestLapTime === 0 || (state.lastLapTime > 0 && state.lastLapTime < state.bestLapTime)) {
                state.bestLapTime = state.lastLapTime;
            }
        }

        if (carAhead !== -1) {
            state.gapAhead = lapData.m_lapData[packetInfo.playerCarIndex].m_deltaToCarInFrontMSPart / 1000;
            state.carAheadLastLapTime = lapData.m_lapData[carAhead].m_lastLapTimeInMS / 1000;
        }
        if (carBehind !== -1) {
            state.gapBehind = lapData.m_lapData[carBehind].m_deltaToCarInFrontMSPart / 1000;
            state.carBehindLastLapTime = lapData.m_lapData[carBehind].m_lastLapTimeInMS / 1000;
        }

    });
}

function handleCarStatus(carStatusData) {
    raceStore.mutate((state) => {
        state.timestamp = Date.now();

        if (carAhead !== -1) {
            state.carAheadTireCompound = F1_25_HELPERS.getTyreCompound(carStatusData.m_carStatusData[carAhead].m_visualTyreCompound, isVisual = true);
            state.carAheadTireAgeLaps = carStatusData.m_carStatusData[carAhead].m_tyresAgeLaps;
        }
        if (carBehind !== -1) {
            state.carBehindTireCompound = F1_25_HELPERS.getTyreCompound(carStatusData.m_carStatusData[carBehind].m_visualTyreCompound, isVisual = true);
            state.carBehindTireAgeLaps = carStatusData.m_carStatusData[carBehind].m_tyresAgeLaps;
        }
        state.tireCompound = F1_25_HELPERS.getTyreCompound(carStatusData.m_carStatusData[packetInfo.playerCarIndex].m_visualTyreCompound, isVisual = true);

        state.tireWearLR = carStatusData.m_carStatusData[packetInfo.playerCarIndex].m_tyresWear[0];
        state.tireWearRR = carStatusData.m_carStatusData[packetInfo.playerCarIndex].m_tyresWear[1];
        state.tireWearLF = carStatusData.m_carStatusData[packetInfo.playerCarIndex].m_tyresWear[2];
        state.tireWearRF = carStatusData.m_carStatusData[packetInfo.playerCarIndex].m_tyresWear[3];

        state.tireAgeLaps = carStatusData.m_carStatusData[packetInfo.playerCarIndex].m_tyresAgeLaps;
        state.ersStorage = carStatusData.m_carStatusData[packetInfo.playerCarIndex].m_ersStoreEnergy;
    });
}

function handleCarDamage(carDamageData) {
    raceStore.mutate((state) => {
        state.carDamage = [];
        const damage = carDamageData.m_carDamageData[packetInfo.playerCarIndex];
        if (!damage) return;

        if (damage.m_frontLeftWingDamage > 0) state.carDamage.push("Front Left Wing: " + damage.m_frontLeftWingDamage);
        if (damage.m_frontRightWingDamage > 0) state.carDamage.push("Front Right Wing: " + damage.m_frontRightWingDamage);
        if (damage.m_rearWingDamage > 0) state.carDamage.push("Rear Wing: " + damage.m_rearWingDamage);
        if (damage.m_floorDamage > 0) state.carDamage.push("Floor: " + damage.m_floorDamage);
        if (damage.m_diffuserDamage > 0) state.carDamage.push("Diffuser: " + damage.m_diffuserDamage);
        if (damage.m_sidepodDamage > 0) state.carDamage.push("Sidepod: " + damage.m_sidepodDamage);
        if (damage.m_drsFault) state.carDamage.push("(Irreparable) DRS fault");
        if (damage.m_ersFault) state.carDamage.push("(Irreparable) ERS fault");
    });
}

function handleEvent(eventData) {
    raceStore.mutate((state) => {
        state.timestamp = Date.now();
        switch (eventData.m_eventStringCode) {
            case "SSTA": // Session Started
                initialize = true;
                break;
            case "SEND": // Session Ended
                for (const key in state) state[key] = Array.isArray(state[key]) ? [] : 0;
                gridOrder = [];
                carAhead = -1;
                carBehind = -1;
                break;
            case "PENA": // Penalty
                if (eventData.m_eventDataDetails.vehicleIdx === packetInfo.playerCarIndex) {
                    switch (eventData.m_eventDataDetails.penaltyType) {
                        case 0: state.playerPenalties.push("Drive through"); break;
                        case 1: state.playerPenalties.push("Stop and go"); break;
                        case 4: state.playerPenalties.push("Time penalty: " + eventData.m_eventDataDetails.time); break;
                        default: break;
                    }
                }
                break;
            case "DTSV": // Drive through served
                if (eventData.m_eventDataDetails.vehicleIdx === packetInfo.playerCarIndex && state.playerPenalties.find(penalty => penalty === "Drive through")) {
                    state.playerPenalties = state.playerPenalties.filter(p => p !== "Drive through");
                }
                break;
            case "SGSV": // Stop go served
                if (eventData.m_eventDataDetails.vehicleIdx === packetInfo.playerCarIndex && state.playerPenalties.find(penalty => penalty === "Stop and go")) {
                    state.playerPenalties = state.playerPenalties.filter(penalty => penalty !== "Stop and go");
                }
                break;
            default: break;
        }
    });
}

function handleTyreSets(tyreSetsData) {
    raceStore.mutate((state) => {
        if (tyreSetsData.m_carIdx === packetInfo.playerCarIndex) {
            state.timestamp = Date.now();
            state.availableTires = [];
            tyreSetsData.m_tyreSetData.forEach(set => {
                if (!set.fitted) {
                    state.availableTires.push({
                        visualCompound: F1_25_HELPERS.getTyreCompound(set.m_visualTyreCompound, true),
                        wear: set.m_wear,
                        laps: set.m_lifeSpan,
                    });
                }
            });
        }
    });
}

// broadcast to frontend
let broadcastInterval;

export function start() {
    client.start();
}

export function stop() {
    client.stop();
}

export default { packetInfo };