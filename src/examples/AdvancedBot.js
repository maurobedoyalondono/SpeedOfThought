// AdvancedBot - Ultra intelligent AI with perfect decision making
// This bot uses advanced prediction, memory, and optimization
//
// TRACK ELEMENTS:
// - Orange cones = OBSTACLES (crash = 70% speed reduction + stun!)
// - Yellow zones = BOOST PADS (+20 km/h free speed!)
// - Green zones = FUEL ZONES (continuous refuel at 72L/sec)
// - Fuel zones only exist in lanes 1-2 (middle and right)
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
            refuelingTicks: 0,         // Track time spent refueling
            stuckBehindTicks: 0,       // Track how long stuck behind opponent
            lastOpponentDistance: null, // Track opponent distance changes
            stuckThreshold: 90         // Ticks before considering stuck (1.5 seconds)
        };

        this.strategy = "balanced";
        this.PREFERRED_LANE = 0; // Inner lane is mathematically superior
    }

    decide(state, car) {
        this.state.tickCount++;

        // Update memory systems
        this.updateMemory(state);

        // Track if stuck behind opponent
        this.trackStuckBehind(state);

        // CRITICAL PRIORITY 1: Unstuck maneuver if trapped behind opponent
        if (this.isStuckBehind(state)) {
            const overtakeLane = this.findOvertakeLane(state);
            if (overtakeLane !== null && overtakeLane !== state.car.lane) {
                if (overtakeLane < state.car.lane) {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                } else {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                }
                this.state.lastAction = 'unstuck_overtake';
                this.state.stuckBehindTicks = 0; // Reset stuck counter
                return;
            }
        }

        // CRITICAL PRIORITY 2: NEVER HIT OBSTACLES
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

        // PRIORITY 3: Prepare for upcoming obstacles (look ahead)
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

        // PRIORITY 4: Grab nearby boost pads (but ONLY if safe!)
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
            
            // Clear boost pad memory for the new lap (keep only current lap entries)
            this.memory.boostPads = this.memory.boostPads.filter(padId => 
                padId.startsWith(`${state.car.lap}_`)
            );
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

    trackStuckBehind(state) {
        const gap = state.opponent.distance;
        const inSameLane = state.opponent.lane === state.car.lane;
        const closeBehind = gap > 0 && gap < 8; // Very close behind (within 8m)

        // Check if we're stuck: same lane, close behind, and not making progress
        if (inSameLane && closeBehind) {
            // Check if distance hasn't improved
            if (this.state.lastOpponentDistance !== null) {
                const distanceChange = gap - this.state.lastOpponentDistance;
                // If we're not getting closer or getting further behind, increment stuck counter
                if (distanceChange >= -0.5) { // Not gaining significantly
                    this.state.stuckBehindTicks++;
                } else {
                    // We're gaining on opponent, reset counter
                    this.state.stuckBehindTicks = Math.max(0, this.state.stuckBehindTicks - 5);
                }
            }
        } else {
            // Not in stuck situation, reset counter gradually
            this.state.stuckBehindTicks = Math.max(0, this.state.stuckBehindTicks - 3);
        }

        this.state.lastOpponentDistance = gap;
    }

    isStuckBehind(state) {
        return this.state.stuckBehindTicks > this.state.stuckThreshold;
    }

    findOvertakeLane(state) {
        const currentLane = state.car.lane;
        const opponentLane = state.opponent.lane;
        const lanes = [0, 1, 2];
        
        // Get available lanes (not current lane and not opponent's lane)
        const availableLanes = lanes.filter(lane => 
            lane !== currentLane && lane !== opponentLane
        );

        // Score each available lane for overtaking
        let bestLane = null;
        let bestScore = -999;

        for (let lane of availableLanes) {
            let score = 0;

            // Check if lane is clear for next 5 segments (overtaking space)
            let clear = true;
            for (let i = 0; i < Math.min(5, state.track.ahead.length); i++) {
                if (state.track.ahead[i].obstacles) {
                    for (let obs of state.track.ahead[i].obstacles) {
                        if (obs.lane === lane) {
                            clear = false;
                            break;
                        }
                    }
                }
                if (!clear) break;
            }
            
            if (!clear) continue;

            // Prefer inner lanes (shorter distance) but not too strongly when overtaking
            score += (2 - lane) * 2;

            // Prefer lanes closer to current position to minimize lane changes
            score -= Math.abs(lane - currentLane) * 3;

            // Bonus for overtaking on the left (traditional racing)
            if (lane < opponentLane) {
                score += 5;
            }

            // Consider fuel zones - avoid changing to lanes without fuel if we need fuel soon
            const lapsRemaining = state.track.totalLaps - state.car.lap + 1;
            const avgFuelPerLap = this.getAverageFuelPerLap();
            const fuelNeeded = avgFuelPerLap * lapsRemaining;
            
            if (state.car.fuel < fuelNeeded * 1.4 && lane === 0) {
                // Lane 0 has no fuel, penalize if we might need fuel
                score -= 8;
            }

            if (score > bestScore) {
                bestScore = score;
                bestLane = lane;
            }
        }

        return bestLane;
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

                // Check if already collected (include lap number so it resets each lap)
                const padId = `${state.car.lap}_${Math.floor((state.car.position + i * 10) / 10)}_${pad.lane}`;
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

            // Only change lanes for good drafting, but avoid if too close
            // Let the stuck detection handle very close situations
            if (effectiveness > 0.4 && 
                state.opponent.lane !== state.car.lane && 
                gap > 8) { // Don't draft if too close - let overtake logic handle it
                
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
        const REFUEL_RATE = 1.2; // Updated to match new rate: Liters per tick
        const REFUEL_PER_SECOND = REFUEL_RATE * 60; // 72 L/second

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
            if (state.car.fuel < targetFuel - 15) {
                // Still need significant fuel - BRAKE hard to maximize refuel time
                car.executeAction(CAR_ACTIONS.BRAKE);
                this.state.lastAction = 'refueling_brake';
                return true;
            } else if (state.car.fuel < targetFuel - 5) {
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
                                // If fuel is in our lane, brake early to maximize refuel time
                                if (item.lanes.includes(state.car.lane)) {
                                    if (i === 0) {
                                        // Already in fuel zone - handled above
                                        continue;
                                    }
                                    // Start braking 2 segments before fuel zone for better positioning
                                    if (i <= 2) {
                                        car.executeAction(CAR_ACTIONS.BRAKE);
                                        this.state.lastAction = 'braking_for_fuel';
                                        return true;
                                    } else {
                                        car.executeAction(CAR_ACTIONS.COAST);
                                        this.state.lastAction = 'approaching_fuel';
                                        return true;
                                    }
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
        const justOvertook = this.state.lastAction === 'unstuck_overtake';

        // Dynamic speed strategy
        if (finalLap && state.car.fuel > 5) {
            car.executeAction(CAR_ACTIONS.SPRINT);
            this.state.lastAction = 'final_sprint';
        } else if (justOvertook && state.car.fuel > 20) {
            // Just made overtake maneuver - sprint to complete the pass
            car.executeAction(CAR_ACTIONS.SPRINT);
            this.state.lastAction = 'overtake_sprint';
        } else if (this.state.stuckBehindTicks > this.state.stuckThreshold * 0.7 && state.car.fuel > 25) {
            // Getting close to stuck threshold - be more aggressive
            car.executeAction(CAR_ACTIONS.SPRINT);
            this.state.lastAction = 'aggressive_passing';
        } else if (state.car.isDrafting && state.car.fuel < 60 && gap > 8) {
            // Drafting saves fuel - use it! But only if not too close
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