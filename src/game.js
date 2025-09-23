// ====================================
// CONSTANTS AND CONFIGURATION
// ====================================

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

// ====================================
// CAR CONTROLLER
// ====================================

class CarController {
    constructor() {
        this.actions = {
            speed: null,
            lane: null,
            special: []
        };
    }

    executeAction(action) {
        const category = this.categorizeAction(action);

        switch(category) {
            case 'speed':
                this.actions.speed = action;
                break;
            case 'lane':
                this.actions.lane = action;
                break;
            case 'special':
                if (!this.actions.special.includes(action)) {
                    this.actions.special.push(action);
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
            CAR_ACTIONS.BOOST,
            CAR_ACTIONS.IDLE
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
        return {
            speed: this.actions.speed || CAR_ACTIONS.IDLE,
            lane: this.actions.lane || null,
            special: this.actions.special
        };
    }

    reset() {
        this.actions = {
            speed: null,
            lane: null,
            special: []
        };
    }
}

// ====================================
// TRACK GENERATOR
// ====================================

class TrackGenerator {
    constructor() {
        this.trackLength = 2000; // meters
        this.lanes = 3;
        this.fuelStationCount = 1; // Default number of fuel stations (configurable via UI)
    }

    generate(seed = Math.random(), difficulty = 'medium') {
        const rng = new SeededRandom(seed);
        const segments = Math.floor(this.trackLength / 10); // 10 meter segments

        const track = {
            segments: [],
            lapDistance: this.trackLength,
            lanes: this.lanes,
            seed: seed,
            fuelStations: [],
            boostPads: [],
            obstacles: [],
            pitLaneEntry: 1850,
            pitLaneExit: 1950
        };

        // Use the configured number of fuel stations
        const actualFuelCount = this.fuelStationCount;

        // Place fuel stations evenly across the track
        const fuelInterval = Math.floor(segments / (actualFuelCount + 1));
        const fuelPositions = [];
        for (let i = 1; i <= actualFuelCount; i++) {
            // Randomize position a bit for variety
            const basePos = i * fuelInterval;
            const variation = Math.floor((rng.next() - 0.5) * 20); // +/- 10 segments
            const finalPos = Math.max(10, Math.min(segments - 10, basePos + variation));
            fuelPositions.push(finalPos);
        }

        // Generate segments
        for (let i = 0; i < segments; i++) {
            const segment = {
                position: i * 10,
                type: 'normal',
                obstacles: [],
                items: [],
                grip: 0.9 + rng.next() * 0.2
            };

            // Check if this should be a fuel station (make stations 3 segments long)
            if (fuelPositions.some(pos => i >= pos && i < pos + 3)) {
                segment.type = 'fuel_zone';
                // Only place fuel in lanes 1 and 2 (middle and outer lanes) as requested
                const lanes = [];

                // Randomly decide which of lanes 1 and 2 get fuel
                if (rng.next() > 0.5) {
                    lanes.push(1); // Middle lane
                }
                if (rng.next() > 0.5) {
                    lanes.push(2); // Outer lane
                }

                // Make sure at least one lane has fuel (either 1 or 2)
                if (lanes.length === 0) {
                    lanes.push(rng.next() > 0.5 ? 1 : 2);
                }

                segment.items.push({
                    type: 'fuel',
                    amount: 20 + rng.next() * 10,
                    lanes: lanes
                });
                
                // Only add to fuelStations array once per station (at first segment)
                if (fuelPositions.includes(i)) {
                    track.fuelStations.push(i * 10);
                }
            } else {
                // Otherwise, generate other features
                const obstacleChance = difficulty === 'none' ? 0 :
                                      difficulty === 'easy' ? 0.02 :
                                      difficulty === 'hard' ? 0.08 : 0.05;
                const boostChance = 0.02;
                const roll = rng.next();

                if (roll < obstacleChance && difficulty !== 'none') {
                    segment.type = 'obstacle';
                    segment.obstacles.push({
                        lane: Math.floor(rng.next() * 3),
                        width: 0.8,
                        jumpable: true
                    });
                    track.obstacles.push({
                        position: i * 10,
                        lanes: [segment.obstacles[0].lane]
                    });
                } else if (roll < obstacleChance + boostChance) {
                    segment.type = 'boost_zone';
                    segment.items.push({
                        type: 'boost_pad',
                        speedBonus: 20,
                        lane: Math.floor(rng.next() * 3)
                    });
                    track.boostPads.push(i * 10);
                }
            }

            track.segments.push(segment);
        }

        return track;
    }
}

class SeededRandom {
    constructor(seed) {
        this.seed = seed * 2147483647;
    }

    next() {
        this.seed = (this.seed * 1664525 + 1013904223) % 2147483647;
        return this.seed / 2147483647;
    }
}

// ====================================
// PHYSICS ENGINE
// ====================================

class PhysicsEngine {
    constructor() {
        this.CAR_LENGTH = 5;
        this.CAR_WIDTH = 0.8;
        this.DRAG_COEFFICIENT = 0.3;
        this.ROLLING_RESISTANCE = 0.015;
        this.AIR_DENSITY = 1.2;
        this.CAR_MASS = 1000; // kg
        this.DRAFT_DISTANCE_MAX = 25; // meters
        this.DRAFT_DISTANCE_MIN = 5;  // meters
        this.tickCount = 0; // Track physics ticks for cooldowns
    }

    tick(gameState, actions) {
        const newState = JSON.parse(JSON.stringify(gameState));
        const deltaTime = 1/60; // 60 ticks per second

        // Increment physics tick counter
        this.tickCount++;

        // Process each car with REAL physics
        ['player1', 'player2'].forEach((player, index) => {
            const car = newState[player];
            const action = actions[index];
            const otherPlayer = player === 'player1' ? 'player2' : 'player1';
            const opponent = newState[otherPlayer];

            // Calculate if we're drafting BEFORE applying actions
            car.isDrafting = this.calculateDrafting(car, opponent);

            // Reset refueling state at start of each tick
            car.isRefueling = false;

            // Handle lane changes
            this.handleLaneChange(car, action);

            // Handle special actions (jump, pit)
            this.handleSpecialActions(car, action);

            // Apply action to get desired engine force
            const engineForce = this.calculateEngineForce(car, action);

            // Calculate all forces
            const dragForce = this.calculateDrag(car);
            const rollingResistance = this.calculateRollingResistance(car);

            // When fuel is empty, add extra deceleration force
            let fuelEmptyForce = 0;
            if (car.fuel <= 0) {
                fuelEmptyForce = 500; // Extra resistance when engine dies
            }

            // Net force and acceleration (F = ma, so a = F/m)
            const netForce = engineForce - dragForce - rollingResistance - fuelEmptyForce;
            const acceleration = netForce / this.CAR_MASS;

            // Update velocity (v = v0 + at)
            car.speed += acceleration * deltaTime * 3.6; // convert m/s to km/h

            // Cars can't go backwards
            car.speed = Math.max(0, car.speed);

            // When fuel is empty and speed is very low, stop completely
            if (car.fuel <= 0 && car.speed < 10) {
                car.speed = 0;
                car.stopped = true;
            }

            // Update position based on speed
            this.updatePosition(car, newState.track, deltaTime);

            // Check collisions BEFORE consuming fuel (so refueling happens first)
            this.checkTrackCollisions(car, newState.track);

            // Consume fuel based on ACTUAL engine output (AFTER refueling)
            this.consumeFuel(car, action, engineForce, deltaTime);
        });

        // Check car-to-car collisions
        this.checkCarCollisions(newState.player1, newState.player2);

        // Update race info
        this.updateRaceInfo(newState);

        return newState;
    }

    calculateEngineForce(car, action) {
        // No fuel = no engine force
        if (car.fuel <= 0) {
            car.engineOff = true;
            return 0;
        }
        car.engineOff = false;

        const baseForce = {
            'ACCELERATE': 3000,    // Newtons
            'SPRINT': 5000,
            'COAST': 500,          // Just enough to maintain
            'BRAKE': -4000,
            'BOOST': 7000,
            'IDLE': 0
        };

        return baseForce[action.speed] || 0;
    }

    calculateDrag(car) {
        // Drag force = 0.5 * Cd * A * ρ * v²
        const speedMs = car.speed / 3.6; // Convert km/h to m/s
        const frontalArea = 2.0; // m²

        let dragCoeff = this.DRAG_COEFFICIENT;

        // Drafting reduces drag proportionally to effectiveness
        // At 100% effectiveness (5m behind): 30% drag reduction
        // At 0% effectiveness (25m behind): 0% drag reduction
        if (car.isDrafting) {
            const maxDragReduction = 0.3; // Maximum 30% reduction
            const dragReduction = maxDragReduction * car.draftEffectiveness;
            dragCoeff *= (1 - dragReduction);
        }

        return 0.5 * dragCoeff * frontalArea * this.AIR_DENSITY * speedMs * speedMs;
    }

    calculateRollingResistance(car) {
        // Rolling resistance = Crr * m * g
        const gravity = 9.81;
        let resistance = this.ROLLING_RESISTANCE * this.CAR_MASS * gravity * car.tireWear;

        // When engine is off, resistance increases significantly
        if (car.engineOff || car.fuel <= 0) {
            resistance *= 3.0; // Triple resistance when engine off (no power steering/brakes)
        }

        return resistance;
    }

    calculateDrafting(car, opponent) {
        // Check if we're behind the opponent and close enough
        const distance = opponent.position - car.position;
        const laneDiff = Math.abs(opponent.lane - car.lane);

        // Must be behind, in draft zone, and in similar lane
        if (distance > this.DRAFT_DISTANCE_MIN &&
            distance < this.DRAFT_DISTANCE_MAX &&
            laneDiff < 1) {

            // Calculate draft effectiveness (closer = stronger benefit)
            // At 5m: 100% effectiveness, at 25m: 0% effectiveness
            const draftRange = this.DRAFT_DISTANCE_MAX - this.DRAFT_DISTANCE_MIN;
            const draftEffectiveness = 1.0 - ((distance - this.DRAFT_DISTANCE_MIN) / draftRange);

            car.draftEffectiveness = draftEffectiveness;
            return true;
        }

        car.draftEffectiveness = 0;
        return false;
    }

    consumeFuel(car, action, engineForce, deltaTime) {
        if (car.fuel <= 0) {
            car.fuel = 0;
            car.fuelConsumptionRate = 0; // Track for debug
            return;
        }

        // Realistic fuel consumption rates (per tick, 60 ticks per second)
        // Target: 100L tank should last ~2-3 laps with mixed driving
        const baseFuelRates = {
            'ACCELERATE': 0.025,   // 1.5 L/sec = 90 L/min - can run ~66 seconds
            'SPRINT': 0.045,       // 2.7 L/sec = 162 L/min - can run ~37 seconds
            'COAST': 0.008,        // 0.48 L/sec = 29 L/min - can run ~200 seconds
            'BRAKE': 0.003,        // 0.18 L/sec = 11 L/min - minimal consumption
            'BOOST': 0.070,        // 4.2 L/sec = 252 L/min - can run ~24 seconds
            'IDLE': 0.005          // 0.3 L/sec = 18 L/min - very low consumption
        };

        let fuelRate = baseFuelRates[action.speed] || 0.03;

        // High speed increases fuel consumption (but not as dramatically)
        if (car.speed > 200) {
            const speedFactor = 1 + ((car.speed - 200) / 100) * 0.3; // Only 30% increase per 100km/h over 200
            fuelRate *= speedFactor;
        }

        // Drafting saves fuel proportionally to effectiveness
        if (car.isDrafting) {
            const maxFuelSavings = 0.3; // Maximum 30% fuel savings
            const fuelSavings = maxFuelSavings * car.draftEffectiveness;
            fuelRate *= (1 - fuelSavings);
        }

        // Track consumption rate for debug (convert to L/sec)
        car.fuelConsumptionRate = fuelRate * 60;

        // Apply fuel consumption (already scaled by deltaTime which is 1/60)
        car.fuel -= fuelRate;
        car.fuel = Math.max(0, car.fuel);
    }

    handleLaneChange(car, action) {
        if (action.lane === CAR_ACTIONS.CHANGE_LANE_LEFT) {
            if (car.lane > 0 && !car.changingLane) {
                car.changingLane = true;
                car.targetLane = car.lane - 1;
                car.laneChangeProgress = 0;
            }
        } else if (action.lane === CAR_ACTIONS.CHANGE_LANE_RIGHT) {
            if (car.lane < 2 && !car.changingLane) {
                car.changingLane = true;
                car.targetLane = car.lane + 1;
                car.laneChangeProgress = 0;
            }
        }

        // Update lane change progress
        if (car.changingLane) {
            car.laneChangeProgress += 0.2; // 5 ticks to complete
            if (car.laneChangeProgress >= 1) {
                car.lane = car.targetLane;
                car.changingLane = false;
                car.displayLane = car.lane;
            } else {
                // Smooth interpolation for display
                car.displayLane = car.lane + (car.targetLane - car.lane) * car.laneChangeProgress;
            }
        } else {
            car.displayLane = car.lane;
        }
    }

    handleSpecialActions(car, action) {
        // Handle jumping
        if (action.special && action.special.includes(CAR_ACTIONS.JUMP)) {
            if (!car.isJumping && car.fuel >= 5) {
                car.isJumping = true;
                car.jumpTicksRemaining = 10;
                car.fuel -= 5;
            }
        }

        // Update jump state
        if (car.isJumping) {
            car.jumpTicksRemaining--;
            if (car.jumpTicksRemaining <= 0) {
                car.isJumping = false;
            }
        }

        // Handle pit entry
        if (action.special && action.special.includes(CAR_ACTIONS.ENTER_PIT)) {
            // This would need track position checking
            // Implementation depends on track layout
        }
    }

    updatePosition(car, track, deltaTime) {
        // Update position based on speed and time
        const distancePerSecond = car.speed / 3.6; // Convert km/h to m/s

        // Inner lane is shorter! Lane 0 = 95% distance, Lane 1 = 100%, Lane 2 = 105%
        const laneDistanceMultiplier = 1.0 + (car.lane - 1) * 0.05;
        const effectiveDistance = distancePerSecond * deltaTime / laneDistanceMultiplier;

        car.position += effectiveDistance;

        // Check for lap completion
        if (car.position >= track.lapDistance) {
            car.position -= track.lapDistance;
            car.lap++;
            
            // Clear old obstacle and boost pad tracking from previous laps to prevent memory buildup
            // Keep only entries from the current lap (which will be empty since we just started it)
            if (car.hitObstacles) {
                car.hitObstacles = car.hitObstacles.filter(id => id.startsWith(`${car.lap}_`));
            }
            if (car.usedBoostPads) {
                car.usedBoostPads = car.usedBoostPads.filter(id => id.startsWith(`${car.lap}_`));
            }
        }

        // Update lane change
        if (car.changingLane) {
            car.laneChangeProgress += 0.2; // 5 ticks to complete
            if (car.laneChangeProgress >= 1) {
                car.lane = car.targetLane;
                car.changingLane = false;
            } else {
                // Smooth interpolation
                car.displayLane = car.lane + (car.targetLane - car.lane) * car.laneChangeProgress;
            }
        } else {
            car.displayLane = car.lane;
        }

        // Update jumping
        if (car.isJumping) {
            car.jumpTicksRemaining--;
            if (car.jumpTicksRemaining <= 0) {
                car.isJumping = false;
            }
        }
    }

    checkTrackCollisions(car, track) {
        // Check for obstacles
        const segmentIndex = Math.floor(car.position / 10);
        if (segmentIndex < track.segments.length) {
            const segment = track.segments[segmentIndex];

            // Handle obstacles - REAL collision physics
            if (segment.obstacles.length > 0 && !car.isJumping) {
                segment.obstacles.forEach((obstacle, index) => {
                    if (Math.abs(car.lane - obstacle.lane) < 0.5) {
                        // Check if we've already hit this obstacle (include lap number)
                        if (!car.hitObstacles) car.hitObstacles = [];
                        const obstacleId = `${car.lap}_${segmentIndex}_${index}_${obstacle.lane}`; // Include lap number

                        // Check collision cooldown to prevent missing consecutive obstacles
                        const canCollide = !car.lastCollisionTime ||
                                         (this.tickCount - car.lastCollisionTime) > 5; // 5 tick cooldown

                        if (!car.hitObstacles.includes(obstacleId) && canCollide) {
                            // COLLISION! Car hits obstacle
                            car.speed *= 0.3; // Massive speed reduction
                            car.fuel -= 5; // Damage penalty

                            // Car is temporarily stunned
                            car.collisionStun = 30; // Stunned for 30 ticks (0.5 seconds)

                            // Start collision animation
                            car.collisionAnimation = 20; // Animation frames

                            // Mark obstacle as hit (car has crashed through it)
                            car.hitObstacles.push(obstacleId);
                            car.lastCollisionTime = this.tickCount;

                            // Clear old hit obstacles to prevent memory buildup
                            if (car.hitObstacles.length > 20) {
                                car.hitObstacles = car.hitObstacles.slice(-10);
                            }

                            // No lane change - just keep going straight
                            console.log(`CRASH! Car hit obstacle but keeps lane ${car.lane}`);
                        }
                    }
                });
            }

            // Check for fuel zones - continuous refueling while in zone
            if (segment.type === 'fuel_zone' && segment.items) {
                segment.items.forEach(item => {
                    if (item.type === 'fuel') {
                        // Check if car is in a lane that has fuel
                        if (item.lanes && item.lanes.includes(Math.floor(car.lane))) {
                            const refuelRate = 1.2; // Increased rate: 72 liters/second (was 0.8)
                            const fuelBefore = car.fuel;
                            car.fuel = Math.min(100, car.fuel + refuelRate);
                            car.isRefueling = true; // Track refueling state

                            if (car.fuel > fuelBefore) {
                                console.log(`Refueling: ${fuelBefore.toFixed(1)} -> ${car.fuel.toFixed(1)}`);
                            }
                        }
                    }
                });
            } else {
                car.isRefueling = false;
            }

            // Check for boost pads - instant speed boost! (YELLOW ZONES)
            if (segment.type === 'boost_zone') {
                segment.items.forEach((item, itemIndex) => {
                    if (item.type === 'boost_pad' && Math.abs(car.lane - item.lane) < 0.5) {
                        // Include lap number in ID so boost pads work every lap
                        const padId = `${car.lap}_${segmentIndex}_${itemIndex}_${item.lane}`;
                        if (!car.usedBoostPads) car.usedBoostPads = [];

                        // Add cooldown check like obstacles
                        const canBoost = !car.lastBoostTime ||
                                        (this.tickCount - car.lastBoostTime) > 5; // 5 tick cooldown

                        if (!car.usedBoostPads.includes(padId) && canBoost) {
                            // Instant 20 km/h speed boost!
                            car.speed = Math.min(300, car.speed + item.speedBonus);
                            car.usedBoostPads.push(padId);
                            car.lastBoostTime = this.tickCount;

                            // Clear old boost pad memory
                            if (car.usedBoostPads.length > 20) {
                                car.usedBoostPads = car.usedBoostPads.slice(-10);
                            }

                            console.log(`Car hit boost pad! Speed: ${car.speed.toFixed(0)} km/h`);
                        }
                    }
                });
            }
        }

        // Handle collision stun
        if (car.collisionStun > 0) {
            car.collisionStun--;
            // Can't accelerate while stunned
            if (car.speed > 50) {
                car.speed -= 2; // Gradual slowdown while stunned
            }
        }

        // If car has stopped due to no fuel, it stays stopped
        if (car.stopped && car.fuel <= 0) {
            car.speed = 0;
        }
    }

    checkCarCollisions(car1, car2) {
        const distance = Math.abs(car1.position - car2.position);
        const laneDiff = Math.abs(car1.lane - car2.lane);

        if (distance < this.CAR_LENGTH && laneDiff < this.CAR_WIDTH) {
            // Cars are colliding
            if (car1.position > car2.position) {
                // Car1 is ahead, car2 gets blocked
                car2.speed = Math.min(car2.speed, car1.speed * 0.9);
            } else {
                car1.speed = Math.min(car1.speed, car2.speed * 0.9);
            }
        }

        // Check for drafting
        if (distance < 20 && distance > 5 && laneDiff < 1) {
            if (car1.position < car2.position) {
                car1.isDrafting = true;
            } else {
                car2.isDrafting = true;
            }
        } else {
            car1.isDrafting = false;
            car2.isDrafting = false;
        }
    }

    updateRaceInfo(state) {
        // Update positions
        const p1Progress = state.player1.lap * state.track.lapDistance + state.player1.position;
        const p2Progress = state.player2.lap * state.track.lapDistance + state.player2.position;

        if (p1Progress > p2Progress) {
            state.player1.racePosition = 1;
            state.player2.racePosition = 2;
        } else {
            state.player1.racePosition = 2;
            state.player2.racePosition = 1;
        }

        // Calculate relative distance including lap differences
        const lapDifference = state.player2.lap - state.player1.lap;
        const lapDistance = lapDifference * state.track.lapDistance;

        // Total distance between cars (positive = opponent ahead)
        state.player1.opponentDistance = lapDistance + (state.player2.position - state.player1.position);
        state.player2.opponentDistance = -state.player1.opponentDistance;
    }
}

// ====================================
// RENDERER
// ====================================

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        // Visual settings
        this.trackCenterY = this.height / 2;
        this.trackRadius = 180;
        this.laneWidth = 40;

        // Animation states
        this.animationFrame = 0;
    }

