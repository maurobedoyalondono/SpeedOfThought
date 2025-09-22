# Product Requirements — “Flow Race” (JS logic, multi-lap oval PvP)

## 1. Purpose & Outcomes
- **Audience:** 15–16 y/o beginners learning software fundamentals.
- **Learning goals:** sequencing, conditionals, loops, state, deterministic thinking, debugging.
- **Engagement:** head-to-head races where students’ **JavaScript decision logic** drives outcomes.
- **Constraint:** Students only author a small decision function. No editing visuals or engine.

---

## 2. Scope (v1)
- **Game type:** Two-player race on an **oval track**, **multi-lap** (2–3 laps).
- **Interaction model:** Students write a **single JS bot** (`init` + `decide`). Flows are **locked for entire race**.
- **Deterministic simulation:** tick-based engine runs both bots simultaneously.
- **Visualization:** top-down oval with cars, obstacles, fuel tiles, boost tiles.

---

## 3. Roles & Access
- **Student:** edits their bot file, runs practice races on a known track.
- **Teacher:** starts matches, selects tracks/seeds, views logs/replays, exports results.

---

## 4. Game Objects & State (high level)
- **Track:** fixed-length loop of discrete “segments”; 2 lanes; per-segment features: obstacle | fuel | boost | empty.
- **Racer (per player):** lane, segment index, lap, fuel, speed, flags (onBoost), minimal sensors.
- **Opponent (exposed safely):** lane, segment, signed distance (ahead/behind).
- **Global:** tick count, total laps, track length, lane count, random seed (recorded).

---

## 5. Student Contract (conceptual)
- **init(context) → memory:** optional pre-race setup. Memory ≤ 2KB.
- **decide(state, memory) → action + memory:** called once per tick.
- **Read-only state:** self, opponent (limited), sensors (distances to next obstacle/fuel/boost).
- **Allowed actions (v1):** MOVE, JUMP, SWITCH_LANE, REFUEL, BOOST, WAIT.
- **Constraints:** illegal actions → WAIT, each action has a fuel cost, per-tick CPU limit.

---

## 6. Core Mechanics & Rules
- **Tick order (deterministic):**
  1. Read student actions (timeout ⇒ WAIT).
  2. Validate legality (insufficient fuel, blocked lane switch, etc. ⇒ WAIT).
  3. Apply lane switches.
  4. Resolve jumps vs obstacles.
  5. Move forward (base + boost).
  6. Apply fuel costs & pickups.
  7. Update laps, check finish.
- **Finish & ties:** earliest tick wins → higher fuel → fewer illegal moves → earliest last boost.
- **Collisions (v1):** same lane+segment blocked; behind car stalls.

---

## 7. Difficulty Tiers
- **Tier 1:** MOVE, JUMP, REFUEL, WAIT; 1 lane; obstacles + fuel; 2 laps.
- **Tier 2:** add 2nd lane + SWITCH_LANE; blocking.
- **Tier 3:** add BOOST tiles, fuel economy.
- **Tier 4:** secret seeded tracks; robustness grading.

---

## 8. UX Requirements
- **Student view:**
  - Bot selector, practice button.
  - Per-tick animation (lap, fuel, speed, last action).
  - Logs: concise explanations (“Lap 2: failed jump → stalled”).
- **Teacher view:**
  - Matchmaker, track presets, replay controls, export results.
- **Accessibility:** high contrast, color-blind safe, replay speed control.

---

## 9. Assessment & Feedback
- **Rubric signals:**
  - Completeness (handles all elements).
  - Robustness (few illegal/timeouts).
  - Efficiency (fuel use).
  - Clarity (readability/comments).
- **Artifacts:** tick log, actions, sensor reads, infractions, summary.

---

## 10. Guardrails
- **Sandbox:** no imports, network, DOM.
- **Limits:** CPU ≤ 1ms per tick, memory ≤ 2KB.
- **Immutable state snapshots.**
- **Seeded randomness, replayable.**

---

## 11. Non-Functional
- **Performance:** ≤50ms for full race (~200 ticks).
- **Stability:** deterministic results given same inputs.
- **Portability:** runs offline in browser (no backend v1).
- **Privacy:** no student PII stored.

---

## 12. Content & Assets
- **Visuals:** top-down oval, colored cars, icons (cone=obstacle, battery=fuel, chevrons=boost).
- **Sound (optional):** start beep, lap chime, stall sound; mute toggle.
- **Text:** tooltips for actions/tiles.

---

## 13. Tracks
- **Preset pack:** 3 ovals (easy/medium/hard).
- **Seeded generator:** params (length, obstacle density, fuel frequency, boost frequency).
- **Validation:** no impossible sequences (e.g., obstacle gauntlets).

---

## 14. Tournament Mode (planned)
- **Formats:** round-robin, single-elim.
- **Rotation:** multiple seeds, points per heat, leaderboard.
- **Anti-overfitting:** at least one unseen track per round.

---

## 15. Rollout Plan
1. Lesson 1: MOVE/WAIT only, learn ticks.
2. Lesson 2: add obstacles + JUMP.
3. Lesson 3: add fuel + REFUEL.
4. Lesson 4: add SWITCH_LANE + strategy.
5. Lesson 5: add BOOST, mini-tournament, reflection.
