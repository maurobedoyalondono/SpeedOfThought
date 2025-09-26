// LESSON 2.5: Boost Mechanics and Special Actions
// Goal: Master boost usage, jumping, and special track elements!

class PlayerBot {
    constructor() {
        this.boostCooldown = 0;
        this.jumpCooldown = 0;
        this.boostUsageLog = [];
        console.log("Lesson 2.5: Learning boost mechanics and special actions!");
    }

    decide(state, car) {
        // Update cooldowns
        if (this.boostCooldown > 0) this.boostCooldown--;
        if (this.jumpCooldown > 0) this.jumpCooldown--;

        // CONCEPT 1: Understanding your resources
        console.log("🔋 Resources - Fuel:", state.car.fuel.toFixed(1), "| Boosts:", state.car.boosts, "| Speed:", state.car.speed);

        // CONCEPT 2: Boost Pads (Yellow zones) - Using new helper methods!
        const boostPads = state.getBoostPadsAhead();
        if (boostPads.length > 0) {
            console.log("🚀 Found", boostPads.length, "boost pads ahead!");
            const nearestBoost = boostPads[0];
            console.log("Nearest boost pad in lane", nearestBoost.lane, "at", nearestBoost.distance, "m");

            // Check if there's a boost pad in our lane
            if (state.hasBoostPadAhead()) {
                console.log("Boost pad in MY lane! Will get +20 km/h for FREE!");
            } else if (nearestBoost.distance < 50) {
                // Consider changing lanes to get the boost
                if (state.isLaneSafe(nearestBoost.lane)) {
                    console.log("Changing to lane", nearestBoost.lane, "to get boost pad!");
                    if (nearestBoost.lane < state.car.lane) {
                        car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                    } else {
                        car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                    }
                    return;
                }
            }
        }

        // CONCEPT 3: Boost Charges (Manual boosts)
        // Use boost strategically!
        if (state.car.boosts > 0 && this.boostCooldown === 0) {
            // When should you boost?
            let shouldBoost = false;

            // Scenario 1: Clear track ahead - good for boosting
            if (!state.hasObstacleAhead() && state.car.speed < 250) {
                shouldBoost = true;
                console.log("Clear track - good time to boost!");
            }

            // Scenario 2: After getting a boost pad for combo effect
            if (state.car.speed > 200 && state.car.speed < 280) {
                shouldBoost = true;
                console.log("Good speed for boost combo!");
            }

            // Scenario 3: Final lap sprint
            if (state.car.lap === state.track.totalLaps && state.car.fuel > 30) {
                shouldBoost = true;
                console.log("Final lap - using boost!");
            }

            if (shouldBoost) {
                car.executeAction(CAR_ACTIONS.USE_BOOST);
                this.boostCooldown = 30; // Prevent spam
                this.boostUsageLog.push({
                    lap: state.car.lap,
                    position: state.car.position,
                    speed: state.car.speed
                });
                console.log("💨 BOOST ACTIVATED! Speed will increase by 30 km/h!");
                return;
            }
        }

        // CONCEPT 4: Jumping mechanics
        const obstacles = state.getObstaclesAhead();
        if (state.hasObstacleAhead() && this.jumpCooldown === 0) {
            const obstacleInLane = obstacles.find(o => o.lane === state.car.lane);
            if (obstacleInLane && obstacleInLane.distance < 30) {
                console.log("🦘 JUMPING over obstacle!");
                car.executeAction(CAR_ACTIONS.JUMP);
                this.jumpCooldown = 60; // 1 second cooldown
                return;
            }
        }

        // CONCEPT 5: Drafting (following other cars closely)
        if (state.car.isDrafting) {
            console.log("📉 DRAFTING! Using 30% less fuel while maintaining speed!");
        }

        // CONCEPT 6: Strategic decision making with all elements
        // Check track conditions and make smart decisions
        const fuelStations = state.getFuelStationsAhead();
        const hasLowFuel = state.car.fuel < 40;
        const needsFuel = hasLowFuel && fuelStations.length > 0;

        if (needsFuel) {
            // Navigate to fuel station
            const targetFuel = fuelStations[0];
            if (targetFuel.lane !== state.car.lane && state.isLaneSafe(targetFuel.lane)) {
                console.log("Moving to lane", targetFuel.lane, "for fuel");
                car.executeAction(targetFuel.lane < state.car.lane ?
                    CAR_ACTIONS.CHANGE_LANE_LEFT : CAR_ACTIONS.CHANGE_LANE_RIGHT);
                return;
            }
        }

        // Default driving behavior based on fuel
        if (state.car.fuel > 60 && !state.hasObstacleAhead()) {
            car.executeAction(CAR_ACTIONS.SPRINT);
        } else if (state.car.fuel > 30) {
            car.executeAction(CAR_ACTIONS.ACCELERATE);
        } else {
            car.executeAction(CAR_ACTIONS.COAST);
        }

        // CHALLENGE 1: Boost pad collection efficiency
        // Try to collect at least 3 boost pads per lap!

        // CHALLENGE 2: Combo boosting
        // Use manual boost right after collecting a boost pad for maximum speed!

        // CHALLENGE 3: Jump timing
        // Can you jump over obstacles while maintaining maximum speed?

        // CHALLENGE 4: Fuel-boost balance
        // Complete the race using all your boosts but still having fuel left!
    }
}

/*
LESSON 2.5: SPECIAL MECHANICS

BOOST PADS (Yellow Zones):
- Give +20 km/h instantly for FREE
- No fuel cost
- Stack with manual boosts
- Located in specific lanes
- Use getBoostPadsAhead() to find them!

MANUAL BOOSTS:
- Use CAR_ACTIONS.USE_BOOST
- Gives +30 km/h instantly
- Costs 5L fuel
- You start with 3 charges
- Best used on straight sections

JUMPING:
- Use CAR_ACTIONS.JUMP
- Costs 10L fuel
- Avoid obstacles without changing lanes
- 1 second cooldown
- Maintains your speed

DRAFTING:
- Follow another car closely
- Reduces fuel consumption by 30%
- Automatic when behind another car
- Check with state.car.isDrafting

NEW HELPER METHODS FOR SPECIAL ACTIONS:
- state.getBoostPadsAhead() - Find all boost pads
- state.hasBoostPadAhead() - Check if boost pad in your lane
- state.getObstaclesAhead() - Find all obstacles
- state.hasObstacleAhead() - Check if obstacle in your lane
- state.isLaneSafe(lane) - Check if you can change lanes safely

STRATEGIC TIPS:
1. Boost pads are FREE - always try to get them!
2. Save manual boosts for the final lap
3. Jump only when necessary (it costs fuel)
4. Combine boost pad + manual boost for super speed
5. Draft behind opponents to save fuel

ADVANCED STRATEGY:
- Boost pad at 200 km/h → 220 km/h
- Then manual boost → 250 km/h
- Maximum efficiency!

PHYSICS NOTES:
- Max speed: 300 km/h
- Boost effects are instant
- Speed decays naturally over time
- Higher speeds = more fuel consumption
*/