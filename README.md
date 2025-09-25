# 🏁 SpeedOfThought - Racing Programming Game

Learn programming by racing cars! Write JavaScript code to control your race car and compete against opponents in this educational racing game designed for students with minimal programming experience.

## 🎮 Quick Start

1. **Open the game**: Just open `src/index.html` in your browser (Chrome, Firefox, Safari, or Edge)
2. **Load bots**: Drag and drop two `.js` bot files into the game, or click "Load Example Bots"
3. **Race**: Click "START RACE" and watch your bots compete!

No installation, no server, no dependencies - just open and play!

## 🎯 For Students

### Your First Bot (3 lines of code!)

Create a file called `MyBot.js`:

```javascript
class PlayerBot {
    decide(state, car) {
        car.executeAction(CAR_ACTIONS.ACCELERATE);
    }
}
```

That's it! Your car will race forward. But can you make it smarter?

### How It Works

Your bot's `decide()` function runs 60 times per second. Each time, you can:
- Check your car's state (speed, fuel, position)
- See what's ahead on the track
- Tell your car what to do

### Available Actions

```javascript
// Speed Control
car.executeAction(CAR_ACTIONS.ACCELERATE);  // +5 km/h per tick, moderate fuel
car.executeAction(CAR_ACTIONS.SPRINT);      // +10 km/h per tick, high fuel
car.executeAction(CAR_ACTIONS.COAST);       // Maintain speed, low fuel use
car.executeAction(CAR_ACTIONS.BRAKE);       // -15 km/h per tick, minimal fuel
car.executeAction(CAR_ACTIONS.BOOST);       // +20 km/h per tick, uses boost charge
car.executeAction(CAR_ACTIONS.IDLE);        // -2 km/h per tick, low fuel use

// Lane Changes
car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);

// Special Actions
car.executeAction(CAR_ACTIONS.JUMP);        // Jump over obstacles (10 ticks)
car.executeAction(CAR_ACTIONS.ENTER_PIT);   // Enter pit lane for full refuel
```

### Learning Path

1. **Lesson 1**: Make your car move (`lessons/Lesson1_FirstBot.js`)
2. **Lesson 2**: Manage your fuel (`lessons/Lesson2_FuelManagement.js`)
3. **Lesson 3**: Avoid obstacles (`lessons/Lesson3_Obstacles.js`)
4. **Lesson 4**: Race opponents (`lessons/Lesson4_Racing.js`)
5. **Lesson 5**: Advanced strategy (`lessons/Lesson5_Advanced.js`)

### Example Bots

Check out the `examples/` folder:
- `SimpleBot.js` - Just the basics
- `FuelBot.js` - Smart fuel management
- `RacingBot.js` - Competitive racing logic
- `AdvancedBot.js` - Complex strategy with memory

## 👩‍🏫 For Teachers

### Classroom Setup

1. Copy the `SpeedOfThought/src` folder to a USB drive or network share
2. Students open `index.html` in any modern browser
3. Students write bot code in any text editor (Notepad++, VS Code, etc.)
4. No internet required!

### Running a Tournament

1. Collect all student `.js` files
2. Load pairs of bots into the game
3. Run races and track results
4. The game shows real-time stats and race positions

### Assessment Rubric

- **Basic Movement** (25%): Bot completes laps
- **Fuel Management** (25%): Efficient fuel usage
- **Obstacle Avoidance** (25%): Handles track hazards
- **Racing Strategy** (25%): Competitive tactics

### Customization

Edit track parameters in `index.html`:
- Track length
- Number of laps
- Obstacle frequency
- Fuel availability

## 🎨 Game Features

### Visual Elements
- **Top-down racing view** with smooth animations
- **Real-time stats** showing speed, fuel, and position
- **Action log** to see what decisions bots are making
- **Colorful UI** designed to engage teenagers

### Physics Simulation

- Realistic acceleration and braking with speed limits
- Dynamic fuel consumption based on action and speed
- Drafting (slipstream) saves up to 30% fuel when close behind opponent
- Lane changes take 5 ticks to complete

### Track Features

- **Obstacles**: Orange cones that reduce speed by 70% and cause 5L fuel damage
- **Fuel Zones**: Green areas for continuous refueling (72L/second)
- **Boost Pads**: Yellow zones that add +20 km/h speed bonus
- **Pit Lane**: Full refuel option but costs significant time
- **3 Lanes**: **Realistic lane distances** - Lane 0 (inner) is 5% shorter, Lane 2 (outer) is 5% longer

## 🔧 Technical Details

### System Requirements
- Any modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- No server or installation needed
- Works offline
- Runs on school computers

### Architecture
- Single HTML file with embedded CSS and JavaScript
- Web Workers for secure bot execution
- Canvas API for rendering
- File API for loading student code

### Bot API

Students write a class with a `decide` method:

```javascript
class PlayerBot {
    constructor() {
        // Optional: Initialize bot memory
        this.strategy = "aggressive";
    }

    decide(state, car) {
        // state contains all race information
        // car.executeAction() to control the car

        if (state.car.fuel < 30) {
            car.executeAction(CAR_ACTIONS.COAST);
        } else {
            car.executeAction(CAR_ACTIONS.ACCELERATE);
        }
    }
}
```

