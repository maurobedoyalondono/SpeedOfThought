// SimpleBot - The most basic bot that can complete a race
// Just drives forward and tries not to crash!
//
// TRACK ELEMENTS:
// - Orange cones = OBSTACLES (crash = 70% speed loss + 5L fuel damage!)
// - Yellow zones = BOOST PADS (drive over for +20 km/h speed)
// - Green zones = FUEL ZONES (drive through to refuel at 72L/sec)
// - Fuel zones only exist in lanes 1-2 (middle and right lanes)

// SimpleBot - The most basic bot that can complete a race
// Just drives forward and tries not to crash!
//
// TRACK ELEMENTS:
// - Orange cones = OBSTACLES (crash = 70% speed loss + 5L fuel damage!)
// - Yellow zones = BOOST PADS (drive over for +20 km/h speed)
// - Green zones = FUEL ZONES (drive through to refuel at 72L/sec)
// - Fuel zones only exist in lanes 1-2 (middle and right lanes)

class PlayerBot {
    decide(state, car) {
        // NEW: SimpleBot can now see what's ahead!
        
        // Check if there's an obstacle coming in my lane
        if (state.hasObstacleAhead()) {
            console.log("SimpleBot sees obstacle ahead!");
            
            // Try to move to a safe lane
            if (state.isLaneSafe(1) && state.car.lane !== 1) {
                console.log("Moving to middle lane!");
                if (state.car.lane < 1) {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                } else {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                }
                return;
            } else if (state.isLaneSafe(2) && state.car.lane !== 2) {
                console.log("Moving to right lane!");
                car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                return;
            } else if (state.isLaneSafe(0) && state.car.lane !== 0) {
                console.log("Moving to left lane!");
                car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                return;
            }
        }
        
        // Check for fuel station coming up
        if (state.hasFuelStationAhead() && state.car.fuel < 70) {
            console.log("SimpleBot sees fuel station - slowing down to refuel!");
            car.executeAction(CAR_ACTIONS.COAST);
            return;
        }
        
        // Check for boost pad
        if (state.hasBoostPadAhead()) {
            console.log("SimpleBot sees boost pad - speeding up!");
            car.executeAction(CAR_ACTIONS.SPRINT);
            return;
        }

        // Default action: Keep moving forward while we have fuel
        if (state.car.fuel > 10) {
            car.executeAction(CAR_ACTIONS.ACCELERATE);
        } else {
            // Almost out of fuel - just coast
            car.executeAction(CAR_ACTIONS.COAST);
        }
    }
}

// SimpleBot now uses the new helper methods:
// - state.hasObstacleAhead() - obstacle in my lane?
// - state.hasFuelStationAhead() - fuel station in my lane?
// - state.hasBoostPadAhead() - boost pad in my lane?
// - state.isLaneSafe(lane) - can I move to this lane?