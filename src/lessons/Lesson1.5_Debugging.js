// LESSON 1.5: Debugging Your Bot and Using the Console
// Goal: Learn to debug your bot and understand what's happening!

class PlayerBot {
    constructor() {
        this.debugMode = true; // Turn this on/off to control debug output
        this.tickCount = 0;
        this.lastLap = 1;

        console.log("🐛 Lesson 1.5: Learning to debug your racing bot!");
        console.log("💡 Tip: Open your browser's developer console (F12) to see all messages!");
    }

    decide(state, car) {
        this.tickCount++;

        // CONCEPT 1: Understanding the game loop
        // This function runs 60 times per second!
        if (this.tickCount === 1) {
            console.log("🎮 Game started! This decide() function runs 60 times per second");
            console.log("🏁 Race setup: " + state.track.totalLaps + " laps, " + state.track.lapDistance + " meters per lap");
        }

        // CONCEPT 2: Basic state inspection
        // Let's look at what information we have available
        if (this.debugMode && this.tickCount % 60 === 0) { // Every 1 second
            console.log("\n=== DEBUG INFO (1 second update) ===");
            this.logCarState(state);
            this.logTrackInfo(state);
            this.logPerformanceMetrics(state);
        }

        // CONCEPT 3: Detecting state changes
        // Look for important changes that happen
        this.detectChanges(state);

        // CONCEPT 4: Error checking and validation
        // Make sure our bot is making sense
        this.validateState(state);

        // CONCEPT 5: Testing different scenarios
        // Let's try different behaviors based on situations
        this.demonstrateActions(state, car);

        // CHALLENGE 1: Enable advanced debugging
        // Uncomment this to see detailed info every tick (warning: lots of output!)
        // this.detailedDebugOutput(state);

        // CHALLENGE 2: Monitor your bot's decisions
        // this.logDecisionReasoning(state);

        // CHALLENGE 3: Track your bot's performance
        // this.trackPerformanceHistory(state);
    }

    logCarState(state) {
        console.log("🚗 CAR STATE:");
        console.log("  Speed: " + state.car.speed.toFixed(1) + " km/h (max: 300)");
        console.log("  Fuel: " + state.car.fuel.toFixed(1) + "L (max: 100)");
        console.log("  Position: " + state.car.position.toFixed(0) + "m / " + state.track.lapDistance + "m");
        console.log("  Lane: " + state.car.lane + " (0=left, 1=middle, 2=right)");
        console.log("  Lap: " + state.car.lap + " / " + state.track.totalLaps);
        console.log("  Boosts: " + state.car.boosts + " charges remaining");
        console.log("  Drafting: " + (state.car.isDrafting ? "YES (saving fuel!)" : "no"));

        // Special states
        if (state.car.isJumping) console.log("  🦘 JUMPING!");
        if (state.car.collisionStun > 0) console.log("  💥 STUNNED for " + state.car.collisionStun + " more ticks");
        if (state.car.isInPitLane) console.log("  🏁 IN PIT LANE");
    }

