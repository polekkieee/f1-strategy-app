// strategyAI.js
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ERS_MAX_JOULES = 4_000_000;

const SuggestRaceStrategyOutput = z.object({
    lapToBox: z.number().int(),                                  // 0 = no further stop needed
    newTires: z.enum(["Soft", "Medium", "Hard", "Inter", "Wet"]),
    explanation: z.string(),
    confidence: z.enum(["low", "medium", "high"]),
});

const SYSTEM_PROMPT = `You are a world-class Formula 1 race strategist advising a driver in a racing game.
Rules:
- lapToBox is an absolute lap number between the current lap and the final lap. Use 0 if no further stop is needed.
- newTires must be a compound that appears under "Available tyre sets" (if the list is unknown, any compound).
- Fuel margin is a surplus (+) or deficit (-) in laps versus race distance, NOT fuel remaining.
- explanation: at most 8 words (e.g. "undercut ahead", "rain in 5 min").
- confidence: low when data is sparse (few laps completed), high when the data clearly supports the call.`;

const fmt = (n, d = 1) => (Number.isFinite(n) ? n.toFixed(d) : "n/a");

const formatForecast = (samples = []) =>
    samples.length
        ? samples.slice(0, 6)
            .map((s) => `+${s.TimeOffsetMinutes}min ${s.Weather} (${s.RainPercentage}% rain)`)
            .join("; ")
        : "none available";

const formatCompound = (visual, actual) =>
    visual && actual && visual !== actual
        ? `${visual} (${actual})`
        : visual || actual || "?";

// NOTE: only wear and usableLife are used. I haven't verified what `laps` (m_lifeSpan) means yet.
const formatTyreSets = (sets = []) =>
    sets.length
        ? sets.map((t) => `${formatCompound(t.visualCompound, t.actualCompound)} (${t.wear}% worn, usable life ${t.usableLife} laps)`).join("; ")
        : "unknown";

const formatRival = (gap, visualCompound, actualCompound, age, lastLap) =>
    gap > 0
        ? `${fmt(gap)}s away, ${formatCompound(visualCompound, actualCompound)} tyres ${age} laps old, last lap ${fmt(lastLap, 3)}s`
        : "none";

function buildPrompt(s) {
    const lapsRemaining = s.totalLaps > 0 ? s.totalLaps - s.currentLap : null;
    const recent = (s.lapTimeHistory ?? []).filter((t) => t > 0).slice(-8).map((t) => fmt(t, 3));
    const margin = s.fuelRemainingLaps;

    return `
Session: ${s.sessionType} at ${s.trackName}
Lap ${s.currentLap} of ${s.totalLaps || "?"}${lapsRemaining !== null ? ` (${lapsRemaining} remaining)` : ""}
Position: P${s.playerPosition}
Pit status: ${s.pitStatus || "none"}, stops made: ${s.numPitStopsTaken}
Game's own suggested pit lap (a hint only): ${s.pitStopWindowIdealLap > 0 ? s.pitStopWindowIdealLap : "none"}

Car ahead: ${formatRival(s.gapAhead, s.carAheadVisualTyreCompound, s.carAheadActualTyreCompound, s.carAheadTireAgeLaps, s.carAheadLastLapTime)}
Car behind: ${formatRival(s.gapBehind, s.carBehindVisualTyreCompound, s.carBehindActualTyreCompound, s.carBehindTireAgeLaps, s.carBehindLastLapTime)}

Last lap: ${fmt(s.lastLapTime, 3)}s | Best lap: ${fmt(s.bestLapTime, 3)}s
Recent laps (oldest to newest): ${recent.length ? recent.join(", ") : "none yet"}

Current tyres: ${formatCompound(s.visualTyreCompound, s.actualTyreCompound)}, ${s.tireAgeLaps} laps old
Tyre wear (% worn): FL ${s.tireWearLF}, FR ${s.tireWearRF}, RL ${s.tireWearLR}, RR ${s.tireWearRR}
Available tyre sets: ${formatTyreSets(s.availableTires)}
Fuel margin: ${margin >= 0 ? "+" : ""}${fmt(margin)} laps (positive = surplus, negative = will run short)
ERS: ${fmt(Math.min(100, (s.ersStorage / ERS_MAX_JOULES) * 100), 0)}% charged
Damage: ${s.carDamage?.length ? s.carDamage.join(", ") : "none"}

Weather now: ${s.weather} (forecast accuracy: ${s.forecastAccuracy || "unknown"})
Forecast: ${formatForecast(s.weatherForecast)}
Safety car: ${s.safetyCarStatus || "unknown"}
Penalties: ${s.totalPenaltySeconds}s added; ${s.playerPenalties?.length ? s.playerPenalties.join(", ") : "none pending"}
`.trim();
}

function sanitize(plan, s) {
    if (!plan) throw new Error("AI returned no plan");
    if (plan.lapToBox === 0) return plan;
    const min = s.currentLap;
    const max = s.totalLaps > 0 ? s.totalLaps : plan.lapToBox;
    return { ...plan, lapToBox: Math.min(Math.max(plan.lapToBox, min), max) };
}

export async function suggestAiRaceStrategy(state) {
    const response = await openai.responses.parse({
        model: "gpt-4o-mini",
        input: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: buildPrompt(state) },
        ],
        text: { format: zodTextFormat(SuggestRaceStrategyOutput, "strategy") },
    });
    return sanitize(response.output_parsed, state);
}