import { F1TelemetryClient, constants } from "@deltazeroproduction/f1-udp-parser";
import { F1_25_CONSTANTS, F1_25_HELPERS } from "./udpAppendices.js"
const { PACKETS } = constants;

let initialize = false;

let packetInfo = {
    format: 2025,                   // Header
    playerCarIndex: 0,              // Header
}

let inputData = {
    timestamp: 0,                   // -

    trackName: "",                  // Session
    sessionType: "",                // Session
    totalLaps: 0,                   // Session
    pitStopWindowIdealLap: 0,       // Session 
    weather: "",                    // Session
    weatherForecast: [],            // Session
    forecastAccuracy: "",           // Session
    trackStatus: "",                // Session

    currentLap: 0,                  // LapData
    playerPosition: 0,              // LapData
    gapAhead: 0,                    // LapData
    carAheadLastLapTime: 0,         // LapData
    gapBehind: 0,                   // LapData
    carBehindLastLapTime: 0,        // LapData
    lastLapTime: 0,                 // LapData
    lapTimeHistory: [],             // LapData
    bestLapTime: 0,                 // -

    carAheadTireCompound: "",       // CarStatus
    carAheadTireAgeLaps: 0,         // CarStatus
    carBehindTireCompound: "",      // CarStatus
    carBehindTireAgeLaps: 0,        // CarStatus
    tireCompound: "",               // CarStatus
    tireWearLF: 0,                  // CarStatus
    tireWearRF: 0,                  // CarStatus
    tireWearLR: 0,                  // CarStatus
    tireWearRR: 0,                  // CarStatus
    tireAgeLaps: 0,                 // CarStatus
    ersStorage: 0,                  // CarStatus

    carDamage: [],                  // CarDamage

    playerPenalties: [],            // Event

    availableTires: [],             // TyreSets
}

let gridOrder = []
let carAhead = -1;
let carBehind = -1;

