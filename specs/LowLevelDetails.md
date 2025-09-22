# SpeedOfThought - Low Level Technical Details

## 1. Core Architecture

### 1.1 Application Structure
```
index.html                 # Single file application
├── HTML Structure         # UI layout
├── CSS (embedded)         # All styling
├── JavaScript (embedded)  # Complete application
    ├── RaceEngine        # Core simulation
    ├── PhysicsEngine     # Movement and collisions
    ├── BotSandbox        # Web Worker management
    ├── Renderer          # Canvas rendering
    ├── UIController      # User interface
    └── FileHandler       # Bot loading system
```

### 1.2 Execution Flow
```javascript
// Main game loop (60 FPS)
function gameLoop() {
  // 1. Collect bot decisions
  const player1Action = await getBotDecision(player1Bot, currentState);
  const player2Action = await getBotDecision(player2Bot, currentState);

  // 2. Execute physics simulation
  const newState = physicsEngine.tick(currentState, [player1Action, player2Action]);

  // 3. Check race conditions
  checkWinConditions(newState);

  // 4. Render frame
  renderer.draw(newState);

  // 5. Schedule next tick
  requestAnimationFrame(gameLoop);
}
```

## 2. Bot Interface Specification

### 2.1 Bot Class Structure
```javascript
// What students write
class PlayerBot {
  constructor() {
    // Optional: Initialize bot state
    // Executes once at race start
    this.memory = {
      strategyMode: 'aggressive',
      fuelThreshold: 30,
      opponentPatterns: []
    };
  }

  decide(state, car) {
    // Required: Make decisions for this tick
    // Executes every tick (~60 times per second)

    // Students call car.executeAction() with actions
    car.executeAction(CAR_ACTIONS.ACCELERATE);

    // Can store data in this.memory between ticks
    this.memory.opponentPatterns.push(state.opponent.speed);
  }
}

// How the framework loads it
const botCode = fileContent; // Student's .js file
const BotClass = eval(`(${botCode})`);
const botInstance = new BotClass();
```

### 2.2 Car Controller API
```javascript
class CarController {
  constructor() {
    this.actions = {
      speed: null,      // Speed control action
      lane: null,       // Lane change action
      special: []       // Special actions (can stack)
    };
  }

  executeAction(action) {
    // Categorize and store action
    const category = this.categorizeAction(action);

    switch(category) {
      case 'speed':
        this.actions.speed = action;  // Last speed action wins
        break;
      case 'lane':
        this.actions.lane = action;   // Last lane action wins
        break;
      case 'special':
        if (!this.actions.special.includes(action)) {
          this.actions.special.push(action);  // Can stack special actions
        }
        break;
    }
  }

  categorizeAction(action) {
    const speedActions = [
      CAR_ACTIONS.ACCELERATE,
      CAR_ACTIONS.SPRINT,
      CAR_ACTIONS.COAST,
      CAR_ACTIONS.BRAKE,
      CAR_ACTIONS.BOOST
    ];

    const laneActions = [
      CAR_ACTIONS.CHANGE_LANE_LEFT,
      CAR_ACTIONS.CHANGE_LANE_RIGHT
    ];

    const specialActions = [
      CAR_ACTIONS.JUMP,
      CAR_ACTIONS.ENTER_PIT
    ];

    if (speedActions.includes(action)) return 'speed';
    if (laneActions.includes(action)) return 'lane';
    if (specialActions.includes(action)) return 'special';
    return 'unknown';
  }

  getExecutionPlan() {
    // Return final action plan for this tick
    return {
      speed: this.actions.speed || CAR_ACTIONS.IDLE,
      lane: this.actions.lane || null,
      special: this.actions.special
    };
  }

  reset() {
    // Clear actions for next tick
    this.actions = {
      speed: null,
      lane: null,
      special: []
    };
  }
}
```

## 3. Complete Action Definitions

