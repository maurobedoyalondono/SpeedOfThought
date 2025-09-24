// FuelBot - Manages fuel and seeks boosts
// Shows how to find fuel zones and boost pads
//
// TRACK ELEMENTS:
// - Orange cones = OBSTACLES (crash = 70% speed loss + 5L fuel damage!)
// - Yellow zones = BOOST PADS (drive over for +20 km/h speed)
// - Green zones = FUEL ZONES (refuel at 72L/sec, lanes 1-2 only)
// - All lanes are equal distance (no lane advantage)

class PlayerBot {
    constructor() {
        this.fuelStrategy = "normal";
    }

    decide(state, car) {
        // PRIORITY 1: Avoid obstacles (orange cones)
        if (state.track.ahead[0].obstacles && state.track.ahead[0].obstacles.length > 0) {
            const obstacle = state.track.ahead[0].obstacles[0];
            if (obstacle.lane === state.car.lane) {
                if (state.car.lane === 0) {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                } else {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                }
                return;
            }
        }

        // PRIORITY 2: Look for boost pads (yellow zones) when we have good fuel
        if (state.car.fuel > 40) {
            for (let i = 0; i < Math.min(2, state.track.ahead.length); i++) {
                if (state.track.ahead[i].type === 'boost_zone' && state.track.ahead[i].items) {
                    const boostPad = state.track.ahead[i].items[0];
                    if (boostPad && boostPad.lane !== state.car.lane) {
                        // Move to the boost pad lane!
                        if (boostPad.lane < state.car.lane) {
                            car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                        } else {
                            car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                        }
                        return;
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