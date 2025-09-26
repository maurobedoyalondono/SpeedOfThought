// LESSON 2: Fuel Management
// Goal: Complete 3 laps by managing your fuel wisely!

class PlayerBot {
    constructor() {
        // Let's track some information between ticks
        this.totalTicks = 0;
        console.log("Lesson 2: Learning fuel management!");
    }

    decide(state, car) {
        this.totalTicks++;

        // CONCEPT: Different actions use different amounts of fuel
        // Real consumption varies with speed but base rates are:
        // - SPRINT: Fast but uses lots of fuel (~2.7L/sec at speed)
        // - ACCELERATE: Normal speed, moderate fuel (~1.5L/sec)
        // - COAST: Maintain speed, save fuel (~0.48L/sec)
        // - BRAKE: Slow down efficiently (~0.18L/sec)
        // - IDLE: Slow down naturally (~0.3L/sec)

        // BASIC STRATEGY: Adjust speed based on fuel level
        if (state.car.fuel > 70) {
            // Lots of fuel - go fast!
            car.executeAction(CAR_ACTIONS.ACCELERATE);
        } else if (state.car.fuel > 40) {
            // Medium fuel - normal speed
            car.executeAction(CAR_ACTIONS.ACCELERATE);
        } else if (state.car.fuel > 20) {
            // Getting low - save fuel
            car.executeAction(CAR_ACTIONS.COAST);
        } else {
            // Critical - maximum fuel saving!
            car.executeAction(CAR_ACTIONS.COAST);
        }

        // TIP: Look for fuel zones on the track using new helper methods!
        // Fuel zones are GREEN and only exist in lanes 1 and 2 (middle and right)
        const fuelStations = state.getFuelStationsAhead();
        if (fuelStations.length > 0) {
            const nearestFuel = fuelStations[0]; // Already sorted by distance
            console.log("Fuel station ahead in lane", nearestFuel.lane, "at distance", nearestFuel.distance);

            // Are we in the right lane for refueling?
            if (state.car.lane === 0 && state.car.fuel < 60) {
                console.log("I'm in lane 0 - need to change lanes to reach fuel zone!");
            }
        }

        // ADVANCED TIP: Check if we have a fuel station right ahead in our lane
        if (state.hasFuelStationAhead()) {
            console.log("Fuel station in my lane! Will refuel at 72L/second");
            // Slow down to stay in the fuel zone longer if we need fuel!
            if (state.car.fuel < 80) {
                car.executeAction(CAR_ACTIONS.BRAKE); // Stay longer to refuel more
                console.log("Braking to maximize refuel time");
                return; // Don't execute other actions
            }
        }

        // CHALLENGE 1: Track your fuel consumption
        // Every 60 ticks (1 second), log your fuel status
        // if (this.totalTicks % 60 === 0) {
        //     console.log("After", this.totalTicks/60, "seconds - Fuel:", state.car.fuel);
        // }

        // CHALLENGE 2: Sprint when you have extra fuel
        // if (state.car.fuel > 80 && !state.hasObstacleAhead()) {
        //     car.executeAction(CAR_ACTIONS.SPRINT); // Go very fast!
        // }

        // CHALLENGE 3: Smart lane changing for fuel zones
        // const fuelStations = state.getFuelStationsAhead();
        // if (state.car.fuel < 60 && state.car.lane === 0 && fuelStations.length > 0) {
        //     console.log("Low fuel and in lane 0 - changing to lane 1 for fuel access");
        //     if (state.isLaneSafe(1)) {
        //         car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
        //         return; // Lane changes take priority
        //     }
        // }

        // CHALLENGE 4: Calculate fuel efficiency
        // if (this.totalTicks % 60 === 0) {
        //     const fuelUsedThisSecond = 100 - state.car.fuel; // Very rough estimate
        //     console.log("Rough fuel efficiency check - Fuel left:", state.car.fuel);
        // }

        // CHALLENGE 5: Emergency fuel management with smart look-ahead
        // const lapsRemaining = state.track.totalLaps - state.car.lap + 1;
        // const estimatedFuelPerLap = 35; // This is a guess - you need to measure!
        // const fuelNeeded = lapsRemaining * estimatedFuelPerLap;
        // const fuelStations = state.getFuelStationsAhead();
        // if (fuelNeeded > state.car.fuel && fuelStations.length === 0) {
        //     console.log("WARNING: May not have enough fuel and no stations visible!");
        //     car.executeAction(CAR_ACTIONS.COAST); // Emergency conservation
        // }
    }
}

/*
LESSON 2 CONCEPTS:

FUEL CONSUMPTION RATES:
- SPRINT: ~2.7L/sec (very fast, very expensive, varies with speed)
- ACCELERATE: ~1.5L/sec (balanced, moderate fuel use)
- COAST: ~0.48L/sec (maintain speed efficiently)
- BRAKE: ~0.18L/sec (slowing down, minimal fuel)
- IDLE: ~0.3L/sec (gradual slowdown, low fuel)

FUEL ZONES:
- Green zones on the track restore fuel at 72L/second
- Only available in lanes 1 and 2 (middle and right)
- Drive slowly through them to maximize refuel time

NEW HELPER METHODS FOR FUEL MANAGEMENT:
- state.getFuelStationsAhead() - Returns array of all visible fuel stations
- state.hasFuelStationAhead() - True if fuel station in your current lane
- state.isLaneSafe(lane) - Check if you can safely change to a lane

STRATEGY TIPS:
1. You don't always need maximum speed
2. Coasting maintains your speed while saving fuel
3. Look ahead for fuel zones with getFuelStationsAhead()
4. Use hasFuelStationAhead() to know when you're approaching fuel
5. Calculate if you have enough fuel to finish
6. Sometimes slowing down helps you go further

ADVANCED CHALLENGE:
Can you complete 3 laps using less than 150 total fuel?

MATH HELP:
- Track is 2000 meters per lap
- At 180 km/h, you travel 50 meters per second
- That's 40 seconds per lap at constant speed
- At moderate ACCELERATE fuel consumption (~1.5L/sec) that's 60L per lap!
- You need to be more efficient with coasting and fuel zones!
*/