### 3.1 CAR_ACTIONS Enumeration
```javascript
const CAR_ACTIONS = Object.freeze({
  // Speed Control Actions (mutually exclusive)
  ACCELERATE: 'ACCELERATE',      // Increase speed by 5 km/h/tick, 1.0 fuel/tick
  SPRINT: 'SPRINT',               // Increase speed by 10 km/h/tick, 2.5 fuel/tick
  COAST: 'COAST',                 // Maintain speed, 0.3 fuel/tick
  BRAKE: 'BRAKE',                 // Decrease speed by 15 km/h/tick, 0.1 fuel/tick
  BOOST: 'BOOST',                 // Max acceleration 20 km/h/tick, uses 1 boost + 3.0 fuel/tick

  // Lane Change Actions (mutually exclusive)
  CHANGE_LANE_LEFT: 'CHANGE_LANE_LEFT',   // Move one lane left over 5 ticks
  CHANGE_LANE_RIGHT: 'CHANGE_LANE_RIGHT', // Move one lane right over 5 ticks

  // Special Actions (can stack)
  JUMP: 'JUMP',                   // Jump for 10 ticks, 5.0 fuel cost
  ENTER_PIT: 'ENTER_PIT',         // Enter pit lane at next opportunity

  // Default Action
  IDLE: 'IDLE'                    // No speed change, 0.5 fuel/tick
});
```

### 3.2 Action Physics Details
```javascript
const ACTION_PHYSICS = {
  ACCELERATE: {
    acceleration: 5,      // km/h per tick
    maxSpeed: 200,        // km/h
    fuelCost: 1.0,        // per tick
    tireWear: 0.001      // per tick
  },
  SPRINT: {
    acceleration: 10,
    maxSpeed: 250,
    fuelCost: 2.5,
    tireWear: 0.003
  },
  COAST: {
    acceleration: 0,
    maxSpeed: null,      // Maintains current speed
    fuelCost: 0.3,
    tireWear: 0.0001
  },
  BRAKE: {
    acceleration: -15,
    maxSpeed: null,
    fuelCost: 0.1,
    tireWear: 0.002
  },
  BOOST: {
    acceleration: 20,
    maxSpeed: 300,
    fuelCost: 3.0,
    boostCost: 1,        // Uses one boost charge
    tireWear: 0.005
  },
  IDLE: {
    acceleration: -2,     // Natural deceleration
    maxSpeed: null,
    fuelCost: 0.5,
    tireWear: 0.0001
  }
};
```

## 4. State Object Specification

