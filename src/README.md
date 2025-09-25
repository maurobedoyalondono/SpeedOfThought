# SpeedOfThought Racing Game - Student Guide

## Quick Start
Create a bot by implementing the `PlayerBot` class with a `decide(state, car)` method:

```javascript
class PlayerBot {
    decide(state, car) {
        // Your racing logic here
        car.executeAction(CAR_ACTIONS.ACCELERATE);
    }
}
```

## Available Actions

### CAR_ACTIONS
- `ACCELERATE` - Speed up by 5 km/h per tick (moderate fuel: ~1.5L/sec)
- `SPRINT` - Speed up by 10 km/h per tick (high fuel: ~2.7L/sec)
- `COAST` - Maintain current speed (low fuel: ~0.48L/sec)
- `BRAKE` - Slow down by 15 km/h per tick (minimal fuel: ~0.18L/sec)
- `BOOST` - Speed up by 20 km/h per tick (uses 1 boost charge + high fuel)
- `IDLE` - Natural deceleration by 2 km/h per tick (very low fuel)
- `CHANGE_LANE_LEFT` - Move one lane left (takes 5 ticks to complete)
- `CHANGE_LANE_RIGHT` - Move one lane right (takes 5 ticks to complete)
- `JUMP` - Jump over obstacles for 10 ticks (5L fuel cost)
- `ENTER_PIT` - Enter pit lane for full refuel (time penalty)

## Game State Object

### state.car
Your car's current status:

- `speed` - Current speed (km/h, max 300)
- `fuel` - Fuel remaining (0-100L)
- `lane` - Current lane (0=left, 1=middle, 2=right)
- `position` - Distance traveled in current lap (meters)
- `lap` - Current lap number
- `boosts` - Number of boost charges available
- `isDrafting` - True if drafting behind opponent (5-25m range)
- `draftEffectiveness` - Drafting efficiency (0.0-1.0)
- `changingLane` - True if currently changing lanes

### state.opponent
Opponent car information:
- `speed` - Their current speed
- `distance` - Relative distance (positive=ahead, negative=behind)
- `lane` - Their current lane

### state.track
Track information:
- `totalLaps` - Number of laps to complete
- `lapDistance` - Distance per lap (meters)
- `ahead` - Array of upcoming track segments (20 segments, 10m each, covers 200m ahead)

### NEW: Complete Track Visibility Helper Methods

Now you can see EVERYTHING on the track ahead in ALL lanes!

#### Get Complete Information (Returns Arrays of Objects)

```javascript
// Get ALL obstacles in ALL lanes ahead
const obstacles = state.getObstaclesAhead();
// Returns: [{ lane: 0, distance: 20, type: 'obstacle' }, { lane: 1, distance: 30, type: 'obstacle' }, ...]

// Get ALL fuel stations in ALL lanes ahead  
const fuelStations = state.getFuelStationsAhead();
// Returns: [{ lane: 1, distance: 80, type: 'fuel_station' }, { lane: 0, distance: 120, type: 'fuel_station' }, ...]

// Get ALL boost pads in ALL lanes ahead
const boostPads = state.getBoostPadsAhead();
// Returns: [{ lane: 2, distance: 40, type: 'boost_pad' }, ...]
```

#### Convenience Methods (Returns Boolean)

```javascript
// Quick checks for your current lane
state.hasObstacleAhead()      // true/false - obstacle in my lane?
state.hasFuelStationAhead()   // true/false - fuel station in my lane?
state.hasBoostPadAhead()      // true/false - boost pad in my lane?
state.isLaneSafe(lane)        // true/false - can I safely move to this lane?
```

#### Strategic Example

