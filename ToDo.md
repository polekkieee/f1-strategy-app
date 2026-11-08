1. Time penalties still pile up.    [backend]
        "Time penalty: 5" strings are never removed. m_penalties in your own Lap Data entry is already the accumulated penalty seconds, so expose that as penaltySeconds and drop the string approach.

2. Fix playerCarIndex               [backend]
        playerCarIndex is only read from Session packets. Every packet has m_header.m_playerCarIndex, so reading it in one wrapper would remove the initialize flag entirely.

3. Fix forecast                     [backend]
        If the parser returns all 64 forecast slots, the padding entries should be cut. The m_sessionType filter probably catches them, but check one payload.

4. Add Pitting widget               [frontend]
        when pitStatus === "pitting"

5. Add Safety car widget            [frontend]

6. Add Fuel remaining widget        [frontend]

7. Keep raceState obj session end   [backend]
        may want to keep the final state around for post-race analysis rather than wiping it. That’s a design choice for later.

8. Add actual compound to RaceState [backend]
        C1, C2, C3, etc, for better AI calculations. Instead of only visual compound (Soft, Medium, etc)