### 4.1 Complete State Structure
```javascript
const state = {
  car: {
    // Position Information
    position: 1523.7,           // Meters from start line (float)
    lane: 1.0,                  // Current lane (0.0 to 2.0, can be between lanes)
    lap: 2,                     // Current lap number (1-indexed)
    segment: 76,                // Current track segment (for obstacle detection)

    // Movement Information
    speed: 187.4,               // Current speed in km/h
    acceleration: 5.2,          // Current acceleration in km/h/tick
    heading: 0,                 // Direction in radians (0 = straight)

    // Resources
    fuel: 67.3,                 // Fuel remaining in liters
    maxFuel: 100,               // Maximum fuel capacity
    boosts: 3,                  // Number of boost charges remaining

    // Car Condition
    tireWear: 0.82,             // Tire condition (1.0 = new, 0.0 = worn)
    engineTemp: 78,             // Engine temperature (affects performance)

    // Status Flags
    isJumping: false,           // Currently in the air
    jumpTicksRemaining: 0,      // Ticks until landing
    isDrafting: false,          // Within drafting distance of opponent
    draftEfficiency: 0,         // Fuel savings from drafting (0-0.3)
    isInPitLane: false,         // Currently in pit lane
    canEnterPit: false,         // Pit entry available this tick

    // Action History (last 3 ticks)
    recentActions: [
      'ACCELERATE',
      'SPRINT',
      'SPRINT'
    ]
  },

  opponent: {
    // Relative Position
    distance: -23.4,            // Meters (negative = behind, positive = ahead)
    lane: 0.5,                  // Opponent's current lane
    lap: 2,                     // Opponent's lap

    // Relative Movement
    relativeSpeed: 5.2,         // Speed difference (positive = opponent faster)
    catchTime: 4.5,             // Estimated ticks until positions equal (null if diverging)

    // Opponent State
    speed: 192.6,               // Opponent's absolute speed
    fuel: 45.0,                 // Opponent's fuel (estimated)
    isJumping: false,           // Opponent is jumping
    isInPitLane: false,         // Opponent in pit

    // Pattern Analysis
    recentActions: [            // Last 10 actions (for pattern recognition)
      'SPRINT', 'SPRINT', 'COAST', 'COAST', 'ACCELERATE',
      'SPRINT', 'SPRINT', 'COAST', 'COAST', 'ACCELERATE'
    ],
    averageSpeed: 189.3,        // Average over last 60 ticks
    fuelConsumptionRate: 1.8   // Estimated fuel/tick
  },

  track: {
    // Current Segment
    current: {
      type: 'normal',           // 'normal', 'fuel_zone', 'boost_zone', 'pit_entry'
      grip: 0.95,               // Track grip level (affects acceleration)
      width: 3,                 // Number of lanes
      weather: 'dry'            // 'dry', 'wet' (affects grip)
    },

    // Look Ahead (next 20 segments, ~200 meters)
    ahead: [
      {
        distance: 10,           // Meters to this segment
        type: 'normal',
        obstacles: [],          // Array of obstacles
        items: [],              // Array of items
        grip: 0.95
      },
      {
        distance: 20,
        type: 'obstacle',
        obstacles: [
          { lane: 1, width: 0.8, height: 1.0 }  // Obstacle in lane 1
        ],
        items: [],
        grip: 0.95
      },
      {
        distance: 35,
        type: 'fuel_zone',
        obstacles: [],
        items: [
          { type: 'fuel', amount: 20, lanes: [0, 1, 2] }  // Fuel across all lanes
        ],
        grip: 1.0
      },
      {
        distance: 50,
        type: 'boost_zone',
        obstacles: [],
        items: [
          { type: 'boost_pad', speedBonus: 20, lane: 1 }
        ],
        grip: 1.1               // Boost zones have better grip
      },
      // ... continue for 20 segments
    ],

    // Track Information
    lapDistance: 2000,          // Meters per lap
    totalLaps: 5,               // Total laps in race
    pitLaneEntry: 1850,         // Position of pit lane entry
    pitLaneExit: 1950,          // Position of pit lane exit
    pitLaneSpeedLimit: 80,      // Max speed in pit lane (km/h)

    // Strategic Information
    optimalLine: [              // Optimal lane for next 10 segments
      1, 1, 0, 0, 1, 2, 2, 1, 1, 0
    ],
    fuelStationPositions: [450, 950, 1450],  // Positions of fuel zones
    boostPadPositions: [200, 700, 1200, 1700] // Positions of boost pads
  },

  race: {
    // Timing
    currentTick: 3847,          // Current simulation tick
    ticksPerSecond: 60,         // Simulation rate
    elapsedTime: 64.12,         // Seconds since race start

    // Race Progress
    totalLaps: 5,               // Total laps in race
    currentPosition: 1,         // 1st or 2nd place

    // Win Conditions
    leader: 'player1',          // Who's leading
    leaderAdvantage: 23.4,      // Meters ahead
    estimatedFinishTick: 8500,  // Projected finish tick at current pace

    // Environmental
    temperature: 22,            // Track temperature (Celsius)
    windSpeed: 5,               // Wind speed (km/h)
    windDirection: 90           // Wind direction (degrees)
  }
};
```

## 5. Physics Engine

