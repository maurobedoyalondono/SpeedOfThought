# SpeedOfThought - Implementation Plan

## Overview
Based on the specifications, we'll build a single-file HTML application that runs entirely in the browser. Students write JavaScript bot classes with a `decide()` method that calls `car.executeAction()` to control their race car.

## Architecture Principles
1. **Single File Deployment**: Everything in one `index.html` file
2. **Zero Dependencies**: Pure vanilla JavaScript, no frameworks
3. **File-Based Workflow**: Students edit .js files externally, drag into app
4. **Sandboxed Execution**: Web Workers for safe bot execution
5. **Attractive Visuals**: Canvas-based rendering with smooth animations

## Project Structure
```
/src
├── index.html              # Complete application (HTML + CSS + JS embedded)
├── examples/               # Example bots for students
│   ├── SimpleBot.js        # Minimal working example
│   ├── FuelBot.js          # Fuel management example
│   ├── RacingBot.js        # Competitive example
│   └── AdvancedBot.js      # Complex strategy example
├── lessons/                # Progressive learning materials
│   ├── Lesson1_FirstBot.js
│   ├── Lesson2_FuelManagement.js
│   ├── Lesson3_Obstacles.js
│   ├── Lesson4_Racing.js
│   └── Lesson5_Advanced.js
└── assets/                 # Optional: Can be embedded as base64
    └── (car sprites, sounds if needed)
```

## Implementation Phases

### Phase 1: Core Foundation (Day 1)
1. **Create index.html structure**
   - HTML layout with canvas and control panels
   - Embedded CSS for attractive UI
   - Basic JavaScript module structure

2. **Implement CAR_ACTIONS enum**
   ```javascript
   const CAR_ACTIONS = Object.freeze({
     ACCELERATE: 'ACCELERATE',
     SPRINT: 'SPRINT',
     COAST: 'COAST',
     BRAKE: 'BRAKE',
     BOOST: 'BOOST',
     CHANGE_LANE_LEFT: 'CHANGE_LANE_LEFT',
     CHANGE_LANE_RIGHT: 'CHANGE_LANE_RIGHT',
     JUMP: 'JUMP',
     ENTER_PIT: 'ENTER_PIT',
     IDLE: 'IDLE'
   });
   ```

3. **Create CarController class**
   - executeAction() method
   - Action categorization and conflict resolution
   - Last-action-wins logic for same category

### Phase 2: Game Engine (Day 1-2)
1. **RaceEngine class**
   - Tick-based simulation (60 FPS)
   - State management
   - Win condition checking

2. **PhysicsEngine class**
   - Movement calculations
   - Fuel consumption (non-linear)
   - Drafting mechanics
   - Collision detection and resolution
   - Lane change physics

3. **State object structure**
   - Complete state as defined in specs
   - Immutable cloning for bot safety

### Phase 3: Bot Sandbox (Day 2)
1. **BotSandbox class**
   - Web Worker creation and management
   - Code injection with security restrictions
   - Timeout enforcement (1ms)
   - State isolation

2. **Bot loading and validation**
   - Check for required class structure
   - Detect forbidden operations
   - Error handling and reporting

### Phase 4: Rendering System (Day 2-3)
1. **Renderer class**
   - Canvas setup and optimization
   - Track rendering (oval with lanes)
   - Car sprites with animations
   - Visual effects (boost, drafting, jumping)
   - HUD elements (speed, fuel, laps)

2. **Visual Polish**
   - Attractive color scheme
   - Smooth animations (60 FPS)
   - Particle effects
   - Speed trails

### Phase 5: User Interface (Day 3)
1. **File handling**
   - Drag & drop zones
   - File validation
   - Bot selection UI

2. **Race controls**
   - Start/Pause/Reset buttons
   - Speed control (1x, 2x, 4x)
   - Debug mode toggle

3. **Information panels**
   - Live race stats
   - Action log
   - Code display with syntax highlighting

