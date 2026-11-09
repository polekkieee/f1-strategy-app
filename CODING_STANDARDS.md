# Coding Standards

This document establishes the repository-wide engineering standards enforced during code reviews along the **Standards** axis. Reviewers and automated sub-agents must evaluate changes against these rules.

---

## Telemetry Ingestion & State Architecture

### 1. Pure Handlers

**Rule**: Ingestion functions in `backend/telemetryService.js` must be pure functions `(state, packet) => state`, decoupled from UDP socket instances.

- **Scope**: `backend/telemetryService.js` and all telemetry ingestion and packet-handling modules.
- **Requirements**:
  - Packet handler functions (e.g., `processPacket`, `handleSession`, `handleLapData`, `handleCarStatus`, `handleCarDamage`, `handleTyreSets`, `handleEvent`) must accept `(state, packet)` and deterministically return the updated state.
  - Handlers must be completely decoupled from network transport and I/O. They must never reference, construct, or close over UDP socket instances, network clients (`F1TelemetryClient`), or external timers.
  - UDP sockets and network client wrappers must serve solely as transport adapters (e.g., in `start()` / `stop()`), responsible only for receiving raw datagrams and feeding parsed packets into the store dispatch seam.
- **Violations**:
  - Referencing socket instances or client handles inside ingestion or packet parsing logic.
  - Relying on module-level or closure-held mutable telemetry state rather than passing `state` explicitly.
  - Introducing side effects (such as direct network responses, timer loops, or external I/O) within packet handler routines.

```javascript
// Compliant: Pure packet handler
export function processPacket(state, packet) {
  if (!state || !packet?.m_header) return state;
  switch (packet.m_header.m_packetId) {
    case PACKET_IDS.SESSION:
      handleSession(state, packet);
      break;
    // ...
  }
  return state;
}

// Non-Compliant: Handler coupled to socket instance or global client
client.on(PACKETS.session, (data) => {
  globalRaceState.weather = data.m_weather; // Coupled to client and module state
});
```

---

### 2. Black-Box Testing

**Rule**: Telemetry tests must assert state changes through the `processPacket` dispatch seam against synthetic fixtures—no mocking of internal helpers, timers, or sockets.

- **Scope**: `backend/test/` and all telemetry verification suites.
- **Requirements**:
  - Telemetry test suites must exercise logic strictly through the public dispatch seam: `processPacket(state, packetFixture)` (or via `raceStore.mutate(state => processPacket(state, packetFixture))`).
  - Tests must use deterministic synthetic packet fixtures constructed via helper factories (e.g., `backend/test/fixtures/packets.js`) instead of real UDP traffic or live game streams.
  - Tests must assert observable state changes on the resulting `raceState` using Node's built-in `node:test` runner and `node:assert/strict`.
- **Violations**:
  - Mocking, stubbing, or spying on internal ingestion helpers (e.g., `F1_25_HELPERS`, `updateGridOrder`, `resolveTyreCompounds`).
  - Mocking socket handles, timers, or network packet client events using third-party mock libraries or monkey patching.
  - Testing private internal sub-functions in isolation when they should be verified through the `processPacket` seam.

```javascript
// Compliant: Black-box assertion against synthetic fixture
const sessionPacket = createSessionPacket({
  m_header: createPacketHeader({ m_packetId: 1 }),
  m_trackId: 3,
  m_weather: 0,
});
processPacket(raceStore.state, sessionPacket);
assert.equal(raceStore.state.trackName, "Sakhir (Bahrain)");
assert.equal(raceStore.state.weather, "Clear");

// Non-Compliant: Mocking internal helpers or socket events
const helperSpy = sinon.spy(F1_25_HELPERS, "getTrackName");
mockSocket.emit("packet", rawData);
assert.ok(helperSpy.calledOnce);
```

---

### 3. State Store Seam

**Rule**: Direct mutations of `raceState` outside `raceStore.mutate()` are prohibited.