### 5.1 Movement Calculation
```javascript
class PhysicsEngine {
  calculateMovement(car, action, deltaTime) {
    // Get action physics
    const physics = ACTION_PHYSICS[action.speed];

    // Calculate base acceleration
    let acceleration = physics.acceleration;

    // Apply tire wear modifier
    acceleration *= (0.7 + 0.3 * car.tireWear);

    // Apply track grip modifier
    acceleration *= car.currentSegment.grip;

    // Apply drafting bonus
    if (car.isDrafting) {
      acceleration *= 1.1;  // 10% acceleration bonus
    }

    // Calculate new speed
    let newSpeed = car.speed + (acceleration * deltaTime);

    // Apply speed limits
    newSpeed = Math.max(0, Math.min(newSpeed, physics.maxSpeed || 350));

    // Calculate distance traveled
    const distance = (car.speed + newSpeed) / 2 * deltaTime / 3.6; // Convert km/h to m/s

    return {
      speed: newSpeed,
      distance: distance,
      acceleration: acceleration
    };
  }

  calculateFuelConsumption(action, car, deltaTime) {
    const baseCost = ACTION_PHYSICS[action].fuelCost;

    // Fuel cost modifiers
    let modifier = 1.0;

    // Speed modifier (exponential at high speeds)
    if (car.speed > 200) {
      modifier *= 1 + ((car.speed - 200) / 100) ** 2;
    }

    // Drafting saves fuel
    if (car.isDrafting) {
      modifier *= 0.7;  // 30% fuel savings
    }

    // Worn tires increase fuel consumption
    modifier *= (2 - car.tireWear);

    return baseCost * modifier * deltaTime;
  }
}
```

### 5.2 Collision Detection
```javascript
class CollisionSystem {
  checkCollisions(car1, car2) {
    // Cars occupy space: 5 meters long, 0.8 lanes wide
    const CAR_LENGTH = 5;
    const CAR_WIDTH = 0.8;

    // Check if cars overlap
    const positionDiff = Math.abs(car1.position - car2.position);
    const laneDiff = Math.abs(car1.lane - car2.lane);

    if (positionDiff < CAR_LENGTH && laneDiff < CAR_WIDTH) {
      return {
        collision: true,
        type: 'car',
        blockingCar: car1.position > car2.position ? 'car1' : 'car2',
        blockedCar: car1.position > car2.position ? 'car2' : 'car1'
      };
    }

    return { collision: false };
  }

  resolveCollision(collision, car1State, car2State) {
    if (collision.blockingCar === 'car1') {
      // Car2 is blocked, reduce its speed
      car2State.speed = Math.min(car2State.speed, car1State.speed * 0.9);
      car2State.blockedTicks = 5;  // Blocked for 5 ticks
    } else {
      car1State.speed = Math.min(car1State.speed, car2State.speed * 0.9);
      car1State.blockedTicks = 5;
    }
  }
}
```

### 5.3 Lane Change Mechanics
```javascript
class LaneChangeSystem {
  initiateLaneChange(car, direction) {
    // Lane changes take 5 ticks to complete
    const LANE_CHANGE_DURATION = 5;
    const targetLane = direction === 'LEFT'
      ? Math.max(0, Math.floor(car.lane) - 1)
      : Math.min(2, Math.ceil(car.lane) + 1);

    // Check if lane change is valid
    if (car.isJumping) return null;  // Can't change lanes while jumping
    if (car.lane === targetLane) return null;  // Already in target lane

    return {
      startLane: car.lane,
      targetLane: targetLane,
      ticksRemaining: LANE_CHANGE_DURATION,
      direction: direction
    };
  }

  updateLaneChange(laneChange, deltaTime) {
    laneChange.ticksRemaining -= deltaTime;

    // Smooth interpolation
    const progress = 1 - (laneChange.ticksRemaining / 5);
    const newLane = laneChange.startLane +
      (laneChange.targetLane - laneChange.startLane) *
      this.easeInOut(progress);

    return {
      lane: newLane,
      complete: laneChange.ticksRemaining <= 0
    };
  }

  easeInOut(t) {
    // Smooth curve for lane changes
    return t < 0.5
      ? 2 * t * t
      : -1 + (4 - 2 * t) * t;
  }
}
```

## 6. Sandbox Implementation