    logTrackInfo(state) {
        console.log("🛣️ TRACK AHEAD:");

        // Use new helper methods to get track information
        const obstacles = state.getObstaclesAhead();
        const fuelStations = state.getFuelStationsAhead();
        const boostPads = state.getBoostPadsAhead();

        console.log("  Total items visible: " + obstacles.length + " obstacles, " +
                    fuelStations.length + " fuel stations, " + boostPads.length + " boost pads");

        // Check what's in our current lane
        if (state.hasObstacleAhead()) {
            const nextObstacle = obstacles.find(o => o.lane === state.car.lane);
            console.log("  ⚠️ OBSTACLE in my lane at " + nextObstacle.distance + "m!");
        }

        if (state.hasFuelStationAhead()) {
            const nextFuel = fuelStations.find(f => f.lane === state.car.lane);
            console.log("  ⛽ FUEL STATION in my lane at " + nextFuel.distance + "m!");
        }

        if (state.hasBoostPadAhead()) {
            const nextBoost = boostPads.find(b => b.lane === state.car.lane);
            console.log("  🚀 BOOST PAD in my lane at " + nextBoost.distance + "m!");
        }

        // Show nearest items
        if (obstacles.length > 0) {
            console.log("  Nearest obstacle: Lane " + obstacles[0].lane + " at " + obstacles[0].distance + "m");
        }
        if (fuelStations.length > 0) {
            console.log("  Nearest fuel: Lane " + fuelStations[0].lane + " at " + fuelStations[0].distance + "m");
        }
        if (boostPads.length > 0) {
            console.log("  Nearest boost: Lane " + boostPads[0].lane + " at " + boostPads[0].distance + "m");
        }

        // Check lane safety
        console.log("  Lane safety: 0=" + (state.isLaneSafe(0) ? "✅" : "❌") +
                    " 1=" + (state.isLaneSafe(1) ? "✅" : "❌") +
                    " 2=" + (state.isLaneSafe(2) ? "✅" : "❌"));
    }

    logPerformanceMetrics(state) {
        // Calculate some useful metrics
        const lapProgress = (state.car.position / state.track.lapDistance * 100).toFixed(1);
        const raceProgress = ((state.car.lap - 1) * 100 + parseFloat(lapProgress)) / state.track.totalLaps;

        console.log("📊 PERFORMANCE:");
        console.log("  Lap progress: " + lapProgress + "%");
        console.log("  Race progress: " + raceProgress.toFixed(1) + "%");
        console.log("  Time elapsed: " + (this.tickCount / 60).toFixed(1) + " seconds");

        // Fuel efficiency
        const expectedFuelUsage = (this.tickCount / 60) * 1.5; // Rough estimate
        const actualFuelUsed = 100 - state.car.fuel;
        console.log("  Fuel efficiency: " + (expectedFuelUsage - actualFuelUsed).toFixed(1) + "L better than expected");
    }

    detectChanges(state) {
        // Detect lap changes
        if (state.car.lap > this.lastLap) {
            console.log("🏁 LAP COMPLETED! Now on lap " + state.car.lap);
            console.log("   Time for lap " + this.lastLap + ": " + (this.tickCount / 60).toFixed(1) + " seconds");
            this.lastLap = state.car.lap;
        }

        // Detect critical fuel levels
        if (state.car.fuel < 20 && state.car.fuel > 19.8) {
            console.log("⚠️ FUEL WARNING: Only " + state.car.fuel.toFixed(1) + "L remaining!");
        }

        // Detect collisions
        if (state.car.collisionStun > 0) {
            console.log("💥 COLLISION DETECTED! Speed reduced, fuel lost, stunned for " + state.car.collisionStun + " ticks");
        }

        // Detect drafting
        if (state.car.isDrafting && !this.wasDrafting) {
            console.log("🏎️ Started drafting! Saving fuel now");
        } else if (!state.car.isDrafting && this.wasDrafting) {
            console.log("🏎️ Stopped drafting");
        }
        this.wasDrafting = state.car.isDrafting;
    }

    validateState(state) {
        // Basic sanity checks
        if (state.car.speed < 0) {
            console.error("❌ ERROR: Negative speed detected!");
        }
        if (state.car.fuel < 0) {
            console.error("❌ ERROR: Negative fuel detected!");
        }
        if (state.car.lane < 0 || state.car.lane > 2) {
            console.error("❌ ERROR: Invalid lane: " + state.car.lane);
        }

        // Performance warnings
        if (state.car.speed < 50 && state.car.fuel > 20) {
            console.warn("⚠️ WARNING: Very low speed but have fuel - might be stuck?");
        }
        if (state.car.fuel < 10) {
            console.warn("🔴 CRITICAL: Very low fuel - emergency conservation needed!");
        }
    }

