
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SuggestRaceStrategyOutput = z.object({
    lapToBox: z.number(),
    newTires: z.string(),
    explanation: z.string(),
});

/**
 * Suggests a race strategy based on the provided input.
 * @param {Object} input - Race data for strategy suggestion.
 * @param {number} input.timestamp
 * @param {string} input.trackName
 * @param {string} input.sessionType
 * 
 * @param {number} input.currentLap
 * @param {number} input.totalLaps
 * 
 * @param {number} input.playerPosition
 * 
 * @param {number} input.gapAhead
 * @param {string} input.carAheadTireCompound
 * @param {number} input.carAheadTireAgeLaps
 * @param {number} input.carAheadLastLapTime
 * @param {number} input.gapBehind
 * @param {string} input.carBehindTireCompound
 * @param {number} input.carBehindTireAgeLaps
 * @param {number} input.carBehindLastLapTime
 * 
 * @param {number} input.lastLapTime
 * @param {number} input.bestLapTime
 * @param {number[]} input.lapTimeHistory
 * 
 * @param {string[]} input.carDamage
 * @param {string} input.tireCompound
 * @param {number} input.tireWearLF
 * @param {number} input.tireWearRF
 * @param {number} input.tireWearLR
 * @param {number} input.tireWearRR
 * @param {number} input.tireAgeLaps
 * @param {number} input.ersStorage
 * 
 * @param {number} input.pitStopWindowIdealLap
 * 
 * @param {string} input.weather
 * @param {string[]} input.weatherForecast
 * @param {string} input.forecastAccuracy
 * 
 * @param {string} input.trackStatus
 * @param {string[]} input.playerPenalties
 * 
 * @param {string[]} input.availableTires
 * 
 * 
 * @returns {Promise<Object>} - The suggested strategy in JSON format.
 */

export async function suggestAiRaceStrategy(input) {
    const prompt = `
You are a world-class Formula 1 race strategist. Analyze the following race data and suggest the optimal pit stop strategy.

Race Data:
- Timestamp: ${input.timestamp}
- Track: ${input.trackName}
- Session: ${input.sessionType}

- Current Lap: ${input.currentLap} / ${input.totalLaps}
- Position: P${input.playerPosition}

- Gap Ahead: ${input.gapAhead}s | Car Ahead Tires: ${input.carAheadTireCompound}, Age: ${input.carAheadTireAgeLaps} laps, Last Lap: ${input.carAheadLastLapTime}s
- Gap Behind: ${input.gapBehind}s | Car Behind Tires: ${input.carBehindTireCompound}, Age: ${input.carBehindTireAgeLaps} laps, Last Lap: ${input.carBehindLastLapTime}s

- Last Lap Time: ${input.lastLapTime}s
- Best Lap Time: ${input.bestLapTime}s
- Lap History: [${input.lapTimeHistory.length > 0 ? input.lapTimeHistory.join(", ") : "No lap history available"}]

- Car Damage: ${input.carDamage && input.carDamage.length > 0 ? input.carDamage.join(", ") : "None"}
- Current Tires: ${input.tireCompound}, Wear Left Front: ${input.tireWearLF}%, Wear Right Front: ${input.tireWearRF}%, Wear Left Rear: ${input.tireWearLR}%, Wear Right Rear: ${input.tireWearRR}%, Age: ${input.tireAgeLaps} laps
- ERS Storage: ${input.ersStorage}%

- Current Ideal Pit Lap: Lap ${input.pitStopWindowIdealLap}

- Weather: ${input.weather}
- Forecast: [${input.weatherForecast.length > 0 ? input.weatherForecast.join(", ") : "No forecast available"}]
- Forecast Accuracy: ${input.forecastAccuracy}

- Track Status: ${input.trackStatus}
- Penalties: [${input.playerPenalties.length > 0 ? input.playerPenalties.join(", ") : "None"}]

Return a JSON object with the following keys:
- lapToBox: The lap number when the driver should pit.
- newTires: The tire compound to switch to (soft, medium, hard, inter, wet).
- explanation: A very short reason (e.g., "undercut ahead", "rain incoming", "reduce tire wear"). Keep it to a few words.
`;

    const response = await openai.responses.parse({
        model: "gpt-4o-mini",
        input: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt },
        ],
        text: {
            format: zodTextFormat(SuggestRaceStrategyOutput, "strategy"),
        },
    });

    return response.output_parsed;
}