// FuelBot - Manages fuel and seeks boosts
// Shows how to find fuel zones and boost pads
//
// TRACK ELEMENTS:
// - Orange cones = OBSTACLES (crash = 70% speed loss + 5L fuel damage!)
// - Yellow zones = BOOST PADS (drive over for +20 km/h speed)
// - Green zones = FUEL ZONES (refuel at 72L/sec, lanes 1-2 only)
// - Lane 0 (inner) = 95% distance, Lane 1 (middle) = 100%, Lane 2 (outer) = 105%

class PlayerBot {
    constructor() {
        this.fuelStrategy = "normal";
    }

    decide(state, car) {
        // Get complete track visibility with NEW helper methods!
        const obstacles = state.getObstaclesAhead();
        const fuelStations = state.getFuelStationsAhead();
        const boostPads = state.getBoostPadsAhead();
        
        console.log(`FuelBot sees: ${obstacles.length} obstacles, ${fuelStations.length} fuel stations, ${boostPads.length} boost pads`);

        // PRIORITY 1: Avoid immediate obstacles
        const nearObstacles = obstacles.filter(obs => obs.lane === state.car.lane && obs.distance < 20);
        if (nearObstacles.length > 0) {
            console.log("Dodging obstacle!");
            // Find safest lane
            for (let lane = 0; lane <= 2; lane++) {
                if (state.isLaneSafe(lane)) {
                    if (lane < state.car.lane) {
                        car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                    } else if (lane > state.car.lane) {
                        car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                    }
                    return;
                }
            }
        }

        // PRIORITY 2: Seek fuel stations when low on fuel
        if (state.car.fuel < 50) {
            const nearFuel = fuelStations.filter(f => f.distance < 80);
            if (nearFuel.length > 0) {
                const closestFuel = nearFuel[0];
                console.log(`Moving to fuel station in lane ${closestFuel.lane}`);
                
                if (closestFuel.lane !== state.car.lane && state.isLaneSafe(closestFuel.lane)) {
                    if (closestFuel.lane < state.car.lane) {
                        car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                    } else {
                        car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                    }
                    return;
                } else if (closestFuel.lane === state.car.lane && closestFuel.distance < 30) {
                    // Slow down to spend more time in fuel zone
                    console.log("In fuel zone - coasting to refuel!");
                    car.executeAction(CAR_ACTIONS.COAST);
                    return;
                }
            }
        }

        // PRIORITY 3: Seek boost pads when we have good fuel
        if (state.car.fuel > 40) {
            const nearBoosts = boostPads.filter(b => b.distance < 60);
            if (nearBoosts.length > 0) {
                const closestBoost = nearBoosts[0];
                console.log(`Moving to boost pad in lane ${closestBoost.lane}`);
                
                if (closestBoost.lane !== state.car.lane && state.isLaneSafe(closestBoost.lane)) {
                    if (closestBoost.lane < state.car.lane) {
                        car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                    } else {
                        car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                    }
                    return;
                } else if (closestBoost.lane === state.car.lane && closestBoost.distance < 30) {
                    // Speed up to maximize boost benefit
                    console.log("Hitting boost pad!");
                    if (state.car.boosts > 0) {
                        car.executeAction(CAR_ACTIONS.BOOST);
                    } else {
                        car.executeAction(CAR_ACTIONS.SPRINT);
                    }
                    return;
                }
            }
        }
                    }
                }
            }
        }

        // PRIORITY 3: Find fuel zones (green areas) if low
        if (state.car.fuel < 40) {
            for (let i = 0; i < state.track.ahead.length; i++) {
                if (state.track.ahead[i].type === 'fuel_zone') {
                    // Found fuel! Coast to save fuel while getting there
                    car.executeAction(CAR_ACTIONS.COAST);
                    return;
                }
            }
        }

        // FUEL STRATEGY
        if (state.car.fuel > 70) {
            this.fuelStrategy = "aggressive";
        } else if (state.car.fuel > 40) {
            this.fuelStrategy = "normal";
        } else if (state.car.fuel > 20) {
            this.fuelStrategy = "conservative";
        } else {
            this.fuelStrategy = "critical";
        }

        // Execute strategy
        switch (this.fuelStrategy) {
            case "aggressive":
                car.executeAction(CAR_ACTIONS.SPRINT);
                break;
            case "normal":
                car.executeAction(CAR_ACTIONS.ACCELERATE);
                break;
            case "conservative":
                car.executeAction(CAR_ACTIONS.COAST);
                break;
            case "critical":
                car.executeAction(CAR_ACTIONS.COAST);
                break;
        }
    }
}