    draw(gameState, totalLaps = 5) {
        // Store totalLaps for use in drawCar
        this.totalLaps = totalLaps;

        // Clear canvas
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw track
        this.drawTrack(gameState.track);

        // Draw track features
        this.drawTrackFeatures(gameState);

        // Draw cars
        this.drawCar(gameState.player1, '#ff4444', 'P1');
        this.drawCar(gameState.player2, '#4444ff', 'P2');

        // Draw effects
        this.drawEffects(gameState);

        // Update animation frame
        this.animationFrame++;
    }

    drawTrack(track) {
        const ctx = this.ctx;

        // Draw grass
        ctx.fillStyle = '#1a4d1a';
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw outer track edge
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 5;
        this.drawOval(this.trackRadius + this.laneWidth * 1.5);

        // Draw inner track edge
        this.drawOval(this.trackRadius - this.laneWidth * 1.5);

        // Draw track surface
        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        this.addOvalPath(this.trackRadius + this.laneWidth * 1.5);
        this.addOvalPath(this.trackRadius - this.laneWidth * 1.5, true);
        ctx.fill();

        // Draw lane lines
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.setLineDash([20, 10]);

        this.drawOval(this.trackRadius - this.laneWidth * 0.5);
        this.drawOval(this.trackRadius + this.laneWidth * 0.5);

        ctx.setLineDash([]);

        // Draw start/finish line
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.width / 2, this.trackCenterY - this.trackRadius - this.laneWidth * 1.5);
        ctx.lineTo(this.width / 2, this.trackCenterY - this.trackRadius + this.laneWidth * 1.5);
        ctx.stroke();
    }

    drawOval(radius) {
        const ctx = this.ctx;
        const centerX = this.width / 2;
        const centerY = this.trackCenterY;
        const stretchX = 1.8;

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radius * stretchX, radius, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    addOvalPath(radius, reverse = false) {
        const ctx = this.ctx;
        const centerX = this.width / 2;
        const centerY = this.trackCenterY;
        const stretchX = 1.8;

        if (reverse) {
            ctx.ellipse(centerX, centerY, radius * stretchX, radius, 0, Math.PI * 2, 0, true);
        } else {
            ctx.ellipse(centerX, centerY, radius * stretchX, radius, 0, 0, Math.PI * 2);
        }
    }

    drawTrackFeatures(gameState) {
        const track = gameState.track;

        // Draw fuel zones
        const segmentLength = 10; // Each segment is 10 meters
        track.segments.forEach((segment, index) => {
            if (segment.type === 'fuel_zone' && segment.items) {
                segment.items.forEach(item => {
                    if (item.type === 'fuel' && item.lanes) {
                        // Draw fuel zone in each lane it occupies
                        item.lanes.forEach(lane => {
                            const position = index * segmentLength;
                            const coords = this.getTrackCoordinates(position, track.lapDistance, lane);
                            this.drawFuelZone(coords.x, coords.y);
                        });
                    }
                });
            }
        });

        // Draw boost pads
        track.boostPads.forEach(position => {
            const coords = this.getTrackCoordinates(position, track.lapDistance, 1);
            this.drawBoostPad(coords.x, coords.y);
        });

        // Draw obstacles
        track.obstacles.forEach(obstacle => {
            obstacle.lanes.forEach(lane => {
                const coords = this.getTrackCoordinates(obstacle.position, track.lapDistance, lane);
                this.drawObstacle(coords.x, coords.y);
            });
        });
    }

    drawFuelZone(x, y) {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(68, 255, 68, 0.3)';
        ctx.fillRect(x - 30, y - 20, 60, 40);

        ctx.fillStyle = '#44ff44';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('FUEL', x, y + 5);
    }

    drawBoostPad(x, y) {
        const ctx = this.ctx;

        // Animated glow
        const glow = Math.sin(this.animationFrame * 0.1) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 215, 0, ${glow * 0.5})`;
        ctx.fillRect(x - 30, y - 20, 60, 40);

        // Chevrons
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(x - 15 + i * 10, y + 10);
            ctx.lineTo(x - 10 + i * 10, y - 10);
            ctx.lineTo(x - 5 + i * 10, y + 10);
            ctx.stroke();
        }
    }

    drawObstacle(x, y) {
        const ctx = this.ctx;

        // Draw cone
        ctx.fillStyle = '#ff8c00';
        ctx.beginPath();
        ctx.moveTo(x, y - 15);
        ctx.lineTo(x - 10, y + 10);
        ctx.lineTo(x + 10, y + 10);
        ctx.closePath();
        ctx.fill();

        // Stripes
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 5, y);
        ctx.lineTo(x + 5, y);
        ctx.stroke();
    }

    drawCar(car, color, label) {
        const coords = this.getTrackCoordinates(car.position, 2000, car.displayLane || car.lane);
        const ctx = this.ctx;

        // Jump effect
        let jumpOffset = 0;
        if (car.isJumping) {
            jumpOffset = Math.sin((10 - car.jumpTicksRemaining) / 10 * Math.PI) * 20;
        }

        // Collision animation effect
        let shakeX = 0, shakeY = 0;
        if (car.collisionAnimation && car.collisionAnimation > 0) {
            // Create shake effect
            shakeX = (Math.random() - 0.5) * 8 * (car.collisionAnimation / 20);
            shakeY = (Math.random() - 0.5) * 8 * (car.collisionAnimation / 20);
            car.collisionAnimation--;
        }

        // Car shadow
        if (jumpOffset > 0) {
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(coords.x - 15, coords.y - 10, 30, 20);
        }

        // Car body
        ctx.save();
        ctx.translate(coords.x + shakeX, coords.y - jumpOffset + shakeY);

        // Rotate based on movement
        const rotation = this.getCarRotation(car.position, 2000);
        ctx.rotate(rotation);

        // Flash red if in collision
        if (car.collisionAnimation && car.collisionAnimation > 0) {
            // Mix red with car color based on animation progress
            const flashIntensity = car.collisionAnimation / 20;
            ctx.fillStyle = `rgba(255, ${Math.floor(68 * (1-flashIntensity))}, ${Math.floor(68 * (1-flashIntensity))}, 1)`;
        } else {
            ctx.fillStyle = color;
        }

        // Determine car state for enhanced visuals
        const carState = this.getCarState(car);
        
        // Draw enhanced car based on state
        this.drawEnhancedCar(ctx, car, color, carState);

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(label, 0, 2);

        ctx.restore();

        // Draw lap counter above the car
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        const lapText = `${car.lap}/${this.totalLaps || 5}`;

        // Draw text with black outline for visibility
        ctx.strokeText(lapText, coords.x, coords.y - jumpOffset - 35);
        ctx.fillText(lapText, coords.x, coords.y - jumpOffset - 35);
        ctx.restore();
    }

    // Removed legacy drawBoostTrail (old light cone effect) as new state effects handle boosting visuals

    getCarState(car) {
        // Determine the current state of the car for visual effects
        if (car.fuel <= 0) return 'outOfFuel';
        if (car.collisionAnimation > 0) return 'collision';
        if (car.isJumping) return 'jumping';
        if (car.changingLane) return 'changingLane';
        if (car.isDrafting) return 'drafting';
        if (car.isRefueling) return 'refueling';  // Use the refueling flag from physics
        
        // Check current action for speed-based states
        switch (car.lastAction) {
            case 'BOOST': return 'boosting';
            case 'SPRINT': return 'sprinting';
            case 'BRAKE': return 'braking';
            case 'ACCELERATE': return 'accelerating';
            case 'COAST': return 'coasting';
            default: return 'normal';
        }
    }

    drawEnhancedCar(ctx, car, color, state) {
        // Car dimensions - now horizontal (facing right)
        const carWidth = 40;  // Car length (was height)
        const carHeight = 24; // Car width (was width)
        
        // Determine car color based on state
        let bodyColor = color;
        let glowColor = null;
        let pulseIntensity = 0;
        
        switch (state) {
            case 'collision':
                const flashIntensity = car.collisionAnimation / 20;
                bodyColor = `rgba(255, ${Math.floor(68 * (1-flashIntensity))}, ${Math.floor(68 * (1-flashIntensity))}, 1)`;
                break;
            case 'boosting':
                glowColor = '#ffff00'; // Yellow glow for boost
                pulseIntensity = 0.8;
                break;
            case 'sprinting':
                glowColor = '#ff8800'; // Orange glow for sprint  
                pulseIntensity = 0.6;
                break;
            case 'outOfFuel':
                bodyColor = '#666666'; // Gray when out of fuel
                break;
            case 'refueling':
                glowColor = '#00ff00'; // Green glow when refueling
                pulseIntensity = 0.8;
                break;
            case 'braking':
                glowColor = '#ff0000'; // Red glow when braking
                pulseIntensity = 0.5;
                break;
        }
        
        // Draw glow effect
        if (glowColor && pulseIntensity > 0) {
            const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7; // Pulsing effect
            ctx.save();
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 15 * pulseIntensity * pulse;
            ctx.fillStyle = bodyColor;
            ctx.fillRect(-carWidth/2, -carHeight/2, carWidth, carHeight);
            ctx.restore();
        }
        
        // Main car body (horizontal rectangle)
        ctx.fillStyle = bodyColor;
        ctx.fillRect(-carWidth/2, -carHeight/2, carWidth, carHeight);
        
        // Car details
        this.drawCarDetails(ctx, carWidth, carHeight, state);
        
        // Additional state-specific effects
        this.drawStateEffects(ctx, car, state, carWidth, carHeight);
    }

    drawCarDetails(ctx, carWidth, carHeight, state) {
        // Front bumper
        ctx.fillStyle = '#333333';
        ctx.fillRect(carWidth/2 - 3, -carHeight/2, 3, carHeight);
        
        // Rear bumper  
        ctx.fillRect(-carWidth/2, -carHeight/2, 3, carHeight);
        
        // Windows (front and rear)
        ctx.fillStyle = 'rgba(100, 150, 255, 0.4)';
        // Front windshield
        ctx.fillRect(carWidth/2 - 12, -carHeight/2 + 3, 8, carHeight - 6);
        // Rear windshield
        ctx.fillRect(-carWidth/2 + 4, -carHeight/2 + 3, 8, carHeight - 6);
        
        // Side windows
        ctx.fillStyle = 'rgba(100, 150, 255, 0.3)';
        ctx.fillRect(-6, -carHeight/2 + 2, 12, 4);  // Top side windows
        ctx.fillRect(-6, carHeight/2 - 6, 12, 4);   // Bottom side windows
        
        // Wheels
        ctx.fillStyle = '#222222';
        const wheelSize = 6;
        // Front wheels
        ctx.fillRect(carWidth/2 - 8, -carHeight/2 - 2, wheelSize, 4);
        ctx.fillRect(carWidth/2 - 8, carHeight/2 - 2, wheelSize, 4);
        // Rear wheels  
        ctx.fillRect(-carWidth/2 + 2, -carHeight/2 - 2, wheelSize, 4);
        ctx.fillRect(-carWidth/2 + 2, carHeight/2 - 2, wheelSize, 4);
        
        // Headlights (when not out of fuel)
        if (state !== 'outOfFuel') {
            ctx.fillStyle = '#ffffcc';
            ctx.fillRect(carWidth/2 - 1, -carHeight/2 + 4, 2, 3);
            ctx.fillRect(carWidth/2 - 1, carHeight/2 - 7, 2, 3);
        }
        
        // Taillights
        ctx.fillStyle = state === 'braking' ? '#ff4444' : '#ff8888';
        ctx.fillRect(-carWidth/2, -carHeight/2 + 4, 2, 3);
        ctx.fillRect(-carWidth/2, carHeight/2 - 7, 2, 3);
    }

    drawStateEffects(ctx, car, state, carWidth, carHeight) {
        switch (state) {
            case 'boosting':
                // Exhaust flames
                ctx.fillStyle = '#ffaa00';
                for (let i = 0; i < 3; i++) {
                    const flameLength = 8 + Math.random() * 6;
                    const y = -carHeight/2 + 6 + i * 4;
                    ctx.fillRect(-carWidth/2 - flameLength, y, flameLength, 2);
                }
                break;
                
            case 'sprinting':
                // Heat exhaust
                ctx.fillStyle = 'rgba(255, 100, 0, 0.6)';
                ctx.fillRect(-carWidth/2 - 4, -2, 4, 4);
                break;
                
            case 'braking':
                // Brake light effect is already handled in drawCarDetails
                // Add smoke from tires
                ctx.fillStyle = 'rgba(100, 100, 100, 0.4)';
                ctx.fillRect(-8, -carHeight/2 - 3, 16, 2);
                ctx.fillRect(-8, carHeight/2 + 1, 16, 2);
                break;
                
            case 'changingLane':
                // Tire marks during lane change
                ctx.strokeStyle = 'rgba(50, 50, 50, 0.6)';
                ctx.lineWidth = 2;
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.moveTo(-carWidth/2, -carHeight/2 - 4);
                ctx.lineTo(-carWidth/2 - 10, -carHeight/2 - 8);
                ctx.moveTo(-carWidth/2, carHeight/2 + 4);
                ctx.lineTo(-carWidth/2 - 10, carHeight/2 + 8);
                ctx.stroke();
                ctx.setLineDash([]);
                break;
                
            case 'outOfFuel':
                // Smoke from engine
                ctx.fillStyle = 'rgba(80, 80, 80, 0.5)';
                for (let i = 0; i < 2; i++) {
                    ctx.fillRect(carWidth/2 - 5, -3 + i * 6, 8, 2);
                }
                break;
                
            case 'refueling':
                // Green fuel particles
                ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
                for (let i = 0; i < 4; i++) {
                    const x = -carWidth/4 + Math.random() * carWidth/2;
                    const y = -carHeight/4 + Math.random() * carHeight/2;
                    ctx.fillRect(x, y, 3, 3);
                }
                break;
        }
    }

    drawEffects(gameState) {
        // Draw any special effects here
    }

    getTrackCoordinates(position, lapDistance, lane) {
        const progress = position / lapDistance;
        const angle = progress * Math.PI * 2 - Math.PI / 2;

        const laneOffset = (lane - 1) * this.laneWidth;
        const radius = this.trackRadius + laneOffset;

        const centerX = this.width / 2;
        const centerY = this.trackCenterY;
        const stretchX = 1.8;

        return {
            x: centerX + Math.cos(angle) * radius * stretchX,
            y: centerY + Math.sin(angle) * radius
        };
    }

    getCarRotation(position, lapDistance) {
        const progress = position / lapDistance;
        // Cars face forward in their direction of travel around the oval
        // At position 0 (top of track), car faces right (0 radians)
        const angle = progress * Math.PI * 2;
        return angle;
    }
}

// ====================================
// BOT SANDBOX
// ====================================

class BotSandbox {
    constructor() {
        this.worker = null;
        this.timeout = 1; // 1ms timeout
    }

    async loadBot(botCode) {
        // Create worker code
        const workerCode = `
            let botInstance = null;
            let PlayerBot = null;

            // CarController for bot use
            ${CarController.toString()}

            // CAR_ACTIONS enum
            const CAR_ACTIONS = ${JSON.stringify(CAR_ACTIONS)};

            // Message handler
            self.onmessage = function(e) {
                if (e.data.type === 'INIT') {
                    try {
                        // Load the bot code
                        const botScript = e.data.botCode;

                        // Wrap the bot code to ensure PlayerBot is captured
                        const wrappedCode = botScript + '; self.PlayerBot = PlayerBot;';

                        // Execute the bot code
                        eval(wrappedCode);

                        // Now PlayerBot should be available
                        if (self.PlayerBot) {
                            PlayerBot = self.PlayerBot;
                            botInstance = new PlayerBot();
                            self.postMessage({ type: 'READY' });
                        } else {
                            throw new Error('PlayerBot class not found after evaluation');
                        }
                    } catch (error) {
                        self.postMessage({
                            type: 'ERROR',
                            error: error.message
                        });
                    }
                } else if (e.data.type === 'DECIDE') {
                    if (!botInstance) {
                        self.postMessage({
                            type: 'ERROR',
                            error: 'Bot not initialized'
                        });
                        return;
                    }

                    try {
                        const car = new CarController();
                        botInstance.decide(e.data.state, car);
                        self.postMessage({
                            type: 'DECISION',
                            actions: car.getExecutionPlan()
                        });
                    } catch (error) {
                        self.postMessage({
                            type: 'ERROR',
                            error: error.message
                        });
                    }
                }
            };
        `;

        // Create blob and worker
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerURL = URL.createObjectURL(blob);

        // Terminate old worker if exists
        if (this.worker) {
            this.worker.terminate();
        }

        this.worker = new Worker(workerURL);

        // Initialize bot
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Bot initialization timeout'));
            }, 1000);

            this.worker.onmessage = (e) => {
                clearTimeout(timeout);
                if (e.data.type === 'READY') {
                    resolve(true);
                } else if (e.data.type === 'ERROR') {
                    reject(new Error(e.data.error));
                }
            };

            this.worker.postMessage({
                type: 'INIT',
                botCode: botCode
            });
        });
    }

    async getDecision(state) {
        if (!this.worker) {
            throw new Error('Bot not loaded');
        }

        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolve({
                    speed: CAR_ACTIONS.IDLE,
                    lane: null,
                    special: []
                });
            }, this.timeout);

            this.worker.onmessage = (e) => {
                clearTimeout(timeout);
                if (e.data.type === 'DECISION') {
                    resolve(e.data.actions);
                } else {
                    resolve({
                        speed: CAR_ACTIONS.IDLE,
                        lane: null,
                        special: []
                    });
                }
            };

            // Send state to bot
            this.worker.postMessage({
                type: 'DECIDE',
                state: JSON.parse(JSON.stringify(state))
            });
        });
    }

    terminate() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}

// ====================================
// RACE ENGINE
// ====================================

class RaceEngine {
    constructor() {
        this.track = null;
        this.gameState = null;
        this.bot1 = null;
        this.bot2 = null;
        this.physicsEngine = new PhysicsEngine();
        this.renderer = null;
        this.running = false;
        this.paused = false;
        this.tick = 0;
        this.speed = 1;
        this.totalLaps = 5;

        // Action log
        this.actionLog = [];
    }

    init(canvas) {
        this.renderer = new Renderer(canvas);
        this.track = new TrackGenerator().generate(Math.random(), 'medium');
        this.reset();
    }

    reset() {
        this.gameState = {
            player1: this.createCarState('player1'),
            player2: this.createCarState('player2'),
            track: this.track,
            race: {
                currentTick: 0,
                totalLaps: this.totalLaps,
                winner: null
            }
        };

        this.tick = 0;
        this.actionLog = [];
        this.running = false;
        this.paused = false;
    }

    createCarState(playerId) {
        return {
            position: 0,
            lane: playerId === 'player1' ? 1 : 1,
            lap: 1,
            speed: 0,
            fuel: 100,  // Start with full tank
            maxFuel: 100,
            boosts: 3,
            tireWear: 1.0,

            isJumping: false,
            jumpTicksRemaining: 0,
            isDrafting: false,
            draftEffectiveness: 0,
            changingLane: false,
            targetLane: 1,
            laneChangeProgress: 0,
            displayLane: 1,
            hitObstacles: [],
            usedBoostPads: [],

            racePosition: playerId === 'player1' ? 1 : 2,
            opponentDistance: 0,
            lastAction: CAR_ACTIONS.IDLE
        };
    }

    async loadBots(bot1Code, bot2Code) {
        this.bot1 = new BotSandbox();
        this.bot2 = new BotSandbox();

        await this.bot1.loadBot(bot1Code);
        await this.bot2.loadBot(bot2Code);
    }

    async start() {
        if (!this.bot1 || !this.bot2) {
            throw new Error('Bots not loaded');
        }

        this.running = true;
        this.paused = false;
        this.gameLoop();
    }

    stop() {
        this.running = false;
    }

    pause() {
        this.paused = !this.paused;
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    async gameLoop() {
        if (!this.running) return;

        if (!this.paused) {
            // Get bot decisions
            const state1 = this.createBotState(this.gameState, 'player1');
            const state2 = this.createBotState(this.gameState, 'player2');

            const action1 = await this.bot1.getDecision(state1);
            const action2 = await this.bot2.getDecision(state2);

            // Log actions
            this.logActions(action1, action2);

            // Store last actions for rendering
            this.gameState.player1.lastAction = action1.speed;
            this.gameState.player2.lastAction = action2.speed;

            // Update physics
            this.gameState = this.physicsEngine.tick(this.gameState, [action1, action2]);

            // Check win conditions
            this.checkWinConditions();

            // Update tick
            this.tick++;
            this.gameState.race.currentTick = this.tick;
        }

        // Render
        this.renderer.draw(this.gameState, this.totalLaps);

        // Update UI
        this.updateUI();

        // Schedule next frame
        if (this.running) {
            setTimeout(() => this.gameLoop(), 1000 / 60 / this.speed);
        }
    }

    createBotState(gameState, playerId) {
        const myCar = gameState[playerId];
        const opponentId = playerId === 'player1' ? 'player2' : 'player1';
        const opponent = gameState[opponentId];

        // Create state for bot
        return {
            car: {
                position: myCar.position,
                lane: myCar.lane,
                lap: myCar.lap,
                speed: myCar.speed,
                fuel: myCar.fuel,
                boosts: myCar.boosts,
                isDrafting: myCar.isDrafting,
                isJumping: myCar.isJumping
            },
            opponent: {
                distance: myCar.opponentDistance,
                lane: opponent.lane,
                speed: opponent.speed,
                lap: opponent.lap
            },
            track: {
                ahead: this.getTrackAhead(myCar.position),
                lapDistance: this.track.lapDistance,
                currentLap: myCar.lap,
                totalLaps: this.totalLaps
            }
        };
    }

    getTrackAhead(position) {
        const ahead = [];
        const segmentsToCheck = 20;

        for (let i = 0; i < segmentsToCheck; i++) {
            const checkPosition = (position + i * 10) % this.track.lapDistance;
            const segmentIndex = Math.floor(checkPosition / 10);

            if (segmentIndex < this.track.segments.length) {
                const segment = this.track.segments[segmentIndex];
                ahead.push({
                    distance: i * 10,
                    type: segment.type,
                    obstacles: segment.obstacles,
                    items: segment.items
                });
            }
        }

        return ahead;
    }

    logActions(action1, action2) {
        this.actionLog.push({
            tick: this.tick,
            player1: action1.speed,
            player2: action2.speed
        });

        // Keep only last 20 entries total (10 per car shown)
        if (this.actionLog.length > 20) {
            this.actionLog.shift();
        }
    }

    checkWinConditions() {
        // Check if any player has completed all required laps
        // A car wins when lap > totalLaps (meaning they've completed all required laps)
        if (this.gameState.player1.lap > this.totalLaps) {
            this.gameState.race.winner = 'player1';
            this.running = false;
            this.onRaceEnd();
            return;
        } 
        
        if (this.gameState.player2.lap > this.totalLaps) {
            this.gameState.race.winner = 'player2';
            this.running = false;
            this.onRaceEnd();
            return;
        }
    }

    onRaceEnd() {
        // Show winner overlay
        const winner = this.gameState.race.winner;
        showWinner(winner, this.gameState, this.tick);
    }

    updateUI() {
        // Update race status
        document.getElementById('current-tick').textContent = this.tick;
        document.getElementById('current-lap').textContent =
            Math.max(this.gameState.player1.lap, this.gameState.player2.lap);

        // Calculate race positions and gaps
        this.updateF1Leaderboard();

        // Update debug info
        if (document.getElementById('debug-p1-speed')) {
            document.getElementById('debug-p1-speed').textContent =
                Math.round(this.gameState.player1.speed);
            document.getElementById('debug-p1-fuel-rate').textContent =
                (this.gameState.player1.fuelConsumptionRate || 0).toFixed(2);
            document.getElementById('debug-p1-draft').textContent =
                this.gameState.player1.isDrafting
                    ? `YES (${Math.round(this.gameState.player1.draftEffectiveness * 100)}%)`
                    : 'No';

            document.getElementById('debug-p2-speed').textContent =
                Math.round(this.gameState.player2.speed);
            document.getElementById('debug-p2-fuel-rate').textContent =
                (this.gameState.player2.fuelConsumptionRate || 0).toFixed(2);
            document.getElementById('debug-p2-draft').textContent =
                this.gameState.player2.isDrafting
                    ? `YES (${Math.round(this.gameState.player2.draftEffectiveness * 100)}%)`
                    : 'No';

            // Calculate total gap including lap differences
            const lapDiff = Math.abs(this.gameState.player1.lap - this.gameState.player2.lap);
            const positionDiff = Math.abs(this.gameState.player1.position - this.gameState.player2.position);
            const gap = lapDiff > 0 ?
                (lapDiff * this.gameState.track.lapDistance) + positionDiff :
                positionDiff;
            document.getElementById('debug-gap').textContent = gap.toFixed(1);
        }

        // Update action log (only add new entries)
        const logDiv = document.getElementById('action-log');
        const currentLogCount = logDiv.children.length;

        // Add only new entries since last update
        for (let i = currentLogCount; i < this.actionLog.length; i++) {
            const logEntry = this.actionLog[i];
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            entry.innerHTML = `
                <span class="log-tick">${logEntry.tick}</span>
                <span class="log-player1">${logEntry.player1}</span>
                <span class="log-player2">${logEntry.player2}</span>
            `;
            logDiv.appendChild(entry);
        }

        // Keep log size manageable
        while (logDiv.children.length > 20) {
            logDiv.removeChild(logDiv.firstChild);
        }
    }

    updateF1Leaderboard() {
        // Calculate total progress for each player (laps + position)
        const p1Progress = (this.gameState.player1.lap - 1) * this.gameState.track.lapDistance + this.gameState.player1.position;
        const p2Progress = (this.gameState.player2.lap - 1) * this.gameState.track.lapDistance + this.gameState.player2.position;

        // Determine positions and sort by progress
        const drivers = [
            {
                id: 'player1',
                name: 'BOT-1',
                color: '#e74c3c',
                progress: p1Progress,
                car: this.gameState.player1
            },
            {
                id: 'player2', 
                name: 'BOT-2',
                color: '#3498db',
                progress: p2Progress,
                car: this.gameState.player2
            }
        ].sort((a, b) => b.progress - a.progress); // Sort by progress descending

        // Update leaderboard positions
        drivers.forEach((driver, index) => {
            const position = index + 1;
            const rowIndex = index + 1;
            
            // Update position
            document.getElementById(`leader-pos-${rowIndex}`).textContent = position;
            
            // Update position color (1st = gold, 2nd = silver)
            const posElement = document.getElementById(`leader-pos-${rowIndex}`);
            if (position === 1) {
                posElement.style.background = '#f1c40f'; // Gold
            } else {
                posElement.style.background = '#95a5a6'; // Silver
            }
            
            // Update driver name
            document.getElementById(`leader-driver-${rowIndex}`).textContent = driver.name;
            
            // Update lap info
            document.getElementById(`leader-lap-${rowIndex}`).textContent = 
                `Lap ${driver.car.lap}/${this.totalLaps}`;
            
            // Update fuel bar and percentage
            const fuelPercent = Math.max(0, (driver.car.fuel / driver.car.maxFuel) * 100);
            const fuelBar = document.getElementById(`leader-fuel-${rowIndex}`);
            const fuelText = document.getElementById(`leader-fuel-text-${rowIndex}`);
            
            if (fuelBar) {
                fuelBar.style.width = `${fuelPercent}%`;
            }
            if (fuelText) {
                fuelText.textContent = `${Math.round(fuelPercent)}%`;
            }
            
            // Update speed
            document.getElementById(`leader-speed-${rowIndex}`).textContent = 
                `${Math.round(driver.car.speed)} km/h`;
            
            // Update gap
            if (position === 1) {
                document.getElementById(`leader-gap-${rowIndex}`).textContent = '-';
                document.getElementById(`leader-gap-${rowIndex}`).style.color = '#27ae60';
            } else {
                const gap = drivers[0].progress - driver.progress;
                
                // Calculate gap based on distance and average speed
                let gapDisplay;
                if (gap < 10) {
                    // Very close - show in meters
                    gapDisplay = `+${gap.toFixed(1)}m`;
                } else {
                    // Calculate time gap based on leader's speed
                    const leaderSpeed = drivers[0].car.speed / 3.6; // Convert to m/s
                    const timeGap = leaderSpeed > 0 ? gap / leaderSpeed : 0;
                    
                    if (timeGap < 60) {
                        gapDisplay = `+${timeGap.toFixed(3)}s`;
                    } else {
                        const minutes = Math.floor(timeGap / 60);
                        const seconds = timeGap % 60;
                        gapDisplay = `+${minutes}:${seconds.toFixed(1)}`;
                    }
                }
                
                document.getElementById(`leader-gap-${rowIndex}`).textContent = gapDisplay;
                document.getElementById(`leader-gap-${rowIndex}`).style.color = '#e67e22';
            }
        });

        // Update race info
        const raceTimeSeconds = this.tick / 60;
        const minutes = Math.floor(raceTimeSeconds / 60);
        const seconds = Math.floor(raceTimeSeconds % 60);
        document.getElementById('race-time').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('current-lap-display').textContent = 
            Math.max(this.gameState.player1.lap, this.gameState.player2.lap);
        
        document.getElementById('total-laps').textContent = this.totalLaps;
    }
}

// ====================================
// UI CONTROLLER
// ====================================

class UIController {
    constructor() {
        this.raceEngine = new RaceEngine();
        this.bot1Code = null;
        this.bot2Code = null;

        this.setupEventListeners();
        this.init();
    }

    init() {
        const canvas = document.getElementById('game-canvas');
        this.raceEngine.init(canvas);
    }

    setupEventListeners() {
        // Bot loading
        this.setupBotLoader('player1');
        this.setupBotLoader('player2');

        // Control buttons
        document.getElementById('start-btn').addEventListener('click', () => this.startRace());
        document.getElementById('stop-btn').addEventListener('click', () => this.stopRace());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetRace());

        // Speed controls
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.raceEngine.setSpeed(parseInt(e.target.dataset.speed));
            });
        });

        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Load examples button
        document.getElementById('load-examples').addEventListener('click', () => this.loadExampleBots());

        // Configuration controls
        const lapsSlider = document.getElementById('config-laps');
        const lapsValue = document.getElementById('laps-value');
        lapsSlider.addEventListener('input', (e) => {
            lapsValue.textContent = e.target.value;
        });

        const fuelSlider = document.getElementById('config-fuel');
        const fuelValue = document.getElementById('fuel-value');
        fuelSlider.addEventListener('input', (e) => {
            fuelValue.textContent = e.target.value;
        });

        // Apply configuration button
        document.getElementById('apply-config').addEventListener('click', () => {
            this.applyConfiguration();
        });
    }

    setupBotLoader(playerId) {
        const loader = document.getElementById(`${playerId}-loader`);
        const input = document.getElementById(`${playerId}-input`);

        // Click to open file dialog
        loader.addEventListener('click', () => input.click());

        // Drag and drop
        loader.addEventListener('dragover', (e) => {
            e.preventDefault();
            loader.classList.add('drag-over');
        });

        loader.addEventListener('dragleave', () => {
            loader.classList.remove('drag-over');
        });

        loader.addEventListener('drop', (e) => {
            e.preventDefault();
            loader.classList.remove('drag-over');

            const file = e.dataTransfer.files[0];
            if (file && file.name.endsWith('.js')) {
                this.loadBotFile(file, playerId);
            }
        });

        // File input change
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadBotFile(file, playerId);
            }
        });
    }

    async loadBotFile(file, playerId) {
        try {
            const code = await this.readFile(file);

            // Validate bot code
            if (!code.includes('PlayerBot') || !code.includes('decide')) {
                throw new Error('Invalid bot file. Must contain PlayerBot class with decide method.');
            }

            // Store code
            if (playerId === 'player1') {
                this.bot1Code = code;
            } else {
                this.bot2Code = code;
            }

            // Update UI
            const loader = document.getElementById(`${playerId}-loader`);
            loader.classList.add('loaded');
            loader.querySelector('.bot-file').textContent = file.name;

            // Display code
            if (document.querySelector('.tab.active').dataset.tab === 'code') {
                document.getElementById('bot-code-display').textContent = code;
            }

        } catch (error) {
            alert(`Error loading bot: ${error.message}`);
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

    async loadExampleBots() {
        // Simple example bots
        const simpleBot = `
class PlayerBot {
    decide(state, car) {
        // Simple bot that just accelerates and avoids obstacles

        // Check for obstacles ahead
        if (state.track.ahead[0].obstacles.length > 0) {
            car.executeAction(CAR_ACTIONS.JUMP);
        }

        // Manage fuel
        if (state.car.fuel < 20) {
            car.executeAction(CAR_ACTIONS.COAST);
        } else {
            car.executeAction(CAR_ACTIONS.ACCELERATE);
        }
    }
}`;

        const racingBot = `
class PlayerBot {
    decide(state, car) {
        // Racing bot with more advanced logic

        // Check for obstacles
        if (state.track.ahead[0].obstacles.length > 0) {
            const obstacle = state.track.ahead[0].obstacles[0];
            if (obstacle.lane === state.car.lane) {
                if (state.car.lane > 0) {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                } else {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                }
            }
        }

        // Use boost if available and opponent is close
        if (state.car.boosts > 0 && Math.abs(state.opponent.distance) < 50) {
            car.executeAction(CAR_ACTIONS.BOOST);
        }
        // Sprint if ahead
        else if (state.opponent.distance < 0 && state.car.fuel > 50) {
            car.executeAction(CAR_ACTIONS.SPRINT);
        }
        // Conserve fuel if low
        else if (state.car.fuel < 30) {
            car.executeAction(CAR_ACTIONS.COAST);
        }
        // Normal racing
        else {
            car.executeAction(CAR_ACTIONS.ACCELERATE);
        }

        // Draft if possible
        if (state.opponent.distance > 0 && state.opponent.distance < 20) {
            if (state.opponent.lane !== state.car.lane) {
                if (state.opponent.lane > state.car.lane) {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                } else {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                }
            }
        }
    }
}`;

        this.bot1Code = simpleBot;
        this.bot2Code = racingBot;

        // Update UI
        document.getElementById('player1-loader').classList.add('loaded');
        document.getElementById('player1-loader').querySelector('.bot-file').textContent = 'SimpleBot.js';

        document.getElementById('player2-loader').classList.add('loaded');
        document.getElementById('player2-loader').querySelector('.bot-file').textContent = 'RacingBot.js';
    }

    async startRace() {
        if (!this.bot1Code || !this.bot2Code) {
            alert('Please load both bots before starting the race!');
            return;
        }

        try {
            // Show countdown
            await this.showCountdown();

            // Load bots
            await this.raceEngine.loadBots(this.bot1Code, this.bot2Code);

            // Start race
            await this.raceEngine.start();

            // Update UI
            document.getElementById('start-btn').disabled = true;
            document.getElementById('stop-btn').disabled = false;
            document.getElementById('race-state').textContent = 'Racing';

        } catch (error) {
            alert(`Error starting race: ${error.message}`);
        }
    }

    stopRace() {
        this.raceEngine.stop();

        // Terminate bot workers
        if (this.raceEngine.bot1) {
            this.raceEngine.bot1.terminate();
            this.raceEngine.bot1 = null;
        }
        if (this.raceEngine.bot2) {
            this.raceEngine.bot2.terminate();
            this.raceEngine.bot2 = null;
        }

        // Update UI
        document.getElementById('start-btn').disabled = false;
        document.getElementById('stop-btn').disabled = true;
        document.getElementById('race-state').textContent = 'Stopped';
    }

    resetRace() {
        this.raceEngine.stop();

        // Terminate bot workers
        if (this.raceEngine.bot1) {
            this.raceEngine.bot1.terminate();
            this.raceEngine.bot1 = null;
        }
        if (this.raceEngine.bot2) {
            this.raceEngine.bot2.terminate();
            this.raceEngine.bot2 = null;
        }

        // Reset the race state
        this.raceEngine.reset();

        // Redraw initial state
        if (this.raceEngine.renderer) {
            this.raceEngine.renderer.draw(this.raceEngine.gameState, this.raceEngine.totalLaps);
        }

        // Clear action log
        document.getElementById('action-log').innerHTML = '';

        // Update UI
        document.getElementById('start-btn').disabled = false;
        document.getElementById('stop-btn').disabled = true;
        document.getElementById('race-state').textContent = 'Ready';
        document.getElementById('current-tick').textContent = '0';
        document.getElementById('current-lap').textContent = '1';
        document.getElementById('total-laps').textContent = this.raceEngine.totalLaps;
    }

    async showCountdown() {
        const overlay = document.getElementById('countdown-overlay');
        const text = document.getElementById('countdown-text');

        overlay.style.display = 'flex';

        for (let i = 3; i > 0; i--) {
            text.textContent = i;
            text.style.animation = 'none';
            void text.offsetWidth; // Trigger reflow
            text.style.animation = 'pulse 1s ease-in-out';
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        text.textContent = 'GO!';
        text.style.animation = 'none';
        void text.offsetWidth;
        text.style.animation = 'pulse 1s ease-in-out';

        setTimeout(() => {
            overlay.style.display = 'none';
        }, 500);
    }

    switchTab(tabName) {
        // Update tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update content
        document.getElementById('stats-panel').style.display = tabName === 'stats' ? 'block' : 'none';
        document.getElementById('log-panel').style.display = tabName === 'log' ? 'block' : 'none';
        document.getElementById('code-panel').style.display = tabName === 'code' ? 'block' : 'none';

        // Load code if code tab
        if (tabName === 'code' && this.bot1Code) {
            document.getElementById('bot-code-display').textContent = this.bot1Code;
        }
    }

    applyConfiguration() {
        // Get configuration values
        const laps = parseInt(document.getElementById('config-laps').value);
        const obstacles = document.getElementById('config-obstacles').value;
        const fuelStations = parseInt(document.getElementById('config-fuel').value);

        // Update race engine settings
        this.raceEngine.totalLaps = laps;

        // Generate new track with settings
        const trackGen = new TrackGenerator();
        trackGen.fuelStationCount = fuelStations;
        this.raceEngine.track = trackGen.generate(Math.random(), obstacles);

        // Reset the race with new settings
        this.resetRace();

        // Update UI to show new settings
        document.getElementById('total-laps').textContent = laps;

        // Show confirmation
        const btn = document.getElementById('apply-config');
        const originalText = btn.textContent;
        btn.textContent = 'Applied!';
        btn.style.background = 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)';

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = 'linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)';
        }, 1500);
    }
}

// ====================================
// HELPER FUNCTIONS
// ====================================

function showWinner(winner, gameState, totalTicks) {
    const overlay = document.getElementById('winner-overlay');
    overlay.style.display = 'flex';

    document.getElementById('winner-name').textContent = winner === 'player1' ? 'Player 1' : 'Player 2';
    document.getElementById('final-time').textContent = formatTime(totalTicks / 60);

    const winnerCar = gameState[winner];
    document.getElementById('final-fuel').textContent = Math.round(100 - winnerCar.fuel) + 'L';
    document.getElementById('final-speed').textContent = Math.round(winnerCar.speed) + ' km/h';
}

function closeWinnerOverlay() {
    document.getElementById('winner-overlay').style.display = 'none';
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ====================================
// INITIALIZE APPLICATION
// ====================================

let app;

window.addEventListener('load', () => {
    app = new UIController();
});