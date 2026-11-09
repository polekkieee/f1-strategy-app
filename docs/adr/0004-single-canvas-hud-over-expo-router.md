# 4. Single-Canvas HUD with Modal Sheets over Multi-Page Expo Router

The Expo mobile app (`mobile/`) serves as a live, glanceable companion mounted to a sim racing rig during active driving. Standard Expo conventions recommend multi-page file-based routing (`expo-router`).

We decided to structure the companion as a single persistent landscape HUD canvas with slide-over modal sheets for Settings and Post-Race summaries, bypassing multi-page navigation.

This prevents unmounting the active WebSocket stream, eliminates race-condition reconnects between screens, and avoids accidental route transitions or gestures while driving at speed on the rig.
