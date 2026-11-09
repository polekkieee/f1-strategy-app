# 2. Decoupled Pure Packet Handlers and Native Node Test Runner

Previously, UDP network listening, state mutation, and packet interpretation were tightly coupled in `telemetryService.js` with module-level state, and no automated tests existed.

We decided to decouple packet transformation into pure, deterministic handler functions and use Node.js's built-in `node:test` runner with synthetic packet fixtures.

This enables offline, millisecond test-driven development (TDD) for telemetry logic and edge cases without needing a running F1 game or extra testing dependencies.
