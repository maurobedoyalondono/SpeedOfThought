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
            console.log("Opponent speed:", state.opponent.speed, "km/h | My speed:", state.car.speed, "km/h");
            console.log("Opponent in lane:", state.opponent.lane, "| My lane:", state.car.lane);
            if (state.car.isDrafting) {
                console.log("🏎️ DRAFTING! Effectiveness:", (state.car.draftEffectiveness * 100).toFixed(0) + "% fuel savings");
            }
        }

        // STRATEGY 1: Smart Drafting
        // Drafting range: 5-25m behind opponent saves up to 30% fuel
        // But be careful not to get TOO close (collision risk)
        if (opponentAhead && distanceGap >= 8 && distanceGap <= 25) {
            // Try to get in their lane for maximum drafting benefit
            if (state.opponent.lane !== state.car.lane) {
                if (state.opponent.lane < state.car.lane) {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                } else {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                }
                console.log("Moving to opponent's lane for drafting effectiveness:", (state.car.draftEffectiveness * 100).toFixed(0) + "%");
                return; // Lane change takes priority
            } else {
                // Already in same lane - maintain drafting distance
                if (distanceGap < 10) {
                    car.executeAction(CAR_ACTIONS.COAST); // Don't get too close
                    console.log("Coasting to maintain safe drafting distance");
                } else {
                    car.executeAction(CAR_ACTIONS.ACCELERATE); // Catch up slightly
                }
                return;
            }
        }

        // DANGER ZONE: Too close to opponent (< 8m)
        if (opponentAhead && distanceGap < 8) {
            console.log("⚠️ TOO CLOSE! Risk of collision - finding overtake opportunity");
            // Look for a clear lane to overtake
            const availableLanes = [0, 1, 2].filter(lane => 
                lane !== state.car.lane && lane !== state.opponent.lane
            );
            
            if (availableLanes.length > 0) {
                const overtakeLane = availableLanes[0];
                if (overtakeLane < state.car.lane) {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                } else {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                }
                console.log("Attempting overtake via lane", overtakeLane);
                return;
            } else {
                // No clear lane - back off slightly
                car.executeAction(CAR_ACTIONS.COAST);
                console.log("No clear overtake lane - maintaining distance");
                return;
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

        // Always handle obstacles first - safety priority!
        if (state.hasObstacleAhead()) {
            this.avoidObstacles(state, car);
            return; // Skip other actions when avoiding obstacles
        }

        // Display current race mode
        if (state.car.position % 100 < 1) {
            console.log("Race mode:", this.raceMode);
        }
    }

    avoidObstacles(state, car) {
        // Use new helper method to check for obstacles in our lane
        if (state.hasObstacleAhead()) {
            // Find a safe lane to move to
            if (state.car.lane > 0 && state.isLaneSafe(state.car.lane - 1)) {
                car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                console.log("Avoiding obstacle by moving left to lane", state.car.lane - 1);
            } else if (state.car.lane < 2 && state.isLaneSafe(state.car.lane + 1)) {
                car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                console.log("Avoiding obstacle by moving right to lane", state.car.lane + 1);
            } else {
                // No safe lane available, try jumping if we have fuel
                if (state.car.fuel > 10) {
                    car.executeAction(CAR_ACTIONS.JUMP);
                    console.log("No safe lane - jumping over obstacle!");
                } else {
                    car.executeAction(CAR_ACTIONS.BRAKE);
                    console.log("No safe options - emergency braking!");
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

NEW HELPER METHODS FOR SAFETY:
- state.hasObstacleAhead(): Check if obstacle in your lane
- state.isLaneSafe(lane): Check if lane change is safe
- state.getObstaclesAhead(): Get all obstacles ahead
- Use these methods to avoid crashes while racing!

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
   - Use state.isLaneSafe() to check before changing lanes
   - Always prioritize obstacle avoidance over racing position

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
- Drafting zone: 5-25 meters behind opponent saves up to 30% fuel
- Collision zone: <5 meters (avoid!)
- Boost acceleration: 20 km/h per tick (uses boost charge + high fuel)
- Sprint: 10 km/h per tick (~2.7L/sec, speed affects consumption)
- Accelerate: 5 km/h per tick (~1.5L/sec, moderate fuel use)

PSYCHOLOGICAL WARFARE:
- Pressure opponents into mistakes
- Save boost to counter their boost
- Fake movements to confuse them
*/