### 6.1 Web Worker Setup
```javascript
// Main thread
class BotSandbox {
  constructor() {
    this.worker = null;
    this.timeout = 1; // 1ms timeout
  }

  async loadBot(botCode) {
    // Create worker with bot code
    const workerCode = `
      let botInstance = null;

      // Disable dangerous globals
      const restrictedGlobals = [
        'fetch', 'XMLHttpRequest', 'WebSocket',
        'localStorage', 'sessionStorage', 'indexedDB'
      ];
      restrictedGlobals.forEach(g => { self[g] = undefined; });

      // Load bot
      self.onmessage = function(e) {
        if (e.data.type === 'INIT') {
          try {
            const BotClass = eval('(' + e.data.botCode + ')');
            botInstance = new BotClass();
            self.postMessage({ type: 'READY' });
          } catch (error) {
            self.postMessage({ type: 'ERROR', error: error.message });
          }
        } else if (e.data.type === 'DECIDE') {
          try {
            const car = new CarController();
            botInstance.decide(e.data.state, car);
            self.postMessage({
              type: 'DECISION',
              actions: car.getExecutionPlan()
            });
          } catch (error) {
            self.postMessage({ type: 'ERROR', error: error.message });
          }
        }
      };

      ${CarController.toString()}
      const CAR_ACTIONS = ${JSON.stringify(CAR_ACTIONS)};
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerURL = URL.createObjectURL(blob);
    this.worker = new Worker(workerURL);

    // Initialize bot
    return new Promise((resolve, reject) => {
      this.worker.onmessage = (e) => {
        if (e.data.type === 'READY') resolve(true);
        if (e.data.type === 'ERROR') reject(e.data.error);
      };

      this.worker.postMessage({ type: 'INIT', botCode: botCode });
    });
  }

  async getDecision(state) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Bot timeout'));
      }, this.timeout);

      this.worker.onmessage = (e) => {
        clearTimeout(timeoutId);
        if (e.data.type === 'DECISION') {
          resolve(e.data.actions);
        } else if (e.data.type === 'ERROR') {
          reject(e.data.error);
        }
      };

      // Deep clone state to prevent mutation
      const safeState = JSON.parse(JSON.stringify(state));
      this.worker.postMessage({ type: 'DECIDE', state: safeState });
    });
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
```

## 7. Rendering System

### 7.1 Canvas Setup
```javascript
class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    // Rendering settings
    this.trackWidth = 200;  // Visual width of track
    this.pixelsPerMeter = 2;  // Scale factor
  }

  draw(gameState) {
    // Clear canvas
    this.ctx.fillStyle = '#2a2a2a';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw track
    this.drawTrack(gameState.track);

    // Draw track features
    this.drawObstacles(gameState.track.obstacles);
    this.drawFuelZones(gameState.track.fuelZones);
    this.drawBoostPads(gameState.track.boostPads);

    // Draw cars
    this.drawCar(gameState.player1, '#ff4444');
    this.drawCar(gameState.player2, '#4444ff');

    // Draw UI elements
    this.drawHUD(gameState);

    // Draw effects
    this.drawEffects(gameState.effects);
  }

  drawCar(carState, color) {
    const x = this.getScreenX(carState.lane);
    const y = this.getScreenY(carState.position);

    // Car body
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x - 15, y - 25, 30, 50);

    // Jumping animation
    if (carState.isJumping) {
      const jumpHeight = Math.sin(carState.jumpProgress * Math.PI) * 20;
      this.ctx.translate(0, -jumpHeight);
    }

    // Speed trails
    if (carState.speed > 200) {
      this.ctx.globalAlpha = 0.3;
      this.ctx.fillStyle = color;
      for (let i = 1; i <= 3; i++) {
        this.ctx.fillRect(x - 10, y + 25 + i * 10, 20, 5);
      }
      this.ctx.globalAlpha = 1.0;
    }

    // Drafting indicator
    if (carState.isDrafting) {
      this.ctx.strokeStyle = '#00ff00';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x - 20, y - 30, 40, 60);
    }
  }
}
```

## 8. Track Generation

### 8.1 Track Generator
```javascript
class TrackGenerator {
  generate(seed, difficulty) {
    // Use seed for deterministic generation
    const rng = new SeededRandom(seed);

    const trackLength = 2000 + rng.next() * 1000;  // 2000-3000 meters
    const segments = Math.floor(trackLength / 10);  // 10 meter segments

    const track = {
      segments: [],
      lapDistance: trackLength,
      lanes: 3,
      seed: seed
    };

    // Generate segments
    for (let i = 0; i < segments; i++) {
      const segment = this.generateSegment(i, rng, difficulty);
      track.segments.push(segment);
    }

    // Validate track is completable
    this.validateTrack(track);

    return track;
  }

