// AdvancedBot - Ultra intelligent AI with perfect decision making
// This bot uses advanced prediction, memory, and optimization
//
// TRACK ELEMENTS:
// - Orange cones = OBSTACLES (crash = -70% speed + stun!)
// - Yellow zones = BOOST PADS (+20 km/h free speed!)
// - Green zones = FUEL ZONES (continuous refuel)
// - Inner lane (0) is 5% shorter = FASTER LAP TIMES
// - Drafting saves 0-30% fuel based on distance (5-25m)
// - Pit stops = full fuel but ~5 second penalty

class PlayerBot {
    constructor() {
        // Advanced tracking systems
        this.memory = {
            obstacles: new Map(),      // Remember obstacle positions
            boostPads: [],             // Track used boost pads
            fuelPerLap: [],           // Fuel consumption history
            lapTimes: [],             // Lap time tracking
            opponentBehavior: [],     // Opponent pattern analysis
            lastLapStart: 0
        };

        this.state = {
            tickCount: 0,
            lastFuel: 100,
            currentLap: 1,
            changingLane: false,
            lastAction: null,
            refuelingStartFuel: null,  // Track fuel when entering zone
            refuelingTicks: 0          // Track time spent refueling
        };

        this.strategy = "balanced";
        this.PREFERRED_LANE = 0; // Inner lane is mathematically superior
    }

    decide(state, car) {
        this.state.tickCount++;

        // Update memory systems
        this.updateMemory(state);

        // CRITICAL PRIORITY 1: NEVER HIT OBSTACLES
        // Check immediate danger (next segment)
        if (this.mustAvoidObstacle(state)) {
            const safeLane = this.findSafestLane(state);
            if (safeLane !== state.car.lane) {
                if (safeLane < state.car.lane) {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                } else {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                }
                this.state.lastAction = 'avoiding_obstacle';
                return;
            }
        }

        // PRIORITY 2: Prepare for upcoming obstacles (look ahead)
        const futureObstacle = this.scanForObstacles(state, 3);
        if (futureObstacle && futureObstacle.distance <= 1) {
            const optimalLane = this.planOptimalPath(state, futureObstacle);
            if (optimalLane !== state.car.lane && !this.state.changingLane) {
                if (optimalLane < state.car.lane) {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                } else {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                }
                this.state.changingLane = true;
                this.state.lastAction = 'planning_avoidance';
                return;
            }
        } else {
            this.state.changingLane = false;
        }

        // PRIORITY 3: Grab nearby boost pads (but ONLY if safe!)
        const boostChance = this.findSafeBoostPad(state);
        if (boostChance && boostChance.worth_it) {
            if (boostChance.lane < state.car.lane) {
                car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
            } else {
                car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
            }
            this.state.lastAction = 'getting_boost';
            return;
        }

        // ADVANCED STRATEGY: Pit stops
        if (this.shouldPitStop(state)) {
            car.executeAction(CAR_ACTIONS.ENTER_PIT);
            this.state.lastAction = 'pit_stop';
            return;
        }

        // RACING TACTICS: Drafting for efficiency
        const draftMove = this.optimizeDrafting(state);
        if (draftMove) {
            if (draftMove.lane < state.car.lane) {
                car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
            } else {
                car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
            }
            this.state.lastAction = 'seeking_draft';
            return;
        }

        // BOOST MANAGEMENT: Use at perfect moments
        if (this.perfectBoostTiming(state)) {
            car.executeAction(CAR_ACTIONS.BOOST);
            this.state.lastAction = 'boosting';
            return;
        }

        // FUEL MANAGEMENT: Smart refueling strategy (BEFORE lane optimization)
        // Check fuel needs more intelligently - not just at low fuel
        const lapsRemaining = state.track.totalLaps - state.car.lap + 1;
        const avgFuelPerLap = this.getAverageFuelPerLap();
        const fuelNeeded = avgFuelPerLap * lapsRemaining;

        // Be proactive about fuel - don't wait until too low
        // Also check if we're in lane 0 and need fuel (fuel is only in lanes 1-2)
        if (state.car.fuel < fuelNeeded * 1.3 ||
            (state.car.fuel < 60 && state.track.ahead[0] && state.track.ahead[0].type === 'fuel_zone') ||
            (state.car.fuel < fuelNeeded * 1.5 && state.car.lane === 0)) {
            if (this.needsFuel(state, car)) {
                return; // Action taken in needsFuel
            }
        }

        // LANE OPTIMIZATION: Only prefer inner lane if we have enough fuel
        // Don't go to inner lane if we might need fuel soon (fuel is in lanes 1-2)
        if (state.car.fuel > avgFuelPerLap * 2 && this.shouldMoveToInnerLane(state)) {
            car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
            this.state.lastAction = 'optimizing_lane';
            return;
        }

        // SPEED CONTROL: Optimal racing speed
        this.selectOptimalSpeed(state, car);
    }

