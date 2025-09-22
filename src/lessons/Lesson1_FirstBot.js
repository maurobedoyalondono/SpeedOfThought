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

        // CHALLENGE 3: Check your speed
        // console.log("My speed:", state.car.speed, "km/h");
    }
}

/*
NOTES FOR STUDENTS:

1. Your bot's decide() function runs 60 times per second
2. Each time, you can tell your car what to do
3. The last action you execute is what the car will do

AVAILABLE ACTIONS FOR LESSON 1:
- CAR_ACTIONS.ACCELERATE - Speed up
- CAR_ACTIONS.COAST - Keep current speed (saves fuel)
- CAR_ACTIONS.BRAKE - Slow down
- CAR_ACTIONS.IDLE - Do nothing (car naturally slows)

WHAT YOU CAN CHECK:
- state.car.fuel - How much fuel you have (0-100)
- state.car.speed - How fast you're going (km/h)
- state.car.position - Where you are on the track (meters)
- state.car.lap - What lap you're on

EXPERIMENT:
1. Try different actions
2. Watch your fuel gauge
3. See how fast you can go
4. Try to complete a lap!
*/