### Phase 6: Track System (Day 3-4)
1. **TrackGenerator class**
   - Procedural generation with seeds
   - Difficulty levels
   - Obstacle, fuel zone, and boost pad placement
   - Track validation

2. **Track elements**
   - Obstacles (jumpable)
   - Fuel zones (refueling areas)
   - Boost pads (speed bonuses)
   - Pit lane implementation

### Phase 7: Advanced Features (Day 4)
1. **Debug mode**
   - Tick-by-tick stepping
   - State inspection
   - Action history

2. **Replay system**
   - Record all actions
   - Deterministic playback
   - Export/import replays

3. **Tournament mode**
   - Bracket generation
   - Automated match running
   - Results export (CSV)

### Phase 8: Examples and Testing (Day 4-5)
1. **Create example bots**
   - SimpleBot (just accelerates)
   - FuelBot (manages fuel)
   - RacingBot (competitive logic)
   - AdvancedBot (complex strategies)

2. **Create lesson progression**
   - 5 lessons with increasing complexity
   - Each with specific learning objectives

3. **Performance testing**
   - Ensure 60 FPS on moderate hardware
   - Optimize state cloning
   - Memory usage under 100MB

## Key Implementation Details

### 1. Single File Structure
```html
<!DOCTYPE html>
<html>
<head>
  <title>SpeedOfThought - Racing Programming Game</title>
  <style>
    /* All CSS embedded here */
  </style>
</head>
<body>
  <div id="game-container">
    <canvas id="race-canvas"></canvas>
    <div id="control-panel">...</div>
    <div id="bot-loader">...</div>
  </div>

  <script>
    // Complete application JavaScript

    // 1. Constants
    const CAR_ACTIONS = {...};

    // 2. Core Classes
    class RaceEngine {...}
    class PhysicsEngine {...}
    class Renderer {...}
    class BotSandbox {...}
    class CarController {...}

    // 3. UI Controllers
    class FileHandler {...}
    class UIController {...}

    // 4. Track System
    class TrackGenerator {...}

    // 5. Main Application
    class SpeedOfThought {...}

    // 6. Initialize on load
    window.addEventListener('load', () => {
      const app = new SpeedOfThought();
      app.init();
    });
  </script>
</body>
</html>
```

### 2. Bot Execution Flow
```javascript
// 1. Student writes bot
class PlayerBot {
  decide(state, car) {
    car.executeAction(CAR_ACTIONS.ACCELERATE);
  }
}

// 2. Load into Web Worker
const worker = new Worker(blobURL);
worker.postMessage({ bot: botCode, state: gameState });

// 3. Execute in sandbox
// Inside worker:
const car = new CarController();
bot.decide(state, car);
postMessage({ actions: car.getExecutionPlan() });

// 4. Apply to physics
physicsEngine.applyActions(gameState, actions);
```

### 3. Critical Performance Paths
1. **State Cloning**: Use structured cloning or optimized JSON
2. **Rendering**: Pre-render static elements, only update dynamic
3. **Worker Communication**: Minimize message size
4. **Physics Calculations**: Optimize hot paths

## Success Criteria
- [ ] Students can write first bot in <5 minutes
- [ ] Runs at smooth 60 FPS
- [ ] Works offline from USB drive
- [ ] Attractive and engaging visuals
- [ ] Clear error messages for beginners
- [ ] Handles 32+ student tournament

## Testing Plan
1. **Unit Tests** (manual testing via console)
   - Physics calculations
   - Action resolution
   - State management

2. **Integration Tests**
   - Bot loading and execution
   - Race completion
   - Replay determinism

3. **Performance Tests**
   - FPS monitoring
   - Memory profiling
   - Load time measurement

4. **User Testing**
   - Teacher workflow
   - Student first experience
   - Tournament management

## Deliverables
1. **index.html** - Complete application
2. **examples/** - 4+ example bots
3. **lessons/** - 5 progressive lessons
4. **README.md** - Quick start guide
5. **TeacherGuide.pdf** - Classroom usage guide