  generateSegment(index, rng, difficulty) {
    const segment = {
      position: index * 10,
      type: 'normal',
      obstacles: [],
      items: [],
      grip: 0.9 + rng.next() * 0.2
    };

    // Probability based on difficulty
    const obstacleChance = difficulty * 0.1;
    const fuelChance = 0.05;
    const boostChance = 0.03;

    if (rng.next() < obstacleChance) {
      segment.type = 'obstacle';
      segment.obstacles.push({
        lane: Math.floor(rng.next() * 3),
        width: 0.8,
        jumpable: true
      });
    } else if (rng.next() < fuelChance) {
      segment.type = 'fuel_zone';
      segment.items.push({
        type: 'fuel',
        amount: 20 + rng.next() * 10,
        lanes: [0, 1, 2]  // Available in all lanes
      });
    } else if (rng.next() < boostChance) {
      segment.type = 'boost_zone';
      segment.items.push({
        type: 'boost_pad',
        speedBonus: 20,
        lane: Math.floor(rng.next() * 3)
      });
    }

    return segment;
  }

  validateTrack(track) {
    // Ensure track has enough fuel stations
    const fuelSegments = track.segments.filter(s => s.type === 'fuel_zone');
    if (fuelSegments.length < 3) {
      // Add fuel zones if needed
      this.addFuelZones(track, 3 - fuelSegments.length);
    }

    // Ensure no impossible obstacle sequences
    this.validateObstacles(track);
  }
}

class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }

  next() {
    // Simple deterministic pseudo-random
    this.seed = (this.seed * 1664525 + 1013904223) % 2147483647;
    return this.seed / 2147483647;
  }
}
```

## 9. File Loading System

### 9.1 Bot Loader
```javascript
class BotLoader {
  constructor() {
    this.loadedBots = new Map();
  }

  setupFileHandlers() {
    // Drag and drop
    const dropZone = document.getElementById('drop-zone');

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');

      const files = Array.from(e.dataTransfer.files);
      for (const file of files) {
        if (file.name.endsWith('.js')) {
          await this.loadBotFile(file);
        }
      }
    });

    // File input
    const fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      for (const file of files) {
        await this.loadBotFile(file);
      }
    });
  }

  async loadBotFile(file) {
    try {
      const code = await this.readFile(file);
      const validation = this.validateBotCode(code);

      if (validation.valid) {
        this.loadedBots.set(file.name, {
          name: file.name.replace('.js', ''),
          code: code,
          file: file
        });

        this.displayLoadedBot(file.name);
      } else {
        this.showError(validation.error);
      }
    } catch (error) {
      this.showError(`Failed to load ${file.name}: ${error.message}`);
    }
  }

  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  validateBotCode(code) {
    // Check for required class structure
    if (!code.includes('class') || !code.includes('PlayerBot')) {
      return {
        valid: false,
        error: 'Bot must define a class named PlayerBot'
      };
    }

    if (!code.includes('decide')) {
      return {
        valid: false,
        error: 'PlayerBot must have a decide(state, car) method'
      };
    }

    // Check for forbidden operations
    const forbidden = [
      'fetch', 'XMLHttpRequest', 'WebSocket',
      'require', 'import', 'eval'
    ];

    for (const word of forbidden) {
      if (code.includes(word)) {
        return {
          valid: false,
          error: `Bot cannot use forbidden operation: ${word}`
        };
      }
    }

    return { valid: true };
  }
}
```

## 10. Performance Optimizations

### 10.1 State Cloning Optimization
```javascript
// Efficient deep cloning for state
class StateCloner {
  constructor() {
    // Pre-compile state structure for fast cloning
    this.stateTemplate = this.compileTemplate();
  }