- **Scope**: Entire codebase (`backend/`).
- **Requirements**:
  - `RaceStateStore` (`backend/raceStateStore.js`) is the single source of truth for runtime race state.
  - All state updates during runtime execution must be dispatched through `raceStore.mutate(updaterFn)`.
  - The store's internal state must remain protected behind the store seam, ensuring subscribers and listeners are reliably notified of all mutations.
- **Violations**:
  - Directly mutating properties on `raceStore.state` outside of a `raceStore.mutate()` callback.
  - Bypassing the store to maintain competing global or module-level race state caches.

```javascript
// Compliant: State mutation executed through the store seam
raceStore.mutate((state) => {
  processPacket(state, packet);
});

// Non-Compliant: Direct mutation outside raceStore.mutate()
raceStore.state.sessionStatus = "completed"; // Bypasses notification listeners
```

---

## Mobile Companion HUD & Glanceable UI

### 4. Glanceable HUD Density & Redundancy

**Rule**: Secondary telemetry labels and detail text must not duplicate categorical state already communicated by an adjacent visual badge, icon, or accent color.

- **Scope**: `mobile/components/`, `mobile/utils/format.ts`, and all companion presentation logic.
- **Requirements**:
  - The HUD operates in a fixed 3-column landscape canvas mounted to a sim rig (ADR-0004). Horizontal cell space is tight.
  - When a widget features a prominent visual badge or chromatic accent (e.g., tyre compound badge, safety car yellow framing, pit status banner), secondary labels must omit redundant compound or state names (e.g., display `(C3) · 12 LAPS`, not `SOFT (C3) · 12 LAPS`).
  - Reserve label space for dynamic telemetry figures, lap counts, and tabular numerals (`fontVariant: ["tabular-nums"]`).
- **Violations**:
  - Duplicating compound name strings alongside visual compound badges in compact cards.
  - Introducing verbose multi-word status descriptions that cause text wrapping or layout jitter at speed.

```typescript
// Compliant: Concise token alongside visual compound badge
formatTyreAgeDisplay(12, "Soft", "C3", true); // "(C3) · 12 LAPS"

// Non-Compliant: Redundant compound string causing text wrap in 3-column layout
formatTyreAgeDisplay(12, "Soft", "C3", true); // "SOFT (C3) · 12 LAPS"
```

---

### 5. Landscape Modal Safety

**Rule**: Modal sheets in `mobile/` must use `LandscapeModal` (or explicitly define `LANDSCAPE_MODAL_ORIENTATIONS`) to guarantee landscape-compatible presentation on iOS.

- **Scope**: `mobile/components/` and all slide-over/dialog sheets.
- **Requirements**:
  - Because the companion app is locked to landscape orientation, presenting React Native's `<Modal>` with default properties causes a native iOS crash (`supported orientations has no common orientation with the application`).
  - Slide-over sheets and modal dialogs must render `<LandscapeModal>` from `mobile/components/LandscapeModal` or explicitly pass `supportedOrientations={LANDSCAPE_MODAL_ORIENTATIONS}`.
- **Violations**:
  - Using bare `<Modal>` from `react-native` without explicit landscape `supportedOrientations`.

```tsx
// Compliant: Enforces landscape orientation mask
<LandscapeModal visible={isOpen} onRequestClose={onClose}>
  {content}
</LandscapeModal>

// Non-Compliant: Default Modal causes iOS native crash when landscape-locked
<Modal visible={isOpen} onRequestClose={onClose}>
  {content}
</Modal>
```

---

### 6. Component Presentation & Test Seam Separation

**Rule**: Complex HUD components and sheets must separate the presentational view (`*View`) from the store-connected container.

- **Scope**: `mobile/components/`.
- **Requirements**:
  - Split components into a pure presentational view function (e.g., `SettingsSheetView`, `PostRaceSummaryView`, `HeaderBarView`, `ActionablePenaltyBannerView`) accepting plain props, and a thin container component connected to Zustand stores.
  - Test visual hierarchy, formatting, and responsive styling against the presentational view using pure JSX node inspection under Node's test runner (`mobile/test/register.mjs`).
- **Violations**:
  - Inlining store selectors and mutable hooks directly into monolithic view components without exporting a testable view seam.