function updateGridOrder(lapDataPacket) {
    if (!lapDataPacket || !Array.isArray(lapDataPacket.m_lapData)) return [];

    const cars = lapDataPacket.m_lapData
        .map((car, idx) => ({
            position: car.m_carPosition,  // 1 = leader, 22 = last
            playerIndex: idx              // 0–21
        }))
        .filter(c => c.position > 0)     // ignore invalids
        .sort((a, b) => a.position - b.position);

    carAhead = (inputData.playerPosition > 1 && cars.length >= inputData.playerPosition) ? cars[inputData.playerPosition - 2].playerIndex : -1;
    carBehind = (inputData.playerPosition < cars.length) ? cars[inputData.playerPosition].playerIndex : -1;
    return cars;
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

function initialPacketInfo(data) {
    packetInfo.format = data.m_header.m_packetFormat;
    packetInfo.playerCarIndex = data.m_header.m_playerCarIndex;
}

function handleSession(data) {
    if (initialize) {
        initialPacketInfo(data);
        initialize = false;
    }

    inputData.timestamp = Date.now();

    inputData.trackName = F1_25_HELPERS.getTrackName(data.m_trackId);
    inputData.sessionType = F1_25_HELPERS.getSessionTypeName(data.m_sessionType);
    inputData.totalLaps = data.m_totalLaps;
    inputData.pitStopWindowIdealLap = data.m_pitStopWindowIdealLap;
    inputData.weather = F1_25_HELPERS.getWeatherDescription(data.m_weather);
    inputData.weatherForecast = data.m_weatherForecastSamples.map(forecast => ({
        TimeOffsetMinutes: forecast.m_timeOffset,
        Weather: F1_25_HELPERS.getWeatherDescription(forecast.m_weather),
        RainPercentage: forecast.m_rainPercentage
    }));
    inputData.forecastAccuracy = data.m_forecastAccuracy === 0 ? "Perfect" : "Approximate";
    inputData.trackStatus = F1_25_HELPERS.getTrackStatus(data.m_trackStatus);
}

function handleLapData(data) {
    inputData.timestamp = Date.now();

    inputData.playerPosition = data.m_lapData[packetInfo.playerCarIndex].m_carPosition;
    gridOrder = updateGridOrder(data);

    if (inputData.currentLap < data.m_lapData[packetInfo.playerCarIndex].m_currentLapNum) {
        inputData.lapTimeHistory.push(inputData.lastLapTime);
        inputData.currentLap = data.m_lapData[packetInfo.playerCarIndex].m_currentLapNum;
        inputData.lastLapTime = data.m_lapData[packetInfo.playerCarIndex].m_lastLapTimeInMS / 1000;
        if (inputData.bestLapTime === 0 || (inputData.lastLapTime > 0 && inputData.lastLapTime < inputData.bestLapTime)) {
            inputData.bestLapTime = inputData.lastLapTime;
        }
    }

    if (carAhead !== -1) {
        inputData.gapAhead = data.m_lapData[packetInfo.playerCarIndex].m_deltaToCarInFrontMSPart / 1000;
        inputData.carAheadLastLapTime = data.m_lapData[carAhead].m_lastLapTimeInMS / 1000;
    }
    if (carBehind !== -1) {
        inputData.gapBehind = data.m_lapData[carBehind].m_deltaToCarInFrontMSPart / 1000;
        inputData.carBehindLastLapTime = data.m_lapData[carBehind].m_lastLapTimeInMS / 1000;
    }
}

function handleCarStatus(data) {
    inputData.timestamp = Date.now();

    if (carAhead !== -1) {
        inputData.carAheadTireCompound = F1_25_HELPERS.getTyreCompound(data.m_carStatusData[carAhead].m_visualTyreCompound, isVisual = true);
        inputData.carAheadTireAgeLaps = data.m_carStatusData[carAhead].m_tyresAgeLaps;
    }
    if (carBehind !== -1) {
        inputData.carBehindTireCompound = F1_25_HELPERS.getTyreCompound(data.m_carStatusData[carBehind].m_visualTyreCompound, isVisual = true);
        inputData.carBehindTireAgeLaps = data.m_carStatusData[carBehind].m_tyresAgeLaps;
    }
    inputData.tireCompound = F1_25_HELPERS.getTyreCompound(data.m_carStatusData[packetInfo.playerCarIndex].m_visualTyreCompound, isVisual = true);

    inputData.tireWearLR = data.m_carStatusData[packetInfo.playerCarIndex].m_tyresWear[0];
    inputData.tireWearRR = data.m_carStatusData[packetInfo.playerCarIndex].m_tyresWear[1];
    inputData.tireWearLF = data.m_carStatusData[packetInfo.playerCarIndex].m_tyresWear[2];
    inputData.tireWearRF = data.m_carStatusData[packetInfo.playerCarIndex].m_tyresWear[3];

    inputData.tireAgeLaps = data.m_carStatusData[packetInfo.playerCarIndex].m_tyresAgeLaps;
    inputData.ersStorage = data.m_carStatusData[packetInfo.playerCarIndex].m_ersStoreEnergy;
}

function handleCarDamage(data) {
    inputData.carDamage = [];
    const damage = data.m_carDamageData[packetInfo.playerCarIndex];

    if (damage.m_frontLeftWingDamage > 0) inputData.carDamage.push("Front Left Wing: " + damage.m_frontLeftWingDamage);
    if (damage.m_frontRightWingDamage > 0) inputData.carDamage.push("Front Right Wing: " + damage.m_frontRightWingDamage);
    if (damage.m_rearWingDamage > 0) inputData.carDamage.push("Rear Wing: " + damage.m_rearWingDamage);
    if (damage.m_floorDamage > 0) inputData.carDamage.push("Floor: " + damage.m_floorDamage);
    if (damage.m_diffuserDamage > 0) inputData.carDamage.push("Diffuser: " + damage.m_diffuserDamage);
    if (damage.m_sidepodDamage > 0) inputData.carDamage.push("Sidepod: " + damage.m_sidepodDamage);
    if (damage.m_drsFault) inputData.carDamage.push("(Irreparable) DRS fault");
    if (damage.m_ersFault) inputData.carDamage.push("(Irreparable) ERS fault");
}

function handleEvent(data) {
    inputData.timestamp = Date.now();
    switch (data.m_eventStringCode) {
        case "SSTA": // Session Started
            initialize = true;
            break;
        case "SEND": // Session Ended
            for (const key in inputData) inputData[key] = Array.isArray(inputData[key]) ? [] : 0;
            gridOrder = [];
            carAhead = -1;
            carBehind = -1;
            break;
        case "PENA": // Penalty
            if (data.m_eventDataDetails.vehicleIdx === packetInfo.playerCarIndex) {
                switch (data.m_eventDataDetails.penaltyType) {
                    case 0: inputData.playerPenalties.push("Drive through"); break;
                    case 1: inputData.playerPenalties.push("Stop and go"); break;
                    case 4: inputData.playerPenalties.push("Time penalty: " + data.m_eventDataDetails.time); break;
                    default: break;
                }
            }
            break;
        case "DTSV": // Drive through served
            if (data.m_eventDataDetails.vehicleIdx === packetInfo.playerCarIndex && inputData.playerPenalties.find(penalty => penalty === "Drive through")) {
                inputData.playerPenalties = inputData.playerPenalties.filter(p => p !== "Drive through");
            }
            break;
        case "SGSV": // Stop go served
            if (data.m_eventDataDetails.vehicleIdx === packetInfo.playerCarIndex && inputData.playerPenalties.find(penalty => penalty === "Stop and go")) {
                inputData.playerPenalties = inputData.playerPenalties.filter(penalty => penalty !== "Stop and go");
            }
            break;
        default: break;
    }
}

function handleTyreSets(data) {
    if (data.m_carIdx === packetInfo.playerCarIndex) {
        inputData.timestamp = Date.now();
        inputData.availableTires = [];
        data.m_tyreSetData.forEach(set => {
            if (!set.fitted) {
                inputData.availableTires.push({
                    visualCompound: F1_25_HELPERS.getTyreCompound(set.m_visualTyreCompound, true),
                    wear: set.m_wear,
                    laps: set.m_lifeSpan,
                });
            }
        });
    }
}

// to start listening:\
function start() {
    client.start();
}

function stop() {
    // and when you want to stop:
    client.stop();
}

export { start, stop, inputData, packetInfo };