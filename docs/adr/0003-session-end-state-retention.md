# 3. Session End State Retention

Previously, the backend immediately wiped the entire `RaceStateStore` whenever a `"SEND"` (Session Ended) event was received.

We decided to keep the final race state preserved upon `"SEND"` (marking `sessionStatus = "completed"`) and only reset the store when a new session start (`"SSTA"`) event is received.

This allows the driver to review finishing classifications, penalties, and tyre wear on the companion client after crossing the finish line, rather than having the screen clear instantly.
