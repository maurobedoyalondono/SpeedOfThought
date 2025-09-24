// LESSON 5: Advanced Strategy and Pit Stops
// Goal: Master all racing elements to become a champion!

class PlayerBot {
    constructor() {
        // Advanced state tracking
        this.raceData = {
            fuelUsedPerLap: [],
            lapTimes: [],
            currentLapStart: 0,
            pitStopPlanned: false,
            opponentPatterns: [],
            boostUsedCount: 0
        };

        this.strategy = "balanced";
        this.lastFuel = 100;
        this.tickCounter = 0;

        console.log("Lesson 5: Advanced Racing Strategy!");
    }

    decide(state, car) {
        this.tickCounter++;

        // Track lap completion
        if (state.car.lap > this.raceData.lapTimes.length + 1) {
            const lapTime = this.tickCounter - this.raceData.currentLapStart;
            this.raceData.lapTimes.push(lapTime);
            this.raceData.currentLapStart = this.tickCounter;

            const fuelUsed = this.lastFuel - state.car.fuel;
            this.raceData.fuelUsedPerLap.push(fuelUsed);
            this.lastFuel = state.car.fuel;

            console.log("=== LAP COMPLETE ===");
            console.log("Lap", this.raceData.lapTimes.length, "time:", (lapTime / 60).toFixed(1), "seconds");
            console.log("Fuel used:", fuelUsed.toFixed(1), "liters");
            console.log("Fuel remaining:", state.car.fuel.toFixed(1));
        }

        // ADVANCED CONCEPT 1: Fuel calculation and pit strategy
        const lapsRemaining = state.track.totalLaps - state.car.lap + 1;
        const avgFuelPerLap = this.calculateAverageFuelPerLap();
        const estimatedFuelNeeded = avgFuelPerLap * lapsRemaining;

        // Log strategy info every 2 seconds
        if (this.tickCounter % 120 === 0) {
            console.log("=== STRATEGY UPDATE ===");
            console.log("Laps remaining:", lapsRemaining);
            console.log("Fuel needed (estimate):", estimatedFuelNeeded.toFixed(1));
            console.log("Current fuel:", state.car.fuel.toFixed(1));
            console.log("Pit stop planned:", this.raceData.pitStopPlanned);
        }

        // ADVANCED CONCEPT 2: Pit stop decision
        // Note: Check if pit lane exists in this track configuration
        const nearPitEntry = state.track.pitLaneEntry && 
                            Math.abs(state.car.position - state.track.pitLaneEntry) < 200;

        if (nearPitEntry && !state.car.isInPitLane) {
            // Should we pit?
            const canFinishWithoutPit = state.car.fuel > estimatedFuelNeeded * 1.2;

            if (!canFinishWithoutPit && lapsRemaining > 1) {
                car.executeAction(CAR_ACTIONS.ENTER_PIT);
                console.log("🏁 ENTERING PIT LANE! Full refuel but ~5 second penalty");
                this.raceData.pitStopPlanned = false;
            }
        }

        // ADVANCED CONCEPT 3: Opponent pattern recognition
        this.analyzeOpponent(state);

        // ADVANCED CONCEPT 4: Dynamic strategy selection
        this.selectStrategy(state, estimatedFuelNeeded);

        // Execute current strategy
        switch (this.strategy) {
            case "aggressive":
                this.aggressiveStrategy(state, car);
                break;
            case "defensive":
                this.defensiveStrategy(state, car);
                break;
            case "fuel_saving":
                this.fuelSavingStrategy(state, car);
                break;
            case "endgame":
                this.endgameStrategy(state, car);
                break;
            default:
                this.balancedStrategy(state, car);
        }

        // Always handle obstacles
        this.handleObstacles(state, car);

        // ADVANCED CONCEPT 5: Boost pad hunting
        this.seekBoostPads(state, car);
    }

    calculateAverageFuelPerLap() {
        if (this.raceData.fuelUsedPerLap.length === 0) {
            return 35; // Updated realistic estimate based on current fuel consumption
        }
        const total = this.raceData.fuelUsedPerLap.reduce((a, b) => a + b, 0);
        return total / this.raceData.fuelUsedPerLap.length;
    }

    analyzeOpponent(state) {
        // Track opponent speed patterns
        this.raceData.opponentPatterns.push(state.opponent.speed);

        if (this.raceData.opponentPatterns.length > 180) { // 3 seconds of data
            this.raceData.opponentPatterns.shift();

            // Analyze patterns
            const avgSpeed = this.raceData.opponentPatterns.reduce((a, b) => a + b, 0) / this.raceData.opponentPatterns.length;
            const recentSpeed = this.raceData.opponentPatterns.slice(-60).reduce((a, b) => a + b, 0) / 60;

            if (recentSpeed > avgSpeed * 1.1) {
                console.log("Opponent is pushing hard!");
            } else if (recentSpeed < avgSpeed * 0.9) {
                console.log("Opponent is conserving fuel!");
            }
        }
    }