  cloneState(state) {
    // Use structured cloning when available (Chrome 98+)
    if (typeof structuredClone === 'function') {
      return structuredClone(state);
    }

    // Fallback to optimized JSON clone
    return JSON.parse(JSON.stringify(state));
  }

  // Alternative: Manual optimized cloning
  fastClone(state) {
    return {
      car: { ...state.car },
      opponent: { ...state.opponent },
      track: {
        ...state.track,
        ahead: [...state.track.ahead]  // Shallow copy array
      },
      race: { ...state.race }
    };
  }
}
```

### 10.2 Rendering Optimization
```javascript
class OptimizedRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', {
      alpha: false,  // No transparency = faster
      desynchronized: true  // Better performance
    });

    // Pre-render static elements
    this.trackCanvas = this.prerenderTrack();
  }

  prerenderTrack() {
    // Create off-screen canvas for track
    const trackCanvas = document.createElement('canvas');
    trackCanvas.width = this.canvas.width;
    trackCanvas.height = this.canvas.height;
    const ctx = trackCanvas.getContext('2d');

    // Draw track once
    this.drawStaticTrack(ctx);

    return trackCanvas;
  }

  draw(gameState) {
    // Copy pre-rendered track (very fast)
    this.ctx.drawImage(this.trackCanvas, 0, 0);

    // Only draw dynamic elements
    this.drawCars(gameState);
    this.drawEffects(gameState);
    this.drawHUD(gameState);
  }
}
```

## 11. Debug and Development Tools

### 11.1 Debug Mode
```javascript
class DebugMode {
  constructor() {
    this.enabled = false;
    this.stepping = false;
    this.currentTick = 0;
  }

  enableDebug() {
    this.enabled = true;

    // Add debug overlay
    const overlay = document.createElement('div');
    overlay.id = 'debug-overlay';
    overlay.innerHTML = `
      <div>Tick: <span id="debug-tick">0</span></div>
      <div>FPS: <span id="debug-fps">0</span></div>
      <button id="debug-step">Step</button>
      <button id="debug-play">Play</button>
      <div id="debug-state"></div>
    `;
    document.body.appendChild(overlay);
  }

  logTick(state, actions) {
    if (!this.enabled) return;

    console.group(`Tick ${this.currentTick}`);
    console.log('State:', state);
    console.log('Player 1 Actions:', actions.player1);
    console.log('Player 2 Actions:', actions.player2);
    console.groupEnd();

    this.updateDebugOverlay(state);
  }

  stepThrough() {
    this.stepping = true;
    return new Promise(resolve => {
      document.getElementById('debug-step').onclick = () => {
        resolve();
      };
    });
  }
}
```

## 12. Tournament System

### 12.1 Tournament Manager
```javascript
class TournamentManager {
  constructor() {
    this.participants = [];
    this.bracket = null;
    this.results = [];
  }

  createBracket(botFiles) {
    const n = botFiles.length;

    if (n <= 8) {
      // Single elimination
      return this.singleElimination(botFiles);
    } else {
      // Pool play + elimination
      return this.poolPlay(botFiles);
    }
  }

  async runMatch(bot1, bot2, trackSeed) {
    // Load bots
    const sandbox1 = new BotSandbox();
    const sandbox2 = new BotSandbox();

    await sandbox1.loadBot(bot1.code);
    await sandbox2.loadBot(bot2.code);

    // Generate track
    const track = new TrackGenerator().generate(trackSeed, 'medium');

    // Run race
    const engine = new RaceEngine(track, sandbox1, sandbox2);
    const result = await engine.runRace();

    // Clean up
    sandbox1.terminate();
    sandbox2.terminate();

    return result;
  }

  exportResults() {
    // Generate CSV for grading
    const csv = [
      'Student,Opponent,Result,LapTime,FuelEfficiency,Crashes',
      ...this.results.map(r =>
        `${r.student},${r.opponent},${r.result},${r.lapTime},${r.fuelEff},${r.crashes}`
      )
    ].join('\n');

    return csv;
  }
}