```javascript
class PlayerBot {
    decide(state, car) {
        // Get complete track information
        const obstacles = state.getObstaclesAhead();
        const fuelStations = state.getFuelStationsAhead();
        const boostPads = state.getBoostPadsAhead();
        
        // Find obstacles in my lane
        const myObstacles = obstacles.filter(obs => obs.lane === state.car.lane && obs.distance < 30);
        
        if (myObstacles.length > 0) {
            // Find best lane to dodge to
            let bestLane = -1;
            for (let lane = 0; lane <= 2; lane++) {
                if (state.isLaneSafe(lane)) {
                    const laneObstacles = obstacles.filter(obs => obs.lane === lane && obs.distance < 50);
                    const laneBoosts = boostPads.filter(b => b.lane === lane && b.distance < 50);
                    
                    // Score: avoid obstacles, seek boosts
                    const score = -laneObstacles.length + laneBoosts.length;
                    if (score > bestScore) {
                        bestLane = lane;
                        bestScore = score;
                    }
                }
            }
            
            // Move to best lane
            if (bestLane !== -1 && bestLane !== state.car.lane) {
                if (bestLane < state.car.lane) {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                } else {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                }
                return;
            }
        }
        
        // Check for fuel stations in my lane
        const nearFuel = fuelStations.filter(f => f.lane === state.car.lane && f.distance < 40);
        if (nearFuel.length > 0 && state.car.fuel < 60) {
            car.executeAction(CAR_ACTIONS.COAST); // Slow down to refuel longer
            return;
        }
        
        // Default action
        car.executeAction(CAR_ACTIONS.ACCELERATE);
    }
}
```

### Track Segments
Each segment in `state.track.ahead[]` contains:
- `type` - 'normal', 'boost_zone', or 'fuel_zone'
- `obstacles` - Array of obstacles with `lane` property
- `items` - Array of items (boosts or fuel) with `lanes` array

## Game Physics

### Lanes
- **Realistic lane distances**: Inner lane is shorter than outer lane (simulates real racing physics)
  - Lane 0 (inner/left): 95% distance - **Strategic advantage for shorter laps**
  - Lane 1 (middle): 100% distance - Baseline
  - Lane 2 (outer/right): 105% distance - Longer distance but potentially less traffic
- Fuel zones are randomly assigned to any single lane (0, 1, or 2) per fuel station

### Fuel
- Consumption varies by action and current speed
- Higher speeds increase fuel consumption by up to 30%
- Refuel in green fuel zones at 72L/second (1.2L per tick)
- Maximum fuel capacity: 100L

### Collisions
- Obstacles: Reduce speed by 70% (multiply by 0.3) + 5L fuel damage
- Collision stun: 30 ticks (0.5 seconds) where car can't respond
- Boost pads: Add +20 km/h speed bonus (up to 300 km/h max)
- 5-tick cooldown between consecutive collisions

### Drafting
- Following opponent closely (5-25m behind) saves up to 30% fuel
- Effectiveness scales with distance: closer = more fuel savings
- Must be in same lane or very close to get drafting effect

## Strategy Tips

- Fuel zones are only in lanes 1-2, so plan refueling stops
- Draft behind opponents when possible to save fuel
- Use COAST or BRAKE to slow down in fuel zones for more refuel time
- Jump over obstacles if you have fuel, or change lanes to avoid them
- Boost gives maximum acceleration but uses charges and extra fuel
- Monitor fuel consumption - faster actions use exponentially more fuel

## Example: Basic Racer
```javascript
class PlayerBot {
    decide(state, car) {
        // Avoid obstacles
        if (state.track.ahead[0].obstacles?.find(o => o.lane === state.car.lane)) {
            car.executeAction(state.car.lane < 2 ? CAR_ACTIONS.CHANGE_LANE_RIGHT : CAR_ACTIONS.CHANGE_LANE_LEFT);
            return;
        }

        // Manage fuel
        if (state.car.fuel > 20) {
            car.executeAction(CAR_ACTIONS.ACCELERATE);
        } else {
            car.executeAction(CAR_ACTIONS.COAST);
        }
    }
}
```