    updateMemory(state) {
        // Track lap changes
        if (state.car.lap > this.state.currentLap) {
            const lapTime = this.state.tickCount - this.memory.lastLapStart;
            this.memory.lapTimes.push(lapTime);

            const fuelUsed = this.state.lastFuel - state.car.fuel;
            this.memory.fuelPerLap.push(fuelUsed);

            this.state.lastFuel = state.car.fuel;
            this.state.currentLap = state.car.lap;
            this.memory.lastLapStart = this.state.tickCount;
        }

        // Remember obstacles
        for (let i = 0; i < state.track.ahead.length; i++) {
            if (state.track.ahead[i].obstacles) {
                const pos = Math.floor((state.car.position + i * 10) / 10);
                this.memory.obstacles.set(pos, state.track.ahead[i].obstacles);
            }
        }

        // Track opponent behavior
        this.memory.opponentBehavior.push({
            speed: state.opponent.speed,
            distance: state.opponent.distance,
            lane: state.opponent.lane
        });
        if (this.memory.opponentBehavior.length > 180) {
            this.memory.opponentBehavior.shift();
        }
    }

    mustAvoidObstacle(state) {
        // Check immediate segment for obstacles in our lane
        if (!state.track.ahead[0].obstacles) return false;

        for (let obs of state.track.ahead[0].obstacles) {
            if (obs.lane === state.car.lane) {
                return true; // DANGER!
            }
        }
        return false;
    }

    findSafestLane(state) {
        const lanes = [0, 1, 2];
        const currentLane = state.car.lane;

        // Find lanes without obstacles
        const safeLanes = lanes.filter(lane => {
            if (!state.track.ahead[0].obstacles) return true;
            for (let obs of state.track.ahead[0].obstacles) {
                if (obs.lane === lane) return false;
            }
            return true;
        });

        if (safeLanes.length === 0) {
            // All lanes blocked - shouldn't happen but pick middle
            return 1;
        }

        // Prefer lane closest to current to minimize movement
        let bestLane = safeLanes[0];
        let minDistance = Math.abs(safeLanes[0] - currentLane);

        for (let lane of safeLanes) {
            const dist = Math.abs(lane - currentLane);
            if (dist < minDistance) {
                minDistance = dist;
                bestLane = lane;
            }
            // Tie breaker: prefer inner lane
            else if (dist === minDistance && lane < bestLane) {
                bestLane = lane;
            }
        }

        return bestLane;
    }

    scanForObstacles(state, lookAhead) {
        for (let i = 0; i < Math.min(lookAhead, state.track.ahead.length); i++) {
            if (state.track.ahead[i].obstacles) {
                for (let obs of state.track.ahead[i].obstacles) {
                    if (obs.lane === state.car.lane) {
                        return { lane: obs.lane, distance: i };
                    }
                }
            }
        }
        return null;
    }

    planOptimalPath(state, obstacle) {
        // Plan the best lane considering multiple factors
        const lanes = [0, 1, 2].filter(l => l !== obstacle.lane);

        // Score each lane
        let bestLane = state.car.lane;
        let bestScore = -999;

        for (let lane of lanes) {
            let score = 0;

            // Check if lane is clear for next 3 segments
            let clear = true;
            for (let i = 0; i <= Math.min(3, state.track.ahead.length - 1); i++) {
                if (state.track.ahead[i].obstacles) {
                    for (let obs of state.track.ahead[i].obstacles) {
                        if (obs.lane === lane) {
                            clear = false;
                            break;
                        }
                    }
                }
            }
            if (!clear) continue;

            // Prefer inner lane (shorter distance)
            score += (2 - lane) * 10;

            // Prefer minimal lane changes
            score -= Math.abs(lane - state.car.lane) * 5;

            // Consider opponent position
            if (state.opponent.lane === lane) {
                score -= 3;
            }

            if (score > bestScore) {
                bestScore = score;
                bestLane = lane;
            }
        }

        return bestLane;
    }

    findSafeBoostPad(state) {
        // Only look at very close boost pads
        for (let i = 0; i < Math.min(2, state.track.ahead.length); i++) {
            if (state.track.ahead[i].type === 'boost_zone' && state.track.ahead[i].items) {
                const pad = state.track.ahead[i].items[0];
                if (!pad) continue;

                // Check if already collected
                const padId = `${Math.floor((state.car.position + i * 10) / 10)}_${pad.lane}`;
                if (this.memory.boostPads.includes(padId)) continue;

                // Check if lane change is safe (no obstacles)
                let safe = true;
                for (let j = 0; j <= i; j++) {
                    if (state.track.ahead[j].obstacles) {
                        for (let obs of state.track.ahead[j].obstacles) {
                            if (obs.lane === pad.lane) {
                                safe = false;
                                break;
                            }
                        }
                    }
                }

                if (safe && i === 0) {
                    // Immediate boost and safe
                    this.memory.boostPads.push(padId);
                    return { lane: pad.lane, worth_it: true };
                }
            }
        }
        return null;
    }

