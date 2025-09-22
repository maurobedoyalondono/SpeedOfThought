// LESSON 4: Racing Against an Opponent
// Goal: Beat your opponent using strategy and tactics!

class PlayerBot {
    constructor() {
        this.raceMode = "normal";
        this.lastOpponentDistance = 0;
        console.log("Lesson 4: Time to race competitively!");
    }

    decide(state, car) {
        // CONCEPT: You're not alone on the track!
        // state.opponent gives you information about the other racer

        // Where is the opponent?
        // Positive distance = opponent is ahead
        // Negative distance = opponent is behind
        const opponentAhead = state.opponent.distance > 0;
        const distanceGap = Math.abs(state.opponent.distance);

        // Are they catching up or falling behind?
        const opponentGaining = state.opponent.distance < this.lastOpponentDistance;
        this.lastOpponentDistance = state.opponent.distance;

        // Log race situation every second
        if (state.car.position % 50 < 1) {
            console.log("=== RACE STATUS ===");
            console.log("Opponent is", opponentAhead ? "AHEAD by" : "BEHIND by", distanceGap.toFixed(1), "meters");
            console.log("Opponent speed:", state.opponent.speed, "km/h");
            console.log("My speed:", state.car.speed, "km/h");
            console.log("Opponent in lane:", state.opponent.lane);
            if (state.car.isDrafting) {
                console.log("DRAFTING! (saving fuel)");
            }
        }

        // STRATEGY 1: Drafting
        // If opponent is ahead and close, get behind them to save fuel!
        if (opponentAhead && distanceGap < 30 && distanceGap > 5) {
            // Try to get in their lane for drafting
            if (state.opponent.lane !== state.car.lane) {
                if (state.opponent.lane < state.car.lane) {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                } else {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                }
                console.log("Moving to opponent's lane for drafting");
            }
        }

        // STRATEGY 2: Boost usage
        // Use boosts strategically!
        if (state.car.boosts > 0) {
            // Scenario A: Opponent is catching up fast
            if (!opponentAhead && distanceGap < 20 && opponentGaining) {
                car.executeAction(CAR_ACTIONS.BOOST);
                console.log("DEFENSIVE BOOST! They're catching up!");
            }
            // Scenario B: Close to overtaking
            else if (opponentAhead && distanceGap < 30) {
                car.executeAction(CAR_ACTIONS.BOOST);
                console.log("ATTACK BOOST! Going for the pass!");
            }
            // Scenario C: Last lap sprint
            else if (state.car.lap === state.track.totalLaps) {
                car.executeAction(CAR_ACTIONS.BOOST);
                console.log("FINAL LAP BOOST!");
            }
        }

        // STRATEGY 3: Blocking
        // If we're ahead and they're close, block them!
        if (!opponentAhead && distanceGap < 15) {
            // Move to their lane to block
            if (state.opponent.lane !== state.car.lane) {
                if (state.opponent.lane < state.car.lane) {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                    console.log("Blocking left!");
                } else {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                    console.log("Blocking right!");
                }
            }
        }

        // STRATEGY 4: Speed management based on race position
        if (!opponentAhead && distanceGap > 50) {
            // We're comfortably ahead - conserve fuel
            this.raceMode = "cruising";
            if (state.car.fuel > 40) {
                car.executeAction(CAR_ACTIONS.ACCELERATE);
            } else {
                car.executeAction(CAR_ACTIONS.COAST);
            }
        } else if (opponentAhead && distanceGap > 50) {
            // We're far behind - need to push!
            this.raceMode = "catching_up";
            if (state.car.fuel > 20) {
                car.executeAction(CAR_ACTIONS.SPRINT);
            } else {
                car.executeAction(CAR_ACTIONS.ACCELERATE);
            }
        } else {
            // Close racing - full competition mode!
            this.raceMode = "battle";
            if (state.car.fuel > 30) {
                car.executeAction(CAR_ACTIONS.SPRINT);
            } else if (state.car.fuel > 15) {
                car.executeAction(CAR_ACTIONS.ACCELERATE);
            } else {
                car.executeAction(CAR_ACTIONS.COAST);
            }
        }

        // Don't forget obstacles! (from Lesson 3)
        this.avoidObstacles(state, car);

        // Display current race mode
        if (state.car.position % 100 < 1) {
            console.log("Race mode:", this.raceMode);
        }
    }

    avoidObstacles(state, car) {
        if (state.track.ahead[0].obstacles && state.track.ahead[0].obstacles.length > 0) {
            const obstacle = state.track.ahead[0].obstacles[0];
            if (obstacle.lane === state.car.lane) {
                // Quick avoidance
                if (state.car.lane > 0) {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                } else {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                }
            }
        }
    }
}

/*
LESSON 4: RACING CONCEPTS

OPPONENT INFORMATION:
- state.opponent.distance: How far ahead/behind they are
  * Positive = they're ahead
  * Negative = they're behind
- state.opponent.speed: Their current speed
- state.opponent.lane: Which lane they're in
- state.opponent.lap: What lap they're on

RACING TACTICS:

1. DRAFTING (Slipstreaming):
   - Get behind opponent (5-25m) to reduce air resistance
   - state.car.isDrafting tells you if you're drafting
   - Saves ~30% fuel while maintaining speed!

2. BOOST USAGE:
   - You have 3 boosts per race
   - Each boost gives maximum acceleration
   - Use strategically:
     * Defense: When opponent is catching up
     * Attack: When close to overtaking
     * Sprint: Final lap finish

3. BLOCKING:
   - Stay in front of opponent's lane
   - Makes it harder for them to pass
   - Don't forget about obstacles!

4. RACING LINES:
   - Inside lane might be shorter
   - Outside lane might have fewer obstacles
   - Middle lane gives most options

NEW ACTIONS:
- CAR_ACTIONS.BOOST: Maximum power sprint (uses boost + fuel)
- CAR_ACTIONS.SPRINT: Faster than accelerate, uses more fuel

STRATEGY TIPS:
1. Save boosts for critical moments
2. Use opponent's slipstream when behind
3. Block when ahead
4. Balance aggression with fuel management
5. Watch opponent's patterns

ADVANCED CHALLENGES:
1. Win without using any boosts
2. Win by drafting for >50% of race
3. Complete overtake on final lap
4. Win with >20 fuel remaining

MATH & PHYSICS:
- Drafting zone: 5-25 meters behind opponent
- Collision zone: <5 meters (avoid!)
- Boost acceleration: 20 km/h per tick
- Sprint: 10 km/h per tick, 2.5 fuel
- Accelerate: 5 km/h per tick, 1.0 fuel

PSYCHOLOGICAL WARFARE:
- Pressure opponents into mistakes
- Save boost to counter their boost
- Fake movements to confuse them
*/