    demonstrateActions(state, car) {
        // Simple behavior for demonstration with new helper methods
        console.log("🤔 Decision making...");

        // Check for immediate dangers
        if (state.hasObstacleAhead()) {
            console.log("   🚧 Obstacle ahead! Need to change lanes or jump");
            // For now, just slow down as demonstration
            car.executeAction(CAR_ACTIONS.BRAKE);
            return;
        }

        // Check for opportunities
        if (state.hasFuelStationAhead() && state.car.fuel < 50) {
            console.log("   ⛽ Fuel station ahead and we need fuel - maintaining lane");
        }

        if (state.hasBoostPadAhead()) {
            console.log("   🚀 Boost pad ahead - maintaining lane to collect it");
        }

        // Normal fuel-based decisions
        if (state.car.fuel > 70) {
            console.log("   Plenty of fuel - going fast with SPRINT");
            car.executeAction(CAR_ACTIONS.SPRINT);
        } else if (state.car.fuel > 40) {
            console.log("   Good fuel level - using ACCELERATE");
            car.executeAction(CAR_ACTIONS.ACCELERATE);
        } else if (state.car.fuel > 20) {
            console.log("   Moderate fuel - conserving with COAST");
            car.executeAction(CAR_ACTIONS.COAST);
        } else {
            console.log("   Low fuel - maximum conservation with COAST");
            car.executeAction(CAR_ACTIONS.COAST);
        }
    }

    detailedDebugOutput(state) {
        // VERY detailed output - use sparingly!
        console.log("📋 DETAILED DEBUG (Tick " + this.tickCount + "):");

        // Log all visible items
        const obstacles = state.getObstaclesAhead();
        const fuelStations = state.getFuelStationsAhead();
        const boostPads = state.getBoostPadsAhead();

        console.log("   All obstacles:", obstacles);
        console.log("   All fuel stations:", fuelStations);
        console.log("   All boost pads:", boostPads);
        console.log("   My lane safety:", state.isLaneSafe(state.car.lane));
    }

    logDecisionReasoning(state) {
        // Explain WHY the bot makes decisions
        if (this.tickCount % 30 === 0) { // Every 0.5 seconds
            console.log("💭 REASONING:");

            if (state.hasObstacleAhead()) {
                console.log("   Obstacle detected -> Must avoid");
            }
            if (state.hasFuelStationAhead()) {
                console.log("   Fuel station available -> Consider if needed");
            }
            if (state.hasBoostPadAhead()) {
                console.log("   Boost pad available -> Try to collect");
            }

            console.log("   Fuel level: " + state.car.fuel.toFixed(1) + " -> " +
                       (state.car.fuel > 70 ? "Can sprint" :
                        state.car.fuel > 40 ? "Should accelerate" :
                        "Must conserve"));
        }
    }

    trackPerformanceHistory(state) {
        // Keep track of how we're doing over time
        if (!this.performanceHistory) {
            this.performanceHistory = [];
        }

        if (this.tickCount % 60 === 0) { // Every second
            this.performanceHistory.push({
                time: this.tickCount / 60,
                speed: state.car.speed,
                fuel: state.car.fuel,
                position: state.car.position,
                lap: state.car.lap
            });

            // Show trends
            if (this.performanceHistory.length >= 3) {
                const recent = this.performanceHistory.slice(-3);
                const speedTrend = recent[2].speed - recent[0].speed;
                console.log("📈 Speed trend over last 2 seconds: " +
                           (speedTrend > 0 ? "+" : "") + speedTrend.toFixed(1) + " km/h");
            }
        }
    }
}

