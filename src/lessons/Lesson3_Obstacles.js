// LESSON 3: Obstacles and Lane Changes
// Goal: Navigate obstacles by changing lanes or jumping!

class PlayerBot {
    constructor() {
        this.jumpCooldown = 0;
        console.log("Lesson 3: Avoiding obstacles!");
    }

    decide(state, car) {
        // Update jump cooldown
        if (this.jumpCooldown > 0) {
            this.jumpCooldown--;
        }

        // CONCEPT: The track has 3 lanes (0, 1, 2)
        // Lane 0 = Left lane
        // Lane 1 = Middle lane
        // Lane 2 = Right lane
        // IMPORTANT: Fuel zones only exist in lanes 1 and 2!
        console.log("Current lane:", state.car.lane, "- Speed:", state.car.speed);

        // STEP 1: Check for obstacles using NEW helper methods!
        const obstacles = state.getObstaclesAhead();
        const fuelStations = state.getFuelStationsAhead();
        const boostPads = state.getBoostPadsAhead();

        // STEP 2: React to obstacles in our lane
        if (state.hasObstacleAhead()) {
            console.log("⚠️ DANGER! Obstacle in my lane!");

            // Find the nearest obstacle in our lane
            const obstacleInMyLane = obstacles.find(o => o.lane === state.car.lane);
            if (obstacleInMyLane) {
                console.log(`Obstacle at ${obstacleInMyLane.distance}m - need to act!`);

                // Option 1: Jump if close and have fuel
                if (obstacleInMyLane.distance < 30 && state.car.fuel > 15 && this.jumpCooldown === 0) {
                    console.log("🦘 Jumping over obstacle!");
                    car.executeAction(CAR_ACTIONS.JUMP);
                    this.jumpCooldown = 60; // 1 second cooldown
                    return;
                }

                // Option 2: Change lanes if we have time
                if (obstacleInMyLane.distance > 20) {
                    // Find the best lane to move to
                    let bestLane = -1;
                    let bestScore = -999;

                    // Check each lane
                    for (let lane = 0; lane <= 2; lane++) {
                        if (lane === state.car.lane) continue; // Skip current lane

                        // Check if lane is safe using the helper method
                        if (state.isLaneSafe(lane)) {
                            let score = 0;

                            // Prefer lanes with fuel stations if we need fuel
                            if (state.car.fuel < 50) {
                                const hasFuel = fuelStations.some(f => f.lane === lane && f.distance < 100);
                                if (hasFuel) score += 50;
                            }

                            // Prefer lanes with boost pads
                            const hasBoost = boostPads.some(b => b.lane === lane && b.distance < 100);
                            if (hasBoost) score += 30;

                            // Prefer middle lane slightly (more options)
                            if (lane === 1) score += 10;

                            // Count obstacles in this lane
                            const obstaclesInLane = obstacles.filter(o => o.lane === lane && o.distance < 200).length;
                            score -= obstaclesInLane * 20;

                            console.log(`Lane ${lane} score: ${score} (safe: yes, obstacles: ${obstaclesInLane})`);

                            if (score > bestScore) {
                                bestScore = score;
                                bestLane = lane;
                            }
                        } else {
                            console.log(`Lane ${lane} is NOT safe!`);
                        }
                    }

                    // Change to the best lane if found
                    if (bestLane >= 0) {
                        if (bestLane < state.car.lane) {
                            console.log(`Changing to lane ${bestLane} (LEFT)`);
                            car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                        } else {
                            console.log(`Changing to lane ${bestLane} (RIGHT)`);
                            car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                        }
                        return;
                    } else {
                        // No safe lane - must brake or jump!
                        console.log("No safe lane! Emergency braking!");
                        car.executeAction(CAR_ACTIONS.BRAKE);
                        return;
                    }
                }

                // Too close and can't jump - emergency brake!
                if (obstacleInMyLane.distance < 20) {
                    console.log("TOO CLOSE! Emergency brake!");
                    car.executeAction(CAR_ACTIONS.BRAKE);
                    return;
                }
            }
        }

        // STEP 3: Look for opportunities (fuel, boosts)
        // Check if we need fuel and can get to a station
        if (state.car.fuel < 50 && fuelStations.length > 0) {
            const nearestFuel = fuelStations[0];
            if (nearestFuel.lane !== state.car.lane && state.isLaneSafe(nearestFuel.lane)) {
                console.log(`Low fuel - moving to lane ${nearestFuel.lane} for fuel station`);
                if (nearestFuel.lane < state.car.lane) {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                } else {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                }
                return;
            }
        }

        // Check for boost pads we can collect
        if (boostPads.length > 0 && state.car.fuel > 30) {
            const nearestBoost = boostPads[0];
            if (nearestBoost.distance < 50 && nearestBoost.lane !== state.car.lane && state.isLaneSafe(nearestBoost.lane)) {
                console.log(`Boost pad nearby - moving to lane ${nearestBoost.lane}`);
                if (nearestBoost.lane < state.car.lane) {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                } else {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                }
                return;
            }
        }

        // STEP 4: Normal driving based on conditions
        if (state.hasFuelStationAhead() && state.car.fuel < 80) {
            // Slow down in fuel zone to refuel more
            car.executeAction(CAR_ACTIONS.BRAKE);
        } else if (state.car.fuel > 50 && !state.hasObstacleAhead()) {
            car.executeAction(CAR_ACTIONS.ACCELERATE);
        } else if (state.car.fuel > 20) {
            car.executeAction(CAR_ACTIONS.COAST);
        } else {
            car.executeAction(CAR_ACTIONS.COAST); // Emergency fuel saving
        }

        // CHALLENGE 1: Perfect lane selection
        // Can you always pick the optimal lane considering obstacles, fuel, and boosts?

        // CHALLENGE 2: Jump mastery
        // Try to complete a lap using only jumps, no lane changes!

        // CHALLENGE 3: Fuel lane management
        // Remember fuel is only in lanes 1-2. Can you balance safety and fuel access?

        // CHALLENGE 4: Speed maintenance
        // Navigate obstacles while maintaining >200 km/h average speed!
    }
}