    shouldPitStop(state) {
        if (!state.track.pitLaneEntry) return false;

        const nearPit = Math.abs(state.car.position - state.track.pitLaneEntry) < 100;
        if (!nearPit || state.car.isInPitLane) return false;

        const lapsRemaining = state.track.totalLaps - state.car.lap + 1;
        const avgFuelPerLap = this.getAverageFuelPerLap();
        const fuelNeeded = avgFuelPerLap * lapsRemaining;

        // Only pit if we can't finish without it
        return state.car.fuel < fuelNeeded * 1.1 && lapsRemaining > 1;
    }

    getAverageFuelPerLap() {
        if (this.memory.fuelPerLap.length === 0) return 35;
        const sum = this.memory.fuelPerLap.reduce((a, b) => a + b, 0);
        return sum / this.memory.fuelPerLap.length;
    }

    optimizeDrafting(state) {
        const gap = state.opponent.distance;

        // Perfect drafting range
        if (gap > 5 && gap < 25) {
            // Calculate effectiveness
            const effectiveness = 1 - ((gap - 5) / 20);

            // Only change lanes for good drafting
            if (effectiveness > 0.4 && state.opponent.lane !== state.car.lane) {
                // But check for obstacles first!
                let safe = true;
                if (state.track.ahead[0].obstacles) {
                    for (let obs of state.track.ahead[0].obstacles) {
                        if (obs.lane === state.opponent.lane) {
                            safe = false;
                            break;
                        }
                    }
                }

                if (safe) {
                    return { lane: state.opponent.lane };
                }
            }
        }
        return null;
    }

    perfectBoostTiming(state) {
        if (state.car.boosts === 0) return false;

        const gap = Math.abs(state.opponent.distance);
        const ahead = state.opponent.distance > 0;
        const finalLap = state.car.lap === state.track.totalLaps;

        // Use boost strategically
        if (finalLap) return true; // Final lap sprint
        if (ahead && gap < 30 && gap > 10) return true; // Perfect overtaking distance
        if (!ahead && gap < 10) return true; // Defensive boost
        if (state.car.boosts > (state.track.totalLaps - state.car.lap + 1)) return true; // Excess

        return false;
    }

    shouldMoveToInnerLane(state) {
        if (state.car.lane === 0) return false; // Already there

        // Check if inner lane is clear for next 3 segments
        for (let i = 0; i < Math.min(3, state.track.ahead.length); i++) {
            if (state.track.ahead[i].obstacles) {
                for (let obs of state.track.ahead[i].obstacles) {
                    if (obs.lane === 0) return false;
                }
            }
        }

        // Don't move if opponent is there and close
        if (state.opponent.lane === 0 && Math.abs(state.opponent.distance) < 30) {
            return false;
        }

        return true;
    }

    needsFuel(state, car) {
        // Calculate how much fuel we need to finish
        const lapsRemaining = state.track.totalLaps - state.car.lap + 1;
        const avgFuelPerLap = this.getAverageFuelPerLap();
        const fuelNeeded = avgFuelPerLap * lapsRemaining;

        // Constants for refueling (from game.js physics)
        const REFUEL_RATE = 0.8; // Liters per tick
        const REFUEL_PER_SECOND = REFUEL_RATE * 60; // 48 L/second

        // Check if we're currently IN a fuel zone
        if (state.track.ahead[0] && state.track.ahead[0].type === 'fuel_zone') {
            // Track refueling progress
            if (this.state.refuelingStartFuel === null) {
                this.state.refuelingStartFuel = state.car.fuel;
                this.state.refuelingTicks = 0;
            }
            this.state.refuelingTicks++;

            // Calculate target fuel level based on race situation
            let targetFuel;
            if (lapsRemaining === 1) {
                // Last lap - just need enough to finish
                targetFuel = Math.min(fuelNeeded * 1.2, 100);
            } else if (lapsRemaining === 2) {
                // Two laps left - try to get enough for both if possible
                targetFuel = Math.min(fuelNeeded * 1.1, 100);
            } else {
                // Multiple laps - get at least one full lap + safety margin
                targetFuel = Math.min(Math.max(avgFuelPerLap * 1.5, fuelNeeded * 0.6), 100);
            }

            // Calculate how much fuel we've gained
            const fuelGained = state.car.fuel - this.state.refuelingStartFuel;
            const fuelGainRate = fuelGained / this.state.refuelingTicks; // L/tick actual rate

            // We're IN a fuel zone - should we stay?
            if (state.car.fuel < targetFuel - 10) {
                // Still need significant fuel - BRAKE hard to maximize refuel time
                car.executeAction(CAR_ACTIONS.BRAKE);
                this.state.lastAction = 'refueling_brake';
                return true;
            } else if (state.car.fuel < targetFuel - 2) {
                // Almost there - coast through to top off
                car.executeAction(CAR_ACTIONS.COAST);
                this.state.lastAction = 'refueling_coast';
                return true;
            } else {
                // We have enough fuel - exit refueling mode
                this.state.refuelingStartFuel = null;
                this.state.refuelingTicks = 0;
                // Continue with normal racing
            }
        } else {
            // Not in fuel zone - reset refueling tracking
            if (this.state.refuelingStartFuel !== null) {
                this.state.refuelingStartFuel = null;
                this.state.refuelingTicks = 0;
            }
        }

        // Look for upcoming fuel zones if we need fuel
        if (state.car.fuel < fuelNeeded * 1.3) {
            for (let i = 0; i < Math.min(10, state.track.ahead.length); i++) {
                if (state.track.ahead[i].type === 'fuel_zone') {
                    // Check if the fuel zone has fuel in our lane or adjacent lanes
                    if (state.track.ahead[i].items) {
                        for (let item of state.track.ahead[i].items) {
                            if (item.type === 'fuel' && item.lanes) {
                                // If fuel is in our lane, coast to save fuel getting there
                                if (item.lanes.includes(state.car.lane)) {
                                    if (i === 0) {
                                        // Already in fuel zone - handled above
                                        continue;
                                    }
                                    car.executeAction(CAR_ACTIONS.COAST);
                                    this.state.lastAction = 'approaching_fuel';
                                    return true;
                                }

                                // Fuel is NOT in our lane - must change lanes!
                                // Fuel is only in lanes 1-2, never in lane 0
                                if (!item.lanes.includes(state.car.lane) && i <= 5) {
                                    // Find the closest lane with fuel
                                    let targetLane = null;
                                    let minDist = 3;
                                    for (let lane of item.lanes) {
                                        const dist = Math.abs(lane - state.car.lane);
                                        if (dist < minDist) {
                                            minDist = dist;
                                            targetLane = lane;
                                        }
                                    }

                                    // Change to the target lane for fuel
                                    if (targetLane !== null && targetLane !== state.car.lane) {
                                        // Check for obstacles first
                                        let safe = true;
                                        for (let j = 0; j <= Math.min(i, 2); j++) {
                                            if (state.track.ahead[j].obstacles) {
                                                for (let obs of state.track.ahead[j].obstacles) {
                                                    if (obs.lane === targetLane) {
                                                        safe = false;
                                                        break;
                                                    }
                                                }
                                            }
                                        }

                                        if (safe) {
                                            if (targetLane < state.car.lane) {
                                                car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                                            } else {
                                                car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                                            }
                                            this.state.lastAction = 'moving_to_fuel';
                                            return true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    selectOptimalSpeed(state, car) {
        const finalLap = state.car.lap === state.track.totalLaps;
        const gap = Math.abs(state.opponent.distance);
        const ahead = state.opponent.distance > 0;

        // Dynamic speed strategy
        if (finalLap && state.car.fuel > 5) {
            car.executeAction(CAR_ACTIONS.SPRINT);
            this.state.lastAction = 'final_sprint';
        } else if (state.car.isDrafting && state.car.fuel < 60) {
            // Drafting saves fuel - use it!
            car.executeAction(CAR_ACTIONS.COAST);
            this.state.lastAction = 'draft_coasting';
        } else if (state.car.fuel < 15) {
            car.executeAction(CAR_ACTIONS.COAST);
            this.state.lastAction = 'fuel_critical';
        } else if (ahead && gap > 100 && state.car.fuel > 40) {
            car.executeAction(CAR_ACTIONS.SPRINT);
            this.state.lastAction = 'catching_up';
        } else if (!ahead && gap > 100) {
            // Far ahead - conserve
            if (state.car.fuel > 60) {
                car.executeAction(CAR_ACTIONS.ACCELERATE);
            } else {
                car.executeAction(CAR_ACTIONS.COAST);
            }
            this.state.lastAction = 'maintaining_lead';
        } else {
            // Normal racing
            if (state.car.fuel > 50) {
                car.executeAction(CAR_ACTIONS.SPRINT);
            } else if (state.car.fuel > 30) {
                car.executeAction(CAR_ACTIONS.ACCELERATE);
            } else {
                car.executeAction(CAR_ACTIONS.COAST);
            }
            this.state.lastAction = 'racing';
        }
    }
}