/*
LESSON 1.5: DEBUGGING MASTERY

CONSOLE BASICS:

1. OPENING THE CONSOLE:
   - Chrome/Edge: Press F12, click "Console" tab
   - Firefox: Press F12, click "Console" tab
   - Safari: Enable Developer menu, then Develop > Show Console
   - Mobile: Use desktop browser for debugging

2. CONSOLE COMMANDS:
   console.log("message") - Basic output
   console.warn("warning") - Yellow warning message
   console.error("error") - Red error message
   console.table(data) - Display data in table format

DEBUGGING STRATEGIES:

1. STATE INSPECTION:
   - Log current values every few seconds
   - Watch for unexpected changes
   - Verify your assumptions about the data

2. DECISION TRACKING:
   - Log WHY you make each decision
   - Show the logic path: "If fuel > 50 then ACCELERATE"
   - Track decision outcomes

3. PERFORMANCE MONITORING:
   - Speed trends over time
   - Fuel consumption rates
   - Lap time comparisons
   - Position tracking

COMMON ISSUES TO DEBUG:

1. "My bot is too slow"
   → Check: Are you using COAST too much?
   → Debug: Log speed every second

2. "My bot runs out of fuel"
   → Check: Fuel consumption vs track length
   → Debug: Log fuel usage per lap

3. "My bot crashes into obstacles"
   → Check: Are you looking ahead?
   → Debug: Log obstacle detection with state.hasObstacleAhead()

4. "My bot makes weird decisions"
   → Check: Logic conditions and order
   → Debug: Log decision reasoning

DEBUGGING WITH NEW HELPER METHODS:

// Check what's in your current lane
if (state.hasObstacleAhead()) {
    console.log("Obstacle in my lane!");
}
if (state.hasFuelStationAhead()) {
    console.log("Fuel station in my lane!");
}
if (state.hasBoostPadAhead()) {
    console.log("Boost pad in my lane!");
}

// Get detailed information about all items
const obstacles = state.getObstaclesAhead();
console.log("All visible obstacles:", obstacles);

// Check if a lane is safe to move to
if (state.isLaneSafe(1)) {
    console.log("Middle lane is safe!");
}

DEBUGGING LEVELS:

Level 1 - Basic: Key events (lap changes, low fuel)
Level 2 - Detailed: Every second updates
Level 3 - Verbose: Every action with reasoning
Level 4 - Everything: Every tick (use carefully!)

HELPFUL DEBUG PATTERNS:

// Track changes
if (newValue !== oldValue) {
    console.log("Value changed from", oldValue, "to", newValue);
}

// Validate assumptions
if (state.car.fuel <= 0) {
    console.error("Out of fuel!");
}

// Performance tracking
const startTime = Date.now();
// ... do something ...
console.log("Operation took", Date.now() - startTime, "ms");

BROWSER DEVELOPER TOOLS:

1. CONSOLE TAB:
   - See all console.log output
   - Filter by message type
   - Search through messages

2. SOURCES/DEBUGGER TAB:
   - Set breakpoints in code
   - Step through execution
   - Inspect variables

3. NETWORK TAB:
   - See game file loading
   - Check for errors

ADVANCED DEBUGGING:

1. CONDITIONAL LOGGING:
   if (state.car.fuel < 20) {
       console.log("Low fuel situation");
   }

2. OBJECT INSPECTION:
   console.log("Full state:", state);
   console.log("Car object:", state.car);
   console.log("All obstacles:", state.getObstaclesAhead());

3. TIMING ANALYSIS:
   console.time("decision");
   // ... make decision ...
   console.timeEnd("decision");

DEBUGGING CHECKLIST:

□ Console opens correctly
□ Messages appear when expected
□ No red error messages
□ Bot behavior matches logic
□ Performance metrics look reasonable
□ State changes are detected
□ Decision making is logical

PROFESSIONAL TIPS:

1. Use meaningful log messages
2. Include timestamps for timing issues
3. Log both inputs and outputs
4. Use different log levels (log, warn, error)
5. Remove excessive logging before final version
6. Test edge cases (out of fuel, obstacles everywhere)

Remember: Debugging is detective work!
Look for clues, form hypotheses, test them systematically.
The console is your magnifying glass! 🔍
*/