### State Object

The `state` parameter contains:

```javascript
state = {
    car: {
        speed: 180,        // km/h (0-300 max)
        fuel: 75.5,        // liters remaining (0-100)
        lane: 1,           // 0=left, 1=middle, 2=right
        lap: 2,            // current lap number
        position: 1234,    // meters from start of current lap
        boosts: 2,         // boost charges remaining
        isDrafting: false, // true when behind opponent (5-25m)
        draftEffectiveness: 0.8  // 0.0-1.0 drafting efficiency
    },
    opponent: {
        distance: -15,     // meters (negative = they're behind you)
        speed: 175,        // their current speed
        lane: 2            // their current lane
    },
    track: {
        totalLaps: 3,      // number of laps to complete
        lapDistance: 2000, // meters per lap
        ahead: [...]       // array of upcoming 10m segments
    },

    // NEW HELPER METHODS - See everything on the track!
    
    // Get ALL obstacles in ALL lanes ahead
    getObstaclesAhead: () => [
        { lane: 0, distance: 20, type: 'obstacle' },
        { lane: 1, distance: 30, type: 'obstacle' },
        { lane: 2, distance: 50, type: 'obstacle' }
    ],
    
    // Get ALL fuel stations in ALL lanes ahead
    getFuelStationsAhead: () => [
        { lane: 1, distance: 80, type: 'fuel_station' },
        { lane: 0, distance: 120, type: 'fuel_station' }
    ],
    
    // Get ALL boost pads in ALL lanes ahead
    getBoostPadsAhead: () => [
        { lane: 2, distance: 40, type: 'boost_pad' }
    ],
    
    // Convenience methods for your current lane
    hasObstacleAhead: () => true,      // boolean - obstacle in my lane?
    hasFuelStationAhead: () => false,  // boolean - fuel in my lane?
    hasBoostPadAhead: () => true,      // boolean - boost in my lane?
    isLaneSafe: (lane) => true         // boolean - can I move to this lane?
}
```

### NEW: Complete Track Visibility

Now you can see EVERYTHING on the track ahead! Use these helper methods to build smart racing strategies:

```javascript
class PlayerBot {
    decide(state, car) {
        // See all obstacles in all lanes
        const obstacles = state.getObstaclesAhead();
        console.log("Obstacles:", obstacles);
        // Output: [{ lane: 0, distance: 20, type: 'obstacle' }, ...]
        
        // Strategic lane choice based on complete information
        const myObstacles = obstacles.filter(obs => obs.lane === state.car.lane);
        if (myObstacles.length > 0) {
            // Find safest lane
            for (let lane = 0; lane <= 2; lane++) {
                if (state.isLaneSafe(lane)) {
                    // Move to safe lane
                    if (lane < state.car.lane) {
                        car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                    } else {
                        car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                    }
                    return;
                }
            }
        }
        
        // Check for fuel stations
        const fuelStations = state.getFuelStationsAhead();
        const nearFuel = fuelStations.filter(f => f.lane === state.car.lane && f.distance < 50);
        if (nearFuel.length > 0 && state.car.fuel < 60) {
            car.executeAction(CAR_ACTIONS.COAST); // Slow down to refuel more
            return;
        }
        
        // Check for boost pads
        const boostPads = state.getBoostPadsAhead();
        const nearBoosts = boostPads.filter(b => b.lane === state.car.lane && b.distance < 40);
        if (nearBoosts.length > 0) {
            car.executeAction(CAR_ACTIONS.SPRINT); // Speed up to hit boost
            return;
        }
        
        // Default action
        car.executeAction(CAR_ACTIONS.ACCELERATE);
    }
}
```

## 📚 Educational Goals

Students learn:
- **Sequential thinking**: Code executes in order
- **Conditionals**: If-then decision making
- **State management**: Tracking information over time
- **Debugging**: Using console.log to understand behavior
- **Optimization**: Balancing speed vs fuel efficiency
- **Algorithm design**: Creating strategies to win

## 🏆 Challenges

### Beginner Challenges
- Complete 1 lap without running out of fuel
- Avoid all obstacles in a lap
- Finish a 3-lap race

### Intermediate Challenges
- Win using less than 200 total fuel
- Complete a race without hitting obstacles
- Overtake opponent using drafting

### Advanced Challenges
- Win without using boost
- Complete race with optimal fuel efficiency
- Implement predictive obstacle avoidance
- Create adaptive strategy based on opponent

## 🤝 Contributing

This is an educational project. Contributions welcome!
- Report issues on GitHub
- Share your creative bot strategies
- Suggest new track features
- Contribute lesson plans

## 📄 License

MIT License - Free for educational use

## 🎯 Learning Outcomes

After using SpeedOfThought, students will understand:
- How programs make decisions
- The importance of resource management
- How to debug and iterate on code
- Basic algorithm optimization
- The fun of programming!

---

**Remember**: The best race car isn't the fastest - it's the smartest! 🏁

Happy Racing and Happy Coding!