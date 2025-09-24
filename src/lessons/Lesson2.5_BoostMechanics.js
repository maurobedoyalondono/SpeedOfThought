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

        // CONCEPT 2: Boost Pads (Yellow zones)
        // Look for boost pads on the track
        for (let i = 0; i < state.track.ahead.length; i++) {
            if (state.track.ahead[i].type === 'boost_zone') {
                console.log("🚀 BOOST PAD ahead at segment", i, "- gives FREE +20 km/h!");
                
                // Are we in the right position to get it?
                if (i <= 1) { // Close enough to worry about
                    const boostItems = state.track.ahead[i].items || [];
                    for (let item of boostItems) {
                        if (item.lane !== state.car.lane) {
                            console.log("Boost pad in lane", item.lane, "- changing lanes!");
                            if (item.lane < state.car.lane) {
                                car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                            } else {
                                car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                            }
                            return; // Lane change takes priority
                        }
                    }
                }
                break;
            }
        }

        // CONCEPT 3: Boost Charges (Manual boosts)
        // Use boost strategically!
        if (state.car.boosts > 0 && this.boostCooldown === 0) {
            // When should you boost?
            let shouldBoost = false;

            // Scenario A: Low speed and need acceleration
            if (state.car.speed < 100) {
                shouldBoost = true;
                console.log("🚀 BOOST: Low speed acceleration");
            }
            // Scenario B: Final lap sprint
            else if (state.car.lap === state.track.totalLaps && state.car.fuel > 20) {
                shouldBoost = true;
                console.log("🚀 BOOST: Final lap sprint!");
            }
            // Scenario C: Have excess boosts
            else if (state.car.boosts > 2) {
                shouldBoost = true;
                console.log("🚀 BOOST: Using excess boost charges");
            }

            if (shouldBoost && state.car.fuel > 15) { // Need fuel for boost
                car.executeAction(CAR_ACTIONS.BOOST);
                this.boostCooldown = 10; // Wait before next boost
                this.boostUsageLog.push({
                    lap: state.car.lap,
                    speed: state.car.speed,
                    fuel: state.car.fuel
                });
                return; // Don't do other actions
            }
        }

        // CONCEPT 4: Jumping over obstacles
        // Check for obstacles we might want to jump over
        if (state.track.ahead[0].obstacles && state.track.ahead[0].obstacles.length > 0) {
            const obstacle = state.track.ahead[0].obstacles[0];
            
            if (obstacle.lane === state.car.lane && this.jumpCooldown === 0) {
                // Should we jump or change lanes?
                if (state.car.fuel > 20) { // Have enough fuel to jump (costs 5L)
                    console.log("⬆️ JUMPING over obstacle! Costs 5L fuel but saves time");
                    car.executeAction(CAR_ACTIONS.JUMP);
                    this.jumpCooldown = 15; // Can't jump again immediately
                    return;
                } else {
                    console.log("⚠️ Low fuel - changing lanes instead of jumping");
                    // Change lanes (free but takes time)
                    if (state.car.lane === 1) {
                        car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT); // Go to lane 0
                    } else {
                        car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT); // Go to safer lane
                    }
                    return;
                }
            }
        }

        // CONCEPT 5: Speed management based on situation
        // Choose action based on current state
        if (state.car.fuel > 70) {
            // Plenty of fuel - go fast!
            car.executeAction(CAR_ACTIONS.SPRINT);
        } else if (state.car.fuel > 40) {
            // Normal racing
            car.executeAction(CAR_ACTIONS.ACCELERATE);
        } else if (state.car.fuel > 20) {
            // Conserve fuel
            car.executeAction(CAR_ACTIONS.COAST);
        } else {
            // Critical fuel - maximum conservation
            car.executeAction(CAR_ACTIONS.COAST);
        }

        // CHALLENGE 1: Track boost usage
        // if (this.boostUsageLog.length > 0 && state.car.lap > 1) {
        //     console.log("Boost usage history:", this.boostUsageLog.length, "boosts used");
        // }

        // CHALLENGE 2: Jump vs lane change decision
        // if (obstacle && obstacle.lane === state.car.lane) {
        //     const fuelCost = 5; // Jump costs 5L
        //     const timeCost = 5 * (1000/60); // Lane change takes ~5 ticks
        //     console.log("Decision: Jump (", fuelCost, "L fuel) vs Lane Change (", timeCost.toFixed(0), "ms)");
        // }

        // CHALLENGE 3: Boost pad planning
        // Look ahead for multiple boost pads and plan route
        // let boostPadsAhead = 0;
        // for (let i = 0; i < state.track.ahead.length; i++) {
        //     if (state.track.ahead[i].type === 'boost_zone') {
        //         boostPadsAhead++;
        //     }
        // }
        // console.log("Boost pads visible ahead:", boostPadsAhead);
    }
}

/*
LESSON 2.5 CONCEPTS:

BOOST MECHANICS:

1. BOOST CHARGES:
   - Limited resource (usually 2-3 per race)
   - CAR_ACTIONS.BOOST gives +20 km/h acceleration per tick
   - Uses fuel in addition to boost charge
   - Max speed increased to 300 km/h during boost

2. BOOST PADS (Yellow zones):
   - Free speed bonus (+20 km/h instant)
   - Must drive through them (change lanes if needed)
   - Don't cost fuel or boost charges
   - Great for maintaining high speed

JUMPING MECHANICS:

1. JUMP ACTION:
   - CAR_ACTIONS.JUMP lasts 10 ticks
   - Costs 5L fuel
   - Can jump over any obstacle
   - Works from any lane
   - Can't change lanes while jumping

2. JUMP STRATEGY:
   - Jump when fuel is plentiful
   - Change lanes when fuel is low
   - Jump saves time but costs fuel
   - Lane changes are free but take time

RESOURCE MANAGEMENT:

1. FUEL PRIORITIES:
   - 1. Survival (basic movement)
   - 2. Obstacle avoidance
   - 3. Boost usage
   - 4. Jump actions

2. BOOST PRIORITIES:
   - 1. Emergency acceleration
   - 2. Final lap sprint
   - 3. Overtaking opportunities
   - 4. Using excess boosts

TRACK READING:

1. YELLOW ZONES = Boost pads (free speed)
2. GREEN ZONES = Fuel zones (refuel)
3. ORANGE CONES = Obstacles (avoid/jump)
4. Plan route to collect boosts efficiently

STRATEGIC DECISIONS:

Q: Should I jump or change lanes?
A: Jump if fuel > 20L, change lanes if fuel < 20L

Q: When should I use boost charges?
A: Final lap, low speed situations, or when you have extras

Q: Are boost pads worth changing lanes for?
A: Yes! Free +20 km/h is always worth a lane change

ADVANCED TIPS:

1. Boost pads stack with boost charges
2. Jumping gives invincibility during obstacles
3. Plan boost pad routes in advance
4. Save one boost for emergencies
5. Use boosts when fuel is plentiful

EXPERIMENT:
1. Try completing a race without using any boosts
2. Try jumping over every obstacle vs avoiding them
3. Collect every boost pad you see
4. Use all boosts on the final lap

Remember: Special actions are tools in your toolkit - 
use them wisely based on the situation!
*/