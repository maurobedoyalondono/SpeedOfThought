// LESSON 1: Your First Bot
// Goal: Learn the basics - make your car move!

class PlayerBot {
    // This function is called once when the race starts
    constructor() {
        console.log("My first bot is ready to race!");
    }

    // This function is called 60 times per second during the race
    // You get the current 'state' and can control your 'car'
    decide(state, car) {
        // TRY THIS FIRST: Make your car go forward!
        car.executeAction(CAR_ACTIONS.ACCELERATE);

        // That's it! Your car will now accelerate forward.
        // But watch out - it will run out of fuel!

        // CHALLENGE 1: Check your fuel level
        // Uncomment the line below to see your fuel in the console
        // console.log("My fuel level:", state.car.fuel);

        // CHALLENGE 2: Save fuel when it gets low
        // Uncomment these lines to coast when fuel is below 30
        // if (state.car.fuel < 30) {
        //     car.executeAction(CAR_ACTIONS.COAST);
        // }

        // CHALLENGE 3: Check your speed and position
        // console.log("Speed:", state.car.speed, "km/h | Position:", state.car.position, "meters");

        // CHALLENGE 4: Try different actions based on your speed
        // if (state.car.speed > 200) {
        //     car.executeAction(CAR_ACTIONS.COAST); // Maintain high speed efficiently
        // } else {
        //     car.executeAction(CAR_ACTIONS.ACCELERATE); // Speed up
        // }
    }
}

/*
NOTES FOR STUDENTS:

1. Your bot's decide() function runs 60 times per second
2. Each time, you can tell your car what to do
3. The last action you execute is what the car will do

AVAILABLE ACTIONS FOR LESSON 1:
- CAR_ACTIONS.ACCELERATE - Speed up by 5 km/h per tick (moderate fuel: ~1.5L/sec)
- CAR_ACTIONS.SPRINT - Speed up by 10 km/h per tick (high fuel: ~2.7L/sec)
- CAR_ACTIONS.COAST - Keep current speed (low fuel: ~0.48L/sec)
- CAR_ACTIONS.BRAKE - Slow down by 15 km/h per tick (minimal fuel: ~0.18L/sec)
- CAR_ACTIONS.IDLE - Do nothing (car slows by 2 km/h, very low fuel: ~0.3L/sec)

WHAT YOU CAN CHECK:
- state.car.fuel - How much fuel you have (0-100L, starts at 100)
- state.car.speed - How fast you're going (0-300 km/h max)
- state.car.position - Where you are in current lap (meters, 0-2000)
- state.car.lap - What lap you're on (starts at 1)
- state.track.totalLaps - How many laps in the race (usually 3)

EXPERIMENT:
1. Try different actions and watch the fuel gauge
2. See how SPRINT makes you faster but uses lots of fuel
3. Notice how COAST maintains speed while saving fuel
4. Try to complete a lap - the track is 2000 meters long!
5. Watch what happens when you run out of fuel
*/