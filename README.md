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
car.executeAction(CAR_ACTIONS.ACCELERATE);  // Go faster
car.executeAction(CAR_ACTIONS.SPRINT);      // Maximum speed!
car.executeAction(CAR_ACTIONS.COAST);       // Save fuel
car.executeAction(CAR_ACTIONS.BRAKE);       // Slow down
car.executeAction(CAR_ACTIONS.BOOST);       // Super speed burst!

// Lane Changes
car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);

// Special
car.executeAction(CAR_ACTIONS.JUMP);        // Jump over obstacles
car.executeAction(CAR_ACTIONS.ENTER_PIT);   // Pit stop for fuel
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
- Realistic acceleration and braking
- Fuel consumption based on speed
- Drafting (slipstream) behind opponents
- Lane changes and collisions

### Track Features
- **Obstacles**: Cones to avoid or jump over
- **Fuel Zones**: Green areas to refuel
- **Boost Pads**: Yellow zones for speed boosts
- **Pit Lane**: Full refuel but costs time

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
        speed: 180,        // km/h
        fuel: 75.5,        // liters remaining
        lane: 1,           // 0=left, 1=middle, 2=right
        lap: 2,            // current lap
        position: 1234,    // meters from start
        boosts: 2,         // boost charges left
        isDrafting: false  // behind opponent?
    },
    opponent: {
        distance: -15,     // negative = behind you
        speed: 175,
        lane: 2
    },
    track: {
        ahead: [...]       // upcoming track segments
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