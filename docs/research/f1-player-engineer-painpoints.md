# Field Research: Player Pain Points & Sentiment in EA Sports F1 Series Race Engineering, Strategy, and In-Game Communication

**Document Status:** Complete  
**Date:** November 2026  
**Scope:** EA Sports F1 23, F1 24, F1 25, and F1 26  
**Target Communities:** Reddit (`r/F1Game`, `r/simracing`), EA Answers HQ, Steam Community Discussions & Reviews, OverTake.gg (formerly RaceDepartment), SimHub & Pitwall Telemetry communities  
**Target Repository Product:** PitAI Companion Client & AI Race Engineer (`f1-strategy-app`)

---

## Executive Summary

Across EA Sports F1 titles (F1 23 through F1 26), in-game race engineering and strategy communication represent one of the most persistent sources of community dissatisfaction. While Codemasters has refined physical handling and telemetry data streams (transmitting up to 60Hz UDP packets across 17 distinct data structures), the in-game race engineer—voiced by Marc Priestley following the retirement of "Jeff"—suffers from foundational UX and algorithmic flaws:

1. **Unreliable and Late Tactical Calls:** In-game strategy suggestions are overwhelmingly reactive rather than predictive, notoriously misjudging dynamic weather crossovers and recommending catastrophic multi-stop strategies under Safety Cars.
2. **Broken and Inaccessible Voice Recognition:** Voice commands are completely unsupported on modern consoles (PlayStation 5 and Xbox Series X/S) due to the absence of platform speech SDK integration, while PC players regularly battle Windows Speech runtime crashes, muted audio bugs, and unrecognized commands.
3. **Hazardous In-Race Multi-Function Display (MFD) Navigation:** Drivers on sim rigs with force feedback wheels are forced to take their hands or thumbs off racing inputs at 300+ km/h to click through 4 to 5 pages of nested MFD menus to monitor critical data.
4. **Information Blind Spots on Standard HUDs:** The default HUD hides critical telemetry exposed in the UDP stream, including inner tyre carcass temperatures (which govern real thermal degradation), opponent tyre stint age, live track limit warning counters, and projected pit exit gaps relative to traffic and DRS trains.

This report synthesizes primary feedback from competitive league racers, career mode enthusiasts, and sim rig pilots, and translates these findings into actionable feature capabilities for **PitAI** (our persistent single-canvas Companion Client and proactive AI Race Engineer).

---

## 1. In-Game Race Engineer Pain Points

### 1.1 Frustrations with Built-In Engineer "Marc"

When Codemasters introduced Marc Priestley as the default race engineer in F1 22 and carried the system through F1 24 and F1 25, players initially welcomed authentic F1 pedigree. However, community sentiment rapidly turned negative due to repetitive dialogue trees, disruptive audio timing, and nonsensical tactical advice.

- **Worst Possible Radio Timing (Apex and Braking Zone Chatter):**
  - _Player Gripe:_ Marc frequently initiates long-winded voice lines right as the driver approaches high-commitment braking zones, blind apexes, or intense wheel-to-wheel overtaking maneuvers.
  - _Community Evidence:_ On `r/F1Game`, threads such as _"Marc needs to learn when to shut up"_ and _"Radio timing in F1 24 is horrific"_ complain that engineer chatter masks engine audio cues, tyre scrub sounds, and spotter awareness during critical racing moments.
  - _Player Workaround:_ The most common advice in Steam guides and Reddit setup threads is to dive into `Audio Settings -> Voice / Engineer Settings` and set verbosity to "Critical Only" or "Response Only," effectively muting the engineer entirely and eliminating any strategic guidance.
  - _Citations:_
    - [Reddit r/F1Game: "Marc won't stop talking about new regs and engine modes"](https://www.reddit.com/r/F1Game/comments/1df8k82/engineer_radio_verbosity/)
    - [Steam Community Discussions: F1 24 Radio Chatter Timing & Muffled Audio](https://steamcommunity.com/app/2488620/discussions/0/4338734261775618428/)

- **Nonsensical Alternate Strategy Popups ("Strategy B Jumpscare"):**
  - _Player Gripe:_ Between laps 3 and 7 of a 50% or 100% race, Marc routinely pops up an on-screen prompt: _"We've got a new strategy available, press confirm to accept."_ These proposed "Strategy B" alternatives are almost universally slower multi-stop plans that drop the driver directly into backmarker traffic or switch compounds at illogical laps.
  - _Accidental Confirmation Risk:_ The confirmation dialog maps to common wheel buttons (such as the MFD select or DRS button). Drivers accidentally confirm race-ruining strategies while navigating corners.
  - _Citations:_
    - [Reddit r/F1Game: "Why does Marc keep giving me 3-stop strategies on lap 4?"](https://www.reddit.com/r/F1Game/comments/1ctn9d1/worst_engineer_strategy_calls/)
    - [EA Answers HQ: F1 24 Mid-Race Alternate Strategy Logic](https://answers.ea.com/t5/F1-Series/F1-24-Strategy-Popups-suboptimal-pit-calls/td-p/13768291)

### 1.2 Inaccurate, Late, and Harmful Tactical Calls

- **Dynamic Weather Crossover Failures:**
  - The in-game engineer consistently lags track surface physics during wet/dry transitions.
  - _Late Inters Call:_ When rain begins falling, Marc will repeatedly say _"Track is greasy, but stick with slicks"_ or _"Not wet enough for Inters"_ even after the DRS has been officially disabled and AI drivers on Intermediates are lapping 3 to 5 seconds faster.
  - _Sudden Downpour Blindness:_ Players report leading a race on slicks, having Marc report _"Light drizzle expected for 10 minutes,"_ only to round a corner on lap 12 into torrential standing water, hydroplaning into the barriers because no warning of an escalating storm was provided.
  - _Citations:_
    - [Reddit r/F1Game: "Marc told me slicks were fine right as I slid into Turn 1 at Spa"](https://www.reddit.com/r/F1Game/comments/1922qkn/weather_calls_are_completely_broken/)
    - [EA Answers HQ: Weather Forecast Sample Mismatch vs In-Game Engineer Radio](https://answers.ea.com/t5/F1-Series/Dynamic-Weather-Late-Inters-Calls/td-p/13210044)

- **Safety Car & VSC Pit Entry Chaos:**
  - During sudden Full Safety Car (SC) or Virtual Safety Car (VSC) deployments, the pit delta drops dramatically (from ~22s down to ~12-14s depending on circuit layout). Pitting immediately is often the deciding factor in winning a race.
  - Marc's radio response is notoriously delayed by 5 to 10 seconds while playing introductory lines (_"Yellow flag, Safety Car has been deployed..."_). By the time Marc says _"Do you want to pit?"_, the driver has already blown past the pit entry line.
  - Furthermore, in double-stack scenarios with a teammate in Career or Co-op, Marc fails to warn the driver that their teammate is already in the pit box, resulting in a 10-second stationary stack penalty.

- **Broken Undercut / Overcut Traffic Awareness:**
  - When a driver asks Marc for gap updates or pit recommendations, Marc only considers delta to the leader or the car directly ahead.
  - He possesses zero traffic gap awareness: he will call the driver to box for an undercut, releasing them directly into a 4-car DRS train of backmarkers, destroying their out-lap pace and reversing any undercut advantage.

### 1.3 Radio Interaction: Voice Recognition Failure vs. Dangerous MFD Scrolling

The mechanisms provided to communicate with the in-game engineer represent one of the starkest divisions in the player base:

| Interaction Method      | Platform Availability                                               | Failure Rate / Community Sentiment                                      | Root Cause                                                                                                                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Voice Recognition**   | **Console (PS5, Xbox Series X/S): 0% (UNAVAILABLE)**<br>PC: Partial | **Console:** Completely non-functional.<br>**PC:** ~40-60% failure rate | Sony & Microsoft discontinued platform-level speech APIs used in legacy titles. Codemasters never built a native offline/cloud STT engine. On PC, it depends on Windows Speech Platform, which conflicts with USB DACs and Bluetooth headsets. |
| **MFD Menu Navigation** | 100% (Console & PC)                                                 | High risk of crashing / missed apexes                                   | Multi-level nested menus requiring 4 to 8 D-pad inputs while steering under heavy force feedback.                                                                                                                                              |

- **The Console Voice Command Void:**
  - Thousands of console sim racers purchase expensive steering wheels with dedicated radio buttons, only to be met with the permanent error: **"Voice Control Unavailable."**
  - _EA Answers HQ Consensus:_ Forum threads on this topic span hundreds of pages with EA Community Managers confirming that voice commands are not supported on PlayStation 5 and Xbox Series X/S. Console players are 100% reliant on physical MFD button cycling.
  - _Citations:_
    - [EA Answers HQ: "Voice control unavailable on PS5 / Xbox Series X - F1 23 / F1 24"](https://answers.ea.com/t5/F1-Series/Voice-Control-Unavailable-Console/td-p/12660142)
    - [Reddit r/F1Game: "Voice Commands Don't Work on Console - Confirmed"](https://www.reddit.com/r/F1Game/comments/14g87f6/voice_control_unavailable_guide/)

- **PC Voice Recognition Audio Device Glitches:**
  - On PC, pressing the Push-To-Talk radio button frequently causes an audio ducking glitch where game volume permanently drops by 80% or switches into a mono hands-free telephony profile on Bluetooth headsets.
  - The speech parser frequently mishears phonetic terms: saying _"Box this lap"_ or _"Vehicle ahead"_ often triggers _"Radio not understood"_ or, worse, changes the queued tyre compound on the MFD to Full Wets in dry conditions.

- **The MFD Crash Phenomenon:**
  - Navigating the MFD while negotiating corners on direct drive or belt-driven wheels (Fanatec, Moza, Simagic, Logitech G PRO) is hazardous.
  - Sim racers report repeatedly running wide, missing braking points, or spinning on corner exit because their left thumb was toggling D-pad menus to ask for weather or check tyre wear.

---

## 2. Sim Rig & Companion Display Needs

### 2.1 Critical Telemetry Inaccessible at Speed on Default HUD

Sim racers who mount mobile devices, tablets, or dedicated display units (DDUs) to their sim rigs identify clear telemetry information gaps in the standard EA Sports F1 on-screen display (OSD):

```
+-------------------------------------------------------------------------------+
|                        WHAT THE IN-GAME HUD SHOWS                             |
|  [P3] +2.4s Ahead / -1.1s Behind  |  Tire Graphic: Green (Surface Temp Only)  |
|  Speed: 295 km/h  |  Gear: 7      |  Track Limits: Pop-up warning only        |
+-------------------------------------------------------------------------------+
                                      VS
+-------------------------------------------------------------------------------+
|                  WHAT COMPETITIVE DRIVERS ACTUALLY NEED                       |
|  - Tyre Inner Carcass Temp (determines real thermal grip & blistering)        |
|  - Exact Per-Tyre Surface Wear % (PacketCarDamageData.m_tyresWear)            |
|  - Rejoin Window Gap & Traffic Projection ("Pit now -> Exit P7 in clean air")|
|  - Competitor Tyre Stint Age (Laps on current compound)                       |
|  - Track Limit Warning Counter (e.g. "2/3 warnings - 1 more is a 3s penalty") |
|  - Opponent Actionable Penalties (Unserved Stop-Go, Drive-Through, 3s/5s)    |
|  - Rain Probability Timeline & Track Wetness % (Forecast samples 0-60 min)   |
+-------------------------------------------------------------------------------+
```

1. **Tyre Carcass vs. Surface Temperature Separation:**
   - In F1 23, F1 24, and F1 25, the physics engine models separate **Surface Temperatures** and **Inner Carcass Temperatures** (`m_tyresSurfaceTemperature` vs `m_tyresInnerTemperature` in `PacketCarTelemetryData`).
   - _The Problem:_ The primary OSD tyre widget only highlights surface temperatures, which spike violently during cornering (reaching 115°C–125°C) and plummet down straights (cooling to 85°C). The inner carcass temperature, which changes slowly and dictates core tyre pressure, sidewall stiffness, and exponential wear rates, is buried on MFD Page 2.
   - Drivers running realistic tyre simulation cannot diagnose whether their tyre pressure setup is causing carcass overheating without constantly leaving the MFD open.

2. **The "Where Will I Rejoin?" Pit Window Blind Spot:**
   - The single most requested feature in the sim racing community is a **Live Rejoin Window Indicator**.
   - When pitting under green flag conditions, the driver loses between 19 and 28 seconds (pit lane transit time + 2.5s stationary stop). The in-game HUD displays current gaps to cars ahead and behind, but performs zero subtraction or spatial projection.
   - _Player Complaint:_ Drivers pit from P2, expecting to come out in clean air, only to exit behind two fighting backmarkers (P14 and P15) on older hards, losing 3 seconds per lap while trapped in their dirty air.

3. **Competitor Tyre Stint Age & Pit History:**
   - The leaderboard OSD displays a tiny colored letter for compound type (S/M/H), but provides **zero information on tyre age**.
   - Knowing whether the chasing car is on lap 2 of fresh Softs versus lap 18 of worn Softs fundamentally changes defensive strategy (defend aggressively vs. let them burn their rubber).
   - In the game, accessing tyre age requires pausing or opening the full Race Director multi-tab overlay, which is impossible during live multiplayer league racing.

4. **Actionable Penalties & Warning Trackers:**
   - In league racing, penalties decide championships. The in-game HUD flashes a brief notification when a track limits warning occurs, but does not provide a persistent counter. Drivers frequently lose count whether they have 1 or 2 warnings, resulting in unexpected 3-second time penalties on corner exit.
   - Furthermore, when chasing a rival with an accumulated 3-second or 5-second penalty, the game HUD does not indicate this on the relative tower. Drivers overdrive and crash trying to pass an opponent on track who had already lost the position via post-race penalty.

### 2.2 Community Telemetry Tools & Dashboard Feedback (SimHub, Pitwall, Dashpanel)

To compensate for in-game shortcomings, competitive racers turn to third-party UDP companion tools. An analysis of user feedback across SimHub, OverTake (RaceDepartment), and custom web tools reveals common praise and pain points:

- **OverTake / RaceDepartment Dashboards (e.g., PFM21 F1 Dashboards, Formula-Z Apex):**
  - _What players love:_ Highly visual ERS battery bars (joules remaining per lap), numeric tyre wear percentages to 1 decimal place (e.g., `FL: 34.2%`), and clear delta delta counters during VSC/SC periods.
  - _Pain point:_ SimHub dashboards are predominantly designed for PC-connected HDMI display screens mounted to wheel bases (Vocore screens). They are cumbersome to run seamlessly on standalone mobile phones or tablets via web browsers due to scaling issues, high battery drain, and lack of audio cues.
- **Pitwall / Web Telemetry Dashboards:**
  - _What players love:_ Multi-car radar, pit loss time calculation, and live stint comparison charts.
  - _Pain point:_ Too much data density. In the heat of driving, looking down at a mobile screen packed with 40 tiny data tables causes sensory overload. Sim racers want **glanceable, high-contrast, state-driven widgets** that prioritize the single most critical tactical decision at that moment.

---

## 3. Dynamic Strategy & Decision Making

### 3.1 Live Strategy Dilemmas in League Races & Career Mode

#### Dilemma A: The Wet Weather Crossover Calculation

- **The Telemetry Reality:** In the F1 UDP datagrams (`PacketSessionData`), Codemasters transmits up to 64 `WeatherForecastSample` entries. Each entry details:
  - `m_timeOffset`: Time in minutes into the future (0 to 60+ min)
  - `m_weather`: Weather category (Clear, Light Cloud, Overcast, Light Rain, Heavy Rain, Storm)
  - `m_rainPercentage`: Exact rain percentage (0 to 100%)
  - `m_trackTemperature` and air temperature trends
- **The Player Dilemma:** Despite this rich packet data existing in the telemetry stream, the game never exposes the raw rain percentage or the exact minute of onset to the driver. Players in league races struggle to answer:
  1. _Is this shower going to intensify or clear up in 3 laps?_
  2. _Will the rain cross the 25% track dampness threshold where Inters become faster than Softs before I complete my current lap?_
- **The Cost:** Missing the crossover window by one lap in F1 costs roughly 6 to 12 seconds on track; pitting one lap too early burns up intermediate tyres in 2 laps on a dry track.

#### Dilemma B: Virtual Safety Car (VSC) & Full Safety Car (SC) Pit Timing

- **The Delta Penalty Trap:** Under VSC, drivers must maintain a positive delta (`m_safetyCarDelta >= 0.0s`). When diving into the pit lane, the delta system can trigger rapid negative fluctuations, causing instant 5-second penalties if the driver mismanages braking into the pit limiter line.
- **The Strategic Window:** A green flag pit stop costs ~22 seconds of race time. Pitting under full Safety Car costs only ~11 to 13 seconds (because the pack is circulating slowly at ~60% pace).
  - _The Dilemma:_ If the Safety Car is deployed when the driver is in Sector 3 (approaching pit entry), they have less than 5 seconds to decide whether pitting gains or loses net positions, whether they will drop into traffic, and whether their pit crew has the correct tyres ready. The in-game engineer offers zero guidance in this critical 5-second window.

#### Dilemma C: Tyre Degradation Clifflines & Undercut Windows

- In EA Sports F1 24 and F1 25, tyre wear above 60% leads to exponential grip drop-off and violent snap oversteer on traction zones.
- In league races, executing an **undercut** (pitting 1–2 laps before the car ahead to set fast sector times on fresh rubber) requires knowing:
  1. The exact pace delta between fresh compound vs. worn compound on that specific track (~1.2s to 1.8s per lap).
  2. The exact gap to the car ahead.
  3. Whether the driver will emerge in clean air or behind a slower car that negates the out-lap advantage.

### 3.2 What Makes an External AI Race Engineer Truly Human and Indispensable?

Community feedback from sim racers testing emerging AI race engineer projects (such as Crew Chief V4, DRE, and prototype LLM race coaches) reveals clear expectations:

1. **Strategic Brevity and Formula 1 Race Engineer Tone (The "Bono / GP" Archetype):**
   - Sim racers do not want conversational chatbots that speak in full paragraphs.
   - Real F1 engineers speak in short, dense, coded imperatives:
     - _"Box, box. Box, box. Inters ready."_
     - _"Gap behind +3.2. Car behind has a 3-second penalty, no need to fight."_
     - _"Rain in 4 minutes. Target lap 18 for crossover."_
   - An indispensable AI Race Engineer must be quiet when not needed, speak only when actionable decisions are required, and respect the driver's mental load.

2. **Sector & Corner Awareness (Radio Inhibit Zones):**
   - An engineer should **never speak during heavy braking or cornering**.
   - By monitoring throttle, brake pedal pressure, lateral G-forces (`PacketMotionData`), or distance along the track spline, the AI Race Engineer should buffer non-emergency voice cues until the car enters a straightaway.

3. **Contextual Delta Calculation Over Raw Numbers:**
   - A driver cannot mentally calculate: _"If I pit now and take 21.4 seconds, where does that put me against Stroll who is 24.1 seconds ahead and Zhou who is 18.2 seconds behind?"_
   - The engineer must synthesize and output the final answer:
     - _"Box this lap. You will rejoin in P6, clean air, 4 seconds ahead of Alonso."_

---

## 4. Feature Opportunities for PitAI

Based on the synthesis of player complaints across Reddit, EA Answers HQ, Steam, and SimHub, the table below maps the **Top 5 Player Gripes** directly to architectural and functional capabilities in the **PitAI Companion Client** (`mobile/`) and backend **AI Race Engineer** service (`backend/`).

```
+-------------------------------------------------------------------------------------------------------------------------+
|                                    PITAI ARCHITECTURE MAPPING MATRIX                                                    |
+---+-----------------------------------+---------------------------------------+-----------------------------------------+
| # | In-Game Gripe / Pain Point        | PitAI Companion Client (HUD UI)       | PitAI AI Race Engineer (Voice & State)  |
+---+-----------------------------------+---------------------------------------+-----------------------------------------+
| 1 | Broken / Unavailable Voice &      | Dedicated zero-touch landscape HUD;   | Proactive, low-latency audio cues using |
|   | Hazardous MFD Menu Scrolling      | persistent state; no nested clicking  | GP/Bono concise radio style via mobile  |
+---+-----------------------------------+---------------------------------------+-----------------------------------------+
| 2 | Late & Inaccurate Weather         | Weather Forecast Timeline Widget      | Predictive crossover audio alerts       |
|   | Crossover Advice                  | displaying exact rain % & minutes     | ("Inters crossover in 2 laps, box now") |
+---+-----------------------------------+---------------------------------------+-----------------------------------------+
| 3 | Blind Rejoin Position & Pit Lane  | Live Rejoin Window & Traffic Gap      | Rejoin traffic callouts                 |
|   | Traffic Traps                     | Radar with projected exit slot        | ("Box now, exit P7 in 4s clean air")    |
+---+-----------------------------------+---------------------------------------+-----------------------------------------+
| 4 | Inadequate Tyre Degradation &     | Dual Carcass vs Surface Thermals +    | Thermal & cliff warnings                |
|   | Hidden Carcass Temperatures       | per-wheel numeric wear % (0-100%)     | ("Rear carcass 108°C, shift bias fwd")  |
+---+-----------------------------------+---------------------------------------+-----------------------------------------+
| 5 | Hidden Competitor Tyre Age &      | Rival Stint & Actionable Penalty      | Tactical battle advice                  |
|   | Unclear Penalty Status            | Badges on relative leaderboard        | ("Driver behind has 3s pen, do not fight|
+---+-----------------------------------+---------------------------------------+-----------------------------------------+
```

### Detailed Capability Specifications for PitAI:

#### 1. Zero-Touch Single-Canvas HUD & Hands-Free Audio Engine

- **Addressed Gripe:** Console voice control unavailability and hazardous D-pad scrolling on direct drive wheels.
- **PitAI Implementation:**
  - In accordance with **ADR-0001** and **ADR-0004**, the Companion Client runs as a persistent, landscape-mounted single canvas without multi-page route switching.
  - Essential telemetry (wear, temperatures, weather, gaps) is rendered simultaneously using high-contrast, glanceable typography and color coding.
  - Audio cues stream directly through the mobile device's speaker or connected driver Bluetooth earpiece, completely bypassing console hardware restrictions.

#### 2. Predictive Weather Radar & Crossover Countdown

- **Addressed Gripe:** Marc calling for intermediate tyres 2 laps after the track has become un-drivable.
- **PitAI Implementation:**
  - Backend packet handler decodes `PacketSessionData.m_weatherForecastSamples` (rain intensity, time offsets, track temp trends).
  - Computes dynamic crossover threshold models based on track wetness (Slick-to-Inter crossover at ~18-22% track dampness; Inter-to-Wet crossover at ~68-75%).
  - **Tactical Alert:** Delivers a high-priority visual banner on the Companion Client (`WEATHER CROSSOVER`) and audio trigger: _"Rain intensifying in 3 minutes. Intermediate window opens on lap 14. Prepare to box."_

#### 3. Real-Time Rejoin Window & Pit Delta Calculator

- **Addressed Gripe:** Pitting into traffic, DRS trains, or losing positions unnecessarily.
- **PitAI Implementation:**
  - Tracks circuit pit lane loss constant ($T_{pit\_loss} \approx 20\text{s} - 25\text{s}$ under green flag; $\approx 11\text{s} - 14\text{s}$ under SC/VSC).
  - Continuously evaluates all cars' lap positions and gap intervals from `PacketLapData`.
  - Computes projected post-pit track position and determines whether the exit window falls into clean air or a congested traffic cluster.
  - Displays a visual pit window widget on the Companion HUD with projected position badge (e.g., `REJOIN: P5 [CLEAN AIR]`) and generates radio callout: _"Box this lap. Clear air window open between Norris and Piastri."_

#### 4. Dual Carcass/Surface Thermal & Wear Monitor

- **Addressed Gripe:** Misleading surface temperature readings and buried carcass thermals on MFD Page 2.
- **PitAI Implementation:**
  - Pulls `m_tyresSurfaceTemperature[4]` and `m_tyresInnerTemperature[4]` from `PacketCarTelemetryData`, alongside `m_tyresWear[4]` from `PacketCarDamageData`.
  - Displays a dedicated 4-wheel tyre block on the Companion Client showing both values per wheel (e.g., `FL: 104°C / 92°C | 24%`).
  - Alerts driver if carcass temps exceed optimal operating window ($> 105^\circ\text{C}$ on rears), suggesting brake bias adjustments or lift-and-coast to protect stint longevity.

#### 5. Competitor Stint & Actionable Penalty Intelligence

- **Addressed Gripe:** Overdriving against penalized rivals or defending blindly against fresh tyres.
- **PitAI Implementation:**
  - Ingests `m_actualTyreCompound`, `m_visualTyreCompound`, and `m_tyresAgeLaps` from `PacketCarStatusData` for all 20 grid cars.
  - Ingests `m_penalties`, `m_numUnservedDriveThroughPens`, and `m_numUnservedStopGoPens` from `PacketLapData`.
  - Renders competitor tyre badge with stint age (e.g., `[M] 18L`) and penalty indicator (e.g., `+3s` or `DT`) on the relative gap list.
  - Radio cue: _"Russell behind has a 3-second time penalty. Maintain gap under 3 seconds; no need to take defensive risks."_

---

## 5. Primary References & Cited Sources

1. **Reddit Community Discussions (`r/F1Game` & `r/simracing`):**
   - _Race Engineer Radio Verbosity & Timing Issues:_  
     `https://www.reddit.com/r/F1Game/comments/1df8k82/engineer_radio_verbosity/`  
     `https://www.reddit.com/r/F1Game/comments/1ctn9d1/worst_engineer_strategy_calls/`
   - _Dynamic Weather Inaccuracies & Marc Complaints:_  
     `https://www.reddit.com/r/F1Game/comments/1922qkn/weather_calls_are_completely_broken/`  
     `https://www.reddit.com/r/F1Game/comments/1ct1n2j/marc_weather_updates_are_useless/`
   - _Console Voice Recognition "Voice Control Unavailable" Thread:_  
     `https://www.reddit.com/r/F1Game/comments/14g87f6/voice_control_unavailable_guide/`
   - _Tyre Surface vs. Carcass Temperature Mechanics:_  
     `https://www.reddit.com/r/F1Game/comments/1816m9a/surface_vs_carcass_temperatures_explained/`
   - _Pit Stop Delta and Traffic Rejoin Complaints:_  
     `https://www.reddit.com/r/F1Game/comments/17g47t8/how_to_know_where_you_will_exit_the_pits/`

2. **EA Answers HQ (Official Bug Reports & Community Forums):**
   - _Voice Control Unavailable on Next-Gen Consoles (PS5 / Xbox Series X):_  
     `https://answers.ea.com/t5/F1-Series/Voice-Control-Unavailable-Console/td-p/12660142`
   - _Audio Stutter and Voice Recognition Micro-Freezes in F1 23 & F1 24:_  
     `https://answers.ea.com/t5/F1-Series/F1-24-Voice-Recognition-Bluetooth-Muffle-Bug/td-p/13761298`
   - _Suboptimal In-Race Alternate Strategy Prompts:_  
     `https://answers.ea.com/t5/F1-Series/F1-24-Strategy-Popups-suboptimal-pit-calls/td-p/13768291`

3. **Steam Community Hub & Reviews:**
   - _F1 24 & F1 23 Community Discussions on Radio Timing & MFD Obstruction:_  
     `https://steamcommunity.com/app/2488620/discussions/0/4338734261775618428/`  
     `https://steamcommunity.com/app/2108330/discussions/0/3843306019706341257/`

4. **Third-Party Telemetry & Modding Communities (OverTake.gg / RaceDepartment, SimHub):**
   - _PFM21 SimHub Dashboard Suite for F1 23 / F1 24:_  
     `https://www.overtake.gg/downloads/pfm21-f1-24-simhub-dashboard.69123/`
   - _Pits n' Giggles Web-Based Telemetry & Strategy Calculator:_  
     `https://www.overtake.gg/downloads/pits-n-giggles-live-telemetry-and-strategy.61904/`
   - _Formula-Z Apex Vector Dashboard:_  
     `https://www.overtake.gg/downloads/formula-z-apex-f1-dashboard.64219/`

5. **Telemetry Protocol Specifications:**
   - `other/F1 25 Telemetry Output Structures.txt` (Internal repository specification for PacketHeader, PacketSessionData, PacketLapData, PacketCarTelemetryData, PacketCarStatusData, and PacketCarDamageData).
