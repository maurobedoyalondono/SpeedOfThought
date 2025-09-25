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
        console.log("Current lane:", state.car.lane, "- Remember: fuel zones are in lanes 1-2 only");

        // STEP 1: Check for obstacles using NEW helper methods!
        
        // Get ALL obstacles on the track ahead
        const obstacles = state.getObstaclesAhead();
        console.log("I can see", obstacles.length, "obstacles ahead:", obstacles);
        
        // Check if there's an obstacle in my current lane
        if (state.hasObstacleAhead()) {
            console.log("DANGER! Obstacle in my lane - need to dodge!");
            
            // Find obstacles in my lane
            const myObstacles = obstacles.filter(obs => obs.lane === state.car.lane && obs.distance < 30);
            
            if (myObstacles.length > 0) {
                const nearestObstacle = myObstacles[0];
                console.log(`Nearest obstacle in lane ${nearestObstacle.lane} at ${nearestObstacle.distance}m`);

                // Option 1: Jump over it (if we have fuel)
                if (state.car.fuel > 15 && this.jumpCooldown === 0) {
                    console.log("Jumping over obstacle!");
                    car.executeAction(CAR_ACTIONS.JUMP);
                    this.jumpCooldown = 20; // Wait before next jump
                    return;
                }
                
                // Option 2: Change lanes strategically
                let bestLane = -1;
                let bestScore = -1;
                
                for (let lane = 0; lane <= 2; lane++) {
                    if (lane === state.car.lane) continue;
                    if (!state.isLaneSafe(lane)) continue;
                    
                    // Score lanes based on obstacles and fuel stations
                    const laneObstacles = obstacles.filter(obs => obs.lane === lane && obs.distance < 50);
                    const fuelStations = state.getFuelStationsAhead();
                    const laneFuel = fuelStations.filter(f => f.lane === lane && f.distance < 100);
                    
                    let score = 100 - (laneObstacles.length * 20);
                    if (state.car.fuel < 60) {
                        score += (laneFuel.length * 15); // Bonus for fuel access when low
                    }
                    
                    console.log(`Lane ${lane} score: ${score} (obstacles: ${laneObstacles.length}, fuel: ${laneFuel.length})`);
                    
                    if (score > bestScore) {
                        bestScore = score;
                        bestLane = lane;
                    }
                }
                
                if (bestLane !== -1) {
                    console.log(`Strategic dodge to lane ${bestLane}!`);
                    if (bestLane < state.car.lane) {
                        car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                    } else {
                        car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                    }
                    return;
                } else {
                    console.log("No safe lanes - emergency brake!");
                    car.executeAction(CAR_ACTIONS.BRAKE);
                    return;
                }
            }
        }
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                    console.log("Moving right to lane", targetLane);
                }

                return; // Don't do anything else this tick

                // OPTION 2: Jump over it!
                // Jumping costs 5L fuel but works from any lane
                // if (this.jumpCooldown === 0 && state.car.fuel > 20) {
                //     car.executeAction(CAR_ACTIONS.JUMP);
                //     this.jumpCooldown = 15; // Can't jump again for 15 ticks
                //     console.log("JUMPING over obstacle! Costs 5L fuel");
                //     return; // Don't do anything else this tick
                // }
            }
        }

        // STEP 2: Look ahead for better positioning
        // Check the next few segments for obstacles
        for (let i = 1; i < Math.min(3, state.track.ahead.length); i++) {
            if (state.track.ahead[i].obstacles && state.track.ahead[i].obstacles.length > 0) {
                const futureObstacle = state.track.ahead[i].obstacles[0];

                // If there's an obstacle coming up in our lane
                if (futureObstacle.lane === state.car.lane) {
                    console.log("Obstacle coming in", i * 10, "meters");

                    // Start moving away early
                    if (i === 1) { // Close enough to start moving
                        if (state.car.lane === 1) {
                            // Middle lane - check which side is clearer
                            car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                        } else if (state.car.lane === 0) {
                            car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                        } else {
                            car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                        }
                    }
                    break;
                }
            }
        }

        // STEP 3: Normal racing (with fuel management from Lesson 2)
        if (state.car.fuel > 60) {
            car.executeAction(CAR_ACTIONS.ACCELERATE);
        } else if (state.car.fuel > 30) {
            car.executeAction(CAR_ACTIONS.COAST);
        } else {
            car.executeAction(CAR_ACTIONS.COAST);
        }

        // CHALLENGE: Try to stay in the middle lane when possible
        // The middle lane gives you more options!
        // if (no obstacles nearby && state.car.lane !== 1) {
        //     if (state.car.lane === 0) {
        //         car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
        //     } else {
        //         car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
        //     }
        // }
    }
}

/*
LESSON 3 CONCEPTS:

LANES:
- Track has 3 lanes: 0 (left), 1 (middle), 2 (right)
- You can change lanes to avoid obstacles
- Lane changes take about 5 ticks to complete

OBSTACLES:
- Orange cones that cause 70% speed reduction + 5L fuel damage + 0.5 second stun
- Each obstacle is in a specific lane (0, 1, or 2)
- You get a 5-tick cooldown between collisions

AVOIDANCE STRATEGIES:
1. Change lanes (smooth, takes 5 ticks to complete)
2. Jump over (costs 5L fuel, works from any lane, lasts 10 ticks)

NEW ACTIONS:
- CAR_ACTIONS.CHANGE_LANE_LEFT - Move one lane left (takes 5 ticks)
- CAR_ACTIONS.CHANGE_LANE_RIGHT - Move one lane right (takes 5 ticks)  
- CAR_ACTIONS.JUMP - Jump over obstacles (costs 5L fuel, lasts 10 ticks)

STRATEGIC CONSIDERATIONS:
- Lane changes are free but take time
- Jumping costs fuel but is instant
- Consider fuel zone access when choosing lanes (lanes 1-2 only)
- Middle lane gives you escape options in both directions

ADVANCED CHALLENGE:
Complete a lap without jumping (only lane changes)

DEBUGGING HELP:
- state.car.lane tells you current lane (0, 1, or 2)
- state.car.isJumping tells if you're in the air
- state.track.ahead[i].obstacles lists obstacles ahead
- Each obstacle has a .lane property

STRATEGIC THINKING:
- Is it better to jump (costs fuel) or change lanes (costs time)?
- Should you stay in one lane or move around?
- How far ahead should you look?
*/