/*
LESSON 3: OBSTACLE NAVIGATION

OBSTACLES:
- Red blocks that slow you down if hit
- Cause collision: -50 km/h, -5L fuel, 0.5s stun
- Can be avoided by changing lanes or jumping

LANE SYSTEM:
- 3 lanes: 0 (left), 1 (middle), 2 (right)
- Fuel zones: ONLY in lanes 1 and 2
- Each lane can have different obstacles

NEW HELPER METHODS FOR NAVIGATION:
- state.getObstaclesAhead() - See all obstacles
- state.hasObstacleAhead() - Check your current lane
- state.isLaneSafe(lane) - Check if you can change lanes safely
- state.getFuelStationsAhead() - Plan fuel stops
- state.getBoostPadsAhead() - Find speed boosts

LANE CHANGE ACTIONS:
- CAR_ACTIONS.CHANGE_LANE_LEFT - Move left (0.2s)
- CAR_ACTIONS.CHANGE_LANE_RIGHT - Move right (0.2s)
- Cannot change lanes if another car is there!

JUMPING:
- CAR_ACTIONS.JUMP - Jump over obstacles
- Costs 10L fuel
- 1 second cooldown
- Maintains your speed

COLLISION CONSEQUENCES:
- Speed: -50 km/h instantly
- Fuel: -5L lost
- Stun: 0.5 seconds (30 ticks)
- Position: Lose distance

STRATEGIC DECISIONS:
1. Jump: Fast but costs fuel (10L)
2. Lane change: Free but takes time (0.2s)
3. Brake: Avoid collision but lose speed

LANE SELECTION STRATEGY:
- Middle lane (1): Most flexibility, has fuel
- Side lanes (0,2): Fewer options but sometimes clearer
- Lane 0: No fuel access - avoid when low on fuel!

ADVANCED TIPS:
1. Look ahead and plan lane changes early
2. Combine obstacle avoidance with fuel/boost collection
3. Jump only when lane change isn't possible
4. Use isLaneSafe() before every lane change
5. Remember: No fuel in lane 0!

PROFESSIONAL TECHNIQUE:
- Scan all 3 lanes constantly
- Plan 2-3 moves ahead
- Optimize path for obstacles + resources
- Maintain high speed through smart routing

Remember: The best drivers avoid obstacles while collecting resources!
*/