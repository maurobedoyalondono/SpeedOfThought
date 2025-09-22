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
        // - SPRINT: Fast but uses lots of fuel (2.5 per tick)
        // - ACCELERATE: Normal speed, normal fuel (1.0 per tick)
        // - COAST: Maintain speed, save fuel (0.3 per tick)
        // - IDLE: Slow down naturally (0.5 per tick)

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
- SPRINT: 2.5 fuel/tick (very fast, very expensive)
- ACCELERATE: 1.0 fuel/tick (balanced)
- COAST: 0.3 fuel/tick (maintain speed efficiently)
- BRAKE: 0.1 fuel/tick (slowing down)
- IDLE: 0.5 fuel/tick (gradual slowdown)

FUEL ZONES:
- Green zones on the track restore fuel
- Drive through them to refuel
- Plan your route to hit fuel zones when needed

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
- 40 seconds = 2400 ticks
- At ACCELERATE (1.0 fuel/tick) that's 2400 fuel per lap!
- You need to be more efficient!
*/