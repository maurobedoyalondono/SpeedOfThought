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

        // TIP: Look for fuel zones on the track!
        // Check what's ahead of you:
        for (let i = 0; i < state.track.ahead.length; i++) {
            if (state.track.ahead[i].type === 'fuel_zone') {
                console.log("Fuel zone ahead at distance:", state.track.ahead[i].distance);
                // When you drive through a fuel zone, you'll refuel!
                break;
            }
        }

        // CHALLENGE 1: Track your fuel consumption
        // Every 60 ticks (1 second), log your fuel status
        // if (this.totalTicks % 60 === 0) {
        //     console.log("After", this.totalTicks/60, "seconds - Fuel:", state.car.fuel);
        // }

        // CHALLENGE 2: Sprint when you have extra fuel
        // if (state.car.fuel > 80) {
        //     car.executeAction(CAR_ACTIONS.SPRINT);
        // }

        // CHALLENGE 3: Calculate if you can finish the race
        // const lapsRemaining = state.track.totalLaps - state.car.lap + 1;
        // const fuelPerLap = 30; // Estimate
        // const fuelNeeded = lapsRemaining * fuelPerLap;
        // if (fuelNeeded > state.car.fuel) {
        //     console.log("Warning: May not have enough fuel!");
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

STRATEGY TIPS:
1. You don't always need maximum speed
2. Coasting maintains your speed while saving fuel
3. Look ahead for fuel zones
4. Calculate if you have enough fuel to finish
5. Sometimes slowing down helps you go further

ADVANCED CHALLENGE:
Can you complete 3 laps using less than 150 total fuel?

MATH HELP:
- Track is 2000 meters per lap
- At 180 km/h, you travel 50 meters per second
- That's 40 seconds per lap at constant speed
- At moderate ACCELERATE fuel consumption (~1.5L/sec) that's 60L per lap!
- You need to be more efficient with coasting and fuel zones!
*/