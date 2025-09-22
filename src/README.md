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
- `ACCELERATE` - Speed up (normal fuel consumption)
- `SPRINT` - Maximum speed (high fuel consumption)
- `COAST` - Maintain speed (no fuel consumption)
- `BRAKE` - Slow down
- `BOOST` - Use boost item (+20 km/h)
- `CHANGE_LANE_LEFT` - Move to inner lane
- `CHANGE_LANE_RIGHT` - Move to outer lane

## Game State Object

### state.car
Your car's current status:
- `speed` - Current speed (km/h)
- `fuel` - Fuel remaining (0-100L)
- `lane` - Current lane (0=inner, 1=middle, 2=outer)
- `position` - Distance traveled (meters)
- `lap` - Current lap number
- `boosts` - Number of boosts available
- `isDrafting` - True if drafting behind opponent

### state.opponent
Opponent car information:
- `speed` - Their current speed
- `distance` - Relative distance (positive=ahead, negative=behind)
- `lane` - Their current lane

### state.track
Track information:
- `totalLaps` - Number of laps to complete
- `lapDistance` - Distance per lap (meters)
- `ahead` - Array of upcoming track segments (10m each)

### Track Segments
Each segment in `state.track.ahead[]` contains:
- `type` - 'normal', 'boost_zone', or 'fuel_zone'
- `obstacles` - Array of obstacles with `lane` property
- `items` - Array of items (boosts or fuel) with `lanes` array

## Game Physics

### Lanes
- Lane 0 (inner): 5% shorter distance
- Lane 1 (middle): Normal distance
- Lane 2 (outer): 5% longer distance

### Fuel
- Consumed based on action (Sprint > Accelerate > Coast)
- Refuel by driving through fuel zones (lanes 1-2 only)
- Refuel rate: 48L/second while in zone

### Collisions
- Obstacles: -30 km/h speed penalty
- Boost pads: +20 km/h speed bonus
- 5-tick cooldown between collisions

### Drafting
- Following opponent closely saves 30% fuel
- Effective range: 5-25 meters behind

## Strategy Tips
- Inner lane is faster but has no fuel
- Plan pit stops - fuel zones are limited
- Use boosts strategically
- Draft to save fuel
- Avoid obstacles!

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