    selectStrategy(state, estimatedFuelNeeded) {
        const lapsRemaining = state.track.totalLaps - state.car.lap + 1;
        const opponentAhead = state.opponent.distance > 0;
        const gap = Math.abs(state.opponent.distance);

        // Endgame strategy for final lap
        if (lapsRemaining === 1) {
            this.strategy = "endgame";
            console.log("Strategy: ENDGAME - Final lap!");
        }
        // Need to save fuel
        else if (state.car.fuel < estimatedFuelNeeded * 0.9) {
            this.strategy = "fuel_saving";
            console.log("Strategy: FUEL SAVING");
        }
        // Far behind - need to catch up
        else if (opponentAhead && gap > 100) {
            this.strategy = "aggressive";
            console.log("Strategy: AGGRESSIVE - Catching up!");
        }
        // Far ahead - defend position
        else if (!opponentAhead && gap > 100) {
            this.strategy = "defensive";
            console.log("Strategy: DEFENSIVE - Maintaining lead");
        }
        // Close racing
        else {
            this.strategy = "balanced";
        }
    }

    aggressiveStrategy(state, car) {
        // Push hard to catch up
        if (state.car.boosts > 0 && state.opponent.distance > 50) {
            car.executeAction(CAR_ACTIONS.BOOST);
            this.raceData.boostUsedCount++;
        } else if (state.car.fuel > 30) {
            car.executeAction(CAR_ACTIONS.SPRINT);
        } else if (state.car.fuel > 15) {
            car.executeAction(CAR_ACTIONS.ACCELERATE);
        } else {
            car.executeAction(CAR_ACTIONS.COAST);
        }

        // Try to draft if possible
        if (state.opponent.distance > 0 && state.opponent.distance < 30) {
            this.seekDraftPosition(state, car);
        }
    }

    defensiveStrategy(state, car) {
        // Maintain lead efficiently
        if (state.car.fuel > 50) {
            car.executeAction(CAR_ACTIONS.ACCELERATE);
        } else {
            car.executeAction(CAR_ACTIONS.COAST);
        }

        // Block if opponent gets close
        if (Math.abs(state.opponent.distance) < 30) {
            this.blockOpponent(state, car);
        }
    }

    fuelSavingStrategy(state, car) {
        // Maximum fuel efficiency
        if (state.car.isDrafting && state.car.draftEffectiveness > 0.5) {
            // Good drafting saves significant fuel!
            car.executeAction(CAR_ACTIONS.COAST);
            console.log("Drafting efficiently:", (state.car.draftEffectiveness * 100).toFixed(0) + "% savings");
        } else if (state.car.speed < 150) {
            car.executeAction(CAR_ACTIONS.ACCELERATE);
        } else {
            car.executeAction(CAR_ACTIONS.COAST);
        }

        // Prioritize fuel zones if fuel is critically low
        if (state.car.fuel < 20) {
            this.seekFuelZones(state, car);
        }
    }

    endgameStrategy(state, car) {
        // Final lap - use everything!
        if (state.car.boosts > 0) {
            car.executeAction(CAR_ACTIONS.BOOST);
            console.log("FINAL LAP BOOST!");
        } else if (state.car.fuel > 5) {
            car.executeAction(CAR_ACTIONS.SPRINT);
        } else if (state.car.fuel > 2) {
            car.executeAction(CAR_ACTIONS.ACCELERATE);
        } else {
            car.executeAction(CAR_ACTIONS.COAST);
        }
    }

    balancedStrategy(state, car) {
        // Standard racing
        const closeRacing = Math.abs(state.opponent.distance) < 40;

        if (closeRacing && state.car.fuel > 40) {
            car.executeAction(CAR_ACTIONS.SPRINT);
        } else if (state.car.fuel > 50) {
            car.executeAction(CAR_ACTIONS.ACCELERATE);
        } else if (state.car.fuel > 25) {
            car.executeAction(CAR_ACTIONS.COAST);
        } else {
            car.executeAction(CAR_ACTIONS.COAST);
        }
    }

    seekDraftPosition(state, car) {
        if (state.opponent.lane !== state.car.lane) {
            if (state.opponent.lane < state.car.lane) {
                car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
            } else {
                car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
            }
        }
    }

    blockOpponent(state, car) {
        if (state.opponent.lane !== state.car.lane) {
            if (state.opponent.lane < state.car.lane) {
                car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
            } else {
                car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
            }
        }
    }

    handleObstacles(state, car) {
        for (let i = 0; i < Math.min(2, state.track.ahead.length); i++) {
            if (state.track.ahead[i].obstacles && state.track.ahead[i].obstacles.length > 0) {
                const obstacle = state.track.ahead[i].obstacles[0];
                if (obstacle.lane === state.car.lane) {
                    if (i === 0) {
                        // Immediate danger!
                        if (state.car.lane !== 1) {
                            car.executeAction(state.car.lane === 0 ?
                                CAR_ACTIONS.CHANGE_LANE_RIGHT :
                                CAR_ACTIONS.CHANGE_LANE_LEFT);
                        } else {
                            // Middle lane - choose based on opponent
                            car.executeAction(state.opponent.lane <= 1 ?
                                CAR_ACTIONS.CHANGE_LANE_RIGHT :
                                CAR_ACTIONS.CHANGE_LANE_LEFT);
                        }
                    }
                    break;
                }
            }
        }
    }

    seekBoostPads(state, car) {
        // Look for nearby boost pads (yellow zones)
        for (let i = 0; i < Math.min(2, state.track.ahead.length); i++) {
            if (state.track.ahead[i].type === 'boost_zone') {
                const items = state.track.ahead[i].items;
                if (items && items.length > 0) {
                    const boostLane = items[0].lane;
                    if (typeof boostLane === 'number' && boostLane !== state.car.lane && i < 2) {
                        // Move to boost pad for free +20 km/h
                        if (boostLane < state.car.lane) {
                            car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                        } else {
                            car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                        }
                        console.log("🚀 Moving to boost pad for +20 km/h!");
                        break;
                    }
                }
            }
        }
    }

    seekFuelZones(state, car) {
        // Look for fuel zones - they're only in lanes 1 and 2!
        for (let i = 0; i < Math.min(3, state.track.ahead.length); i++) {
            if (state.track.ahead[i].type === 'fuel_zone') {
                console.log("⛽ Fuel zone ahead! Remember: lanes 1-2 only, refuel at 72L/sec");
                
                // Are we in a fuel-accessible lane?
                if (state.car.lane === 0) {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                    console.log("Moving from lane 0 to access fuel zone");
                    return;
                }
                
                // If we're in a fuel zone, slow down to maximize refuel time
                if (i === 0) {
                    car.executeAction(CAR_ACTIONS.BRAKE);
                    console.log("Braking in fuel zone to maximize refuel time");
                    return;
                }
                break;
            }
        }
    }
}

/*
LESSON 5: MASTERY CONCEPTS

ADVANCED SYSTEMS:

1. PIT STOPS:
   - CAR_ACTIONS.ENTER_PIT when near pit entry
   - Full refuel but costs time (~5 seconds)
   - Strategic decision: pit early or risk running out?

2. DATA TRACKING:
   - Lap times
   - Fuel consumption rates
   - Opponent patterns
   - Performance metrics

3. DYNAMIC STRATEGY:
   - Aggressive: Behind, need to catch up
   - Defensive: Ahead, protect position
   - Fuel-saving: Low fuel, maximize efficiency
   - Endgame: Final lap, use everything
   - Balanced: Standard racing

4. PATTERN RECOGNITION:
   - Track opponent speed changes
   - Identify their strategy
   - Predict their moves

5. RESOURCE OPTIMIZATION:
   - Calculate fuel needs
   - Plan pit stops
   - Time boost usage
   - Maximize drafting

EXPERT TECHNIQUES:

1. Fuel Mathematics:
   - Track fuel per lap
   - Calculate if you can finish
   - Decide optimal pit window

2. Opponent Psychology:
   - Force them into mistakes
   - Pressure when they're low on fuel
   - Block at critical moments

3. Track Memorization:
   - Remember obstacle positions
   - Know boost pad locations
   - Plan optimal racing line

4. Risk Management:
   - When to gamble on fuel
   - When to use boosts
   - When to be aggressive vs conservative

CHAMPIONSHIP CHALLENGES:

1. Win without pit stops
2. Win using only 1 boost
3. Complete race using <200 total fuel
4. Overtake on final corner
5. Win by >100 meters

PROFESSIONAL TIPS:

- Pit stops cost ~300 meters (5 seconds)
- Drafting saves 30% fuel
- Boost pads give free speed
- Middle lane = most options
- Save 1 boost for emergencies

RACE CRAFT:
"To finish first, first you must finish"
- Balance speed with reliability
- Know when to push and when to save
- Every decision has consequences
- The best strategy adapts to circumstances

Final advice: The winner isn't always the fastest,
but the smartest!
*/