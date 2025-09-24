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

        // STEP 1: Check for obstacles directly ahead
        if (state.track.ahead[0].obstacles && state.track.ahead[0].obstacles.length > 0) {
            // There's an obstacle in the next segment!
            const obstacle = state.track.ahead[0].obstacles[0];
            console.log("OBSTACLE in lane", obstacle.lane, "- I'm in lane", state.car.lane);

            if (obstacle.lane === state.car.lane) {
                // The obstacle is in our lane!
                console.log("DANGER! Obstacle in my lane - CRASH = 70% speed loss + 5L fuel damage!");

                // Smart lane selection considering fuel zones
                let targetLane = null;
                
                if (state.car.lane === 0) {
                    // We're in left lane, must go right
                    targetLane = 1; // Go to middle lane (has fuel zones)
                } else if (state.car.lane === 2) {
                    // We're in right lane, go left but prefer lane with fuel
                    targetLane = state.car.fuel < 60 ? 1 : 0; // Go to middle if low fuel
                } else {
                    // We're in middle lane - pick best option
                    targetLane = state.car.fuel < 60 ? 2 : 0; // Stay in fuel-accessible lanes if low fuel
                }

                // Execute the lane change
                if (targetLane < state.car.lane) {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                    console.log("Moving left to lane", targetLane);
                } else {
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