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
        // SimpleBot only accelerates - no lane changes!
        // It will hit obstacles but keep going

        // Keep moving forward while we have fuel
        if (state.car.fuel > 10) {
            car.executeAction(CAR_ACTIONS.ACCELERATE);
        } else {
            // Almost out of fuel - just coast
            car.executeAction(CAR_ACTIONS.COAST);
        }
    }
}