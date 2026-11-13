# F1 Strategy App

An active AI Race Engineer and live companion for EA Sports F1 sim racers, delivering real-time strategy calls and pit window recommendations based on live UDP telemetry.

## Language

**AI Race Engineer**:
An automated strategist service that evaluates live race state to proactively advise the driver on pit timing, tyre compounds, and race tactics.  
_Avoid_: Strategy bot, chatbot, telemetry viewer

**Race State**:
The consolidated, real-time snapshot of the current session, player car metrics, weather forecast, and rival gaps held in memory by the backend.  
_Avoid_: Telemetry dump, raw packets, state cache

**Companion Client**:
The dedicated mobile application (built with Expo) mounted at the driver's sim rig to surface real-time engineer calls and essential race telemetry.  
_Avoid_: Web dashboard, frontend, admin panel

**Packet Ingestion**:
The background UDP socket listener that decodes incoming F1 24/25 telemetry datagrams and updates the Race State.  
_Avoid_: Poller, API fetcher

**Packet Fixture**:
A synthetic or recorded UDP packet data structure used to verify packet handlers and state transitions offline without a live game instance.  
_Avoid_: Mock data, dummy payload

**Actionable Penalty**:
A disciplinary action requiring driver execution during the race (Drive Through, Stop and Go), distinct from accumulated numeric time penalty seconds.  
_Avoid_: Time penalty, penalty string

**Pure Packet Handler**:
A deterministic function that accepts a parsed telemetry packet and applies updates to the Race State, completely isolated from network transport.  
_Avoid_: Socket handler, event listener

**Actual Tyre Compound**:
The specific Pirelli compound grade (C1 hardest to C5 softest) determining physical degradation rates in the simulation.  
_Avoid_: Tire type, compound number

**Visual Tyre Compound**:
The regulatory display designation (Soft, Medium, Hard, Intermediate, Wet) used for UI badge visualization.  
_Avoid_: Tire color, tire string

**Dual Tyre Temperature**:
The distinct measurement of tyre surface temperature (fluctuating with slip angle and braking) alongside inner carcass temperature (indicating structural thermal degradation and blistering), decoded per wheel.  
_Avoid_: Tyre heat, rubber temperature, temp gauge

**Session Status**:
The lifecycle state of the track session (`active`, `completed`), dictating whether the Race State is currently receiving updates or frozen for post-race analysis.  
_Avoid_: Game status, race phase

**Tactical Alert**:
A high-priority visual banner and haptic notification delivered to the driver during critical race events (BOX THIS LAP, Safety Car, unserved actionable penalties).  
_Avoid_: Notification, toast, popup

**Pit Window Rejoin Slot**:
The projected on-track position (`m_pitStopRejoinPosition`) and traffic gap buffer where the player's car will re-enter the circuit after a pit stop, evaluated against live traffic and Safety Car delta conditions.  
_Avoid_: Exit position, pit estimate

**Weather Crossover Point**:
The track moisture and rain intensity threshold at which tyre compound performance crosses over (e.g., Slick to Intermediate, or Intermediate to Full Wet), derived from predictive forecast samples.  
_Avoid_: Rain trigger, tyre switch point

**Quick Prompt Button**:
A tactile, single-tap rig control on the Companion Client HUD triggering a pinned, high-priority query or instruction to the AI Race Engineer (e.g., "Full race update", "Driver ahead", "Check pit strategy").  
_Avoid_: Radio button, chat chip

**Pit Loss Duration**:
The net race-time loss incurred by entering the pit lane, performing the pit stop service, and rejoining at racing speed: $\text{Pit Loss} = (T_{\text{in-lap}} + T_{\text{out-lap}}) - (2 \times T_{\text{avg\_lap}})$.  
_Avoid_: Pit time, box delta
