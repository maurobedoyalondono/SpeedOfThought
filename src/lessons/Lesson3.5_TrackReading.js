// LESSON 3.5: Track Reading and Lookahead Strategy
// Goal: Learn to read the track ahead and plan your moves!

class PlayerBot {
    constructor() {
        this.trackMemory = new Map(); // Remember what we've seen
        this.planningHorizon = 5; // How many segments to look ahead
        console.log("Lesson 3.5: Learning track reading and planning!");
    }

    decide(state, car) {
        // CONCEPT 1: Understanding the track data using new helper methods
        const obstaclesAhead = state.getObstaclesAhead();
        const fuelStationsAhead = state.getFuelStationsAhead();
        const boostPadsAhead = state.getBoostPadsAhead();
        console.log("📊 Track analysis - Obstacles:", obstaclesAhead.length, "Fuel stations:", fuelStationsAhead.length, "Boost pads:", boostPadsAhead.length);
        
        // Let's examine what we can see
        this.analyzeTrackAhead(state);

        // CONCEPT 2: Categorize upcoming challenges
        const roadMap = this.createRoadMap(state);
        console.log("🗺️ Road map:", roadMap.summary);

        // CONCEPT 3: Multi-step planning
        const plan = this.planActions(roadMap, state);
        console.log("📋 Action plan:", plan.description);

        // CONCEPT 4: Execute the planned action
        this.executePlan(plan, state, car);

        // CONCEPT 5: Learn from what we see
        this.updateTrackMemory(state);
    }

    analyzeTrackAhead(state) {
        // Use new helper methods to analyze track elements
        const obstaclesAhead = state.getObstaclesAhead();
        const fuelStationsAhead = state.getFuelStationsAhead();
        const boostPadsAhead = state.getBoostPadsAhead();

        // Log obstacles ahead
        obstaclesAhead.forEach(obstacle => {
            console.log(`🚧 Obstacle in lane ${obstacle.lane} at ${obstacle.distance}m ahead`);
        });

        // Log fuel stations ahead
        fuelStationsAhead.forEach(station => {
            console.log(`⛽ Fuel station at ${station.distance}m ahead - remember: lanes 1-2 only!`);
        });

        // Log boost pads ahead
        boostPadsAhead.forEach(boostPad => {
            console.log(`⚡ Boost pad in lane ${boostPad.lane} at ${boostPad.distance}m ahead`);
        });

        // Check current lane status
        if (state.hasObstacleAhead()) {
            console.log(`⚠️ Obstacle directly ahead in our lane!`);
        }
        if (state.hasFuelStationAhead()) {
            console.log(`⛽ Fuel station available in our lane!`);
        }
        if (state.hasBoostPadAhead()) {
            console.log(`⚡ Boost pad available in our lane!`);
        }
    }

    createRoadMap(state) {
        const roadMap = {
            obstacles: [],
            boostPads: [],
            fuelZones: [],
            summary: ""
        };

        // Use new helper methods to get track elements
        const obstaclesAhead = state.getObstaclesAhead();
        const fuelStationsAhead = state.getFuelStationsAhead();
        const boostPadsAhead = state.getBoostPadsAhead();

        // Track obstacles with enhanced analysis
        obstaclesAhead.forEach(obstacle => {
            roadMap.obstacles.push({
                lane: obstacle.lane,
                distance: obstacle.distance,
                priority: this.calculateObstaclePriority(obstacle, state, obstacle.distance)
            });
        });

        // Track boost opportunities
        boostPadsAhead.forEach(boostPad => {
            roadMap.boostPads.push({
                lane: boostPad.lane,
                distance: boostPad.distance,
                worth: this.calculateBoostWorth(boostPad, state, boostPad.distance)
            });
        });

        // Track fuel opportunities
        fuelStationsAhead.forEach(station => {
            roadMap.fuelZones.push({
                distance: station.distance,
                accessible: state.car.lane === 1 || state.car.lane === 2,
                urgency: this.calculateFuelUrgency(state)
            });
        });

        // Create summary
        roadMap.summary = this.createSummary(roadMap);
        return roadMap;
    }

    calculateObstaclePriority(obstacle, state, distance) {
        let priority = 0;
        
        // High priority if in our lane
        if (obstacle.lane === state.car.lane) {
            priority += 10;
        }
        
        // Higher priority if close
        priority += Math.max(0, 5 - distance/10);
        
        // Consider our current speed (less time to react at high speed)
        if (state.car.speed > 200) {
            priority += 2;
        }
        
        return priority;
    }

    calculateBoostWorth(boostPad, state, distance) {
        let worth = 5; // Base worth

        // More valuable if we're going slow
        if (state.car.speed < 150) {
            worth += 3;
        }

        // Less valuable if very far away
        if (distance > 30) {
            worth -= 2;
        }

        // Consider lane change difficulty and safety
        const targetLane = boostPad.lane;
        if (state.isLaneSafe(targetLane)) {
            const laneDistance = Math.abs(targetLane - state.car.lane);
            worth -= laneDistance; // Closer lanes are easier
        } else {
            worth -= 5; // Heavy penalty if lane is not safe
        }

        return Math.max(0, worth);
    }

    calculateFuelUrgency(state) {
        const fuelPercentage = state.car.fuel / 100;
        
        if (fuelPercentage < 0.2) return "CRITICAL";
        if (fuelPercentage < 0.4) return "HIGH";
        if (fuelPercentage < 0.6) return "MEDIUM";
        return "LOW";
    }

    createSummary(roadMap) {
        const parts = [];
        
        if (roadMap.obstacles.length > 0) {
            const highPriorityObstacles = roadMap.obstacles.filter(obs => obs.priority > 7);
            if (highPriorityObstacles.length > 0) {
                parts.push(`${highPriorityObstacles.length} urgent obstacle(s)`);
            } else {
                parts.push(`${roadMap.obstacles.length} obstacle(s) ahead`);
            }
        }
        
        if (roadMap.boostPads.length > 0) {
            const worthwhileBoosts = roadMap.boostPads.filter(boost => boost.worth > 3);
            parts.push(`${worthwhileBoosts.length} good boost pad(s)`);
        }
        
        if (roadMap.fuelZones.length > 0) {
            const urgentFuel = roadMap.fuelZones.filter(fuel => fuel.urgency === "CRITICAL" || fuel.urgency === "HIGH");
            if (urgentFuel.length > 0) {
                parts.push(`${urgentFuel.length} needed fuel zone(s)`);
            } else {
                parts.push(`${roadMap.fuelZones.length} fuel zone(s) available`);
            }
        }
        
        return parts.length > 0 ? parts.join(", ") : "clear road ahead";
    }

    planActions(roadMap, state) {
        // Priority system for decision making
        const plan = {
            action: null,
            description: "maintaining course",
            priority: 0
        };

        // PRIORITY 1: Critical obstacles (immediate danger)
        if (state.hasObstacleAhead()) {
            plan.action = this.chooseAvoidanceAction(null, state);
            plan.description = `avoiding immediate obstacle in our lane`;
            plan.priority = 10;
        } else {
            const criticalObstacles = roadMap.obstacles.filter(obs => obs.priority > 8 && obs.distance <= 10);
            if (criticalObstacles.length > 0) {
                const obstacle = criticalObstacles[0];
                if (obstacle.lane === state.car.lane) {
                    plan.action = this.chooseAvoidanceAction(obstacle, state);
                    plan.description = `avoiding critical obstacle in lane ${obstacle.lane}`;
                    plan.priority = 10;
                }
            }
        }

        // PRIORITY 2: Fuel emergency
        if (state.car.fuel < 25) {
            if (state.hasFuelStationAhead() && plan.priority < 8) {
                plan.action = CAR_ACTIONS.BRAKE; // Slow down for fuel
                plan.description = "slowing for fuel zone in our lane";
                plan.priority = 8;
            } else if (state.car.lane === 0 && plan.priority < 7) {
                // Move to fuel-accessible lane
                if (state.isLaneSafe(1)) {
                    plan.action = CAR_ACTIONS.CHANGE_LANE_RIGHT;
                    plan.description = "moving to fuel-accessible lane";
                    plan.priority = 7;
                }
            } else if (state.car.lane === 2 && !state.hasFuelStationAhead() && plan.priority < 7) {
                // Already in fuel lane but no station ahead, stay put
                const accessibleFuel = roadMap.fuelZones.filter(fuel => fuel.distance <= 30);
                if (accessibleFuel.length > 0) {
                    plan.action = CAR_ACTIONS.BRAKE;
                    plan.description = "slowing for upcoming fuel zone";
                    plan.priority = 7;
                }
            }
        }

        // PRIORITY 3: High-value boost pads
        if (state.hasBoostPadAhead() && plan.priority < 6) {
            plan.action = CAR_ACTIONS.ACCELERATE; // Speed up to collect boost
            plan.description = "collecting boost pad in our lane";
            plan.priority = 6;
        } else {
            const valuableBoosts = roadMap.boostPads.filter(boost => boost.worth > 4 && boost.distance <= 20);
            if (valuableBoosts.length > 0 && plan.priority < 6) {
                const boost = valuableBoosts[0];
                if (boost.lane !== state.car.lane && state.isLaneSafe(boost.lane)) {
                    plan.action = boost.lane < state.car.lane ?
                        CAR_ACTIONS.CHANGE_LANE_LEFT : CAR_ACTIONS.CHANGE_LANE_RIGHT;
                    plan.description = `moving to boost pad in lane ${boost.lane}`;
                    plan.priority = 6;
                }
            }
        }

        // PRIORITY 4: Future obstacle preparation
        const futureObstacles = roadMap.obstacles.filter(obs => obs.distance > 10 && obs.distance <= 30);
        if (futureObstacles.length > 0 && plan.priority < 4) {
            const obstacle = futureObstacles[0];
            if (obstacle.lane === state.car.lane) {
                plan.action = this.chooseAvoidanceAction(obstacle, state);
                plan.description = `preparing for obstacle at ${obstacle.distance}m`;
                plan.priority = 4;
            }
        }

        // DEFAULT: Normal racing based on fuel
        if (plan.priority === 0) {
            if (state.car.fuel > 60) {
                plan.action = CAR_ACTIONS.ACCELERATE;
                plan.description = "normal racing - good fuel";
            } else if (state.car.fuel > 30) {
                plan.action = CAR_ACTIONS.COAST;
                plan.description = "fuel conservation mode";
            } else {
                plan.action = CAR_ACTIONS.COAST;
                plan.description = "critical fuel conservation";
            }
        }

        return plan;
    }

    chooseAvoidanceAction(obstacle, state) {
        // Smart obstacle avoidance using safe lane detection
        const currentLane = state.car.lane;

        // If we have fuel for jumping and it's immediate
        if (state.car.fuel > 15 && obstacle && obstacle.distance <= 0) {
            return CAR_ACTIONS.JUMP;
        }

        // Find the safest available lane
        const lanes = [0, 1, 2];
        const safeLanes = lanes.filter(lane => lane !== currentLane && state.isLaneSafe(lane));

        if (safeLanes.length === 0) {
            // No safe lanes available, try jumping if we have fuel
            if (state.car.fuel > 10) {
                return CAR_ACTIONS.JUMP;
            } else {
                return CAR_ACTIONS.BRAKE; // Last resort
            }
        }

        // Choose the best safe lane
        let bestLane;
        if (currentLane === 0) {
            bestLane = safeLanes.includes(1) ? 1 : 2;
        } else if (currentLane === 2) {
            bestLane = safeLanes.includes(1) ? 1 : 0;
        } else {
            // Middle lane - prioritize based on fuel situation
            if (state.car.fuel < 40 && safeLanes.includes(2)) {
                bestLane = 2; // Stay in fuel lanes
            } else if (safeLanes.includes(0)) {
                bestLane = 0; // Go to fastest lane
            } else {
                bestLane = safeLanes[0]; // Take any safe lane
            }
        }

        return bestLane < currentLane ? CAR_ACTIONS.CHANGE_LANE_LEFT : CAR_ACTIONS.CHANGE_LANE_RIGHT;
    }

    executePlan(plan, state, car) {
        if (plan.action) {
            car.executeAction(plan.action);
            console.log(`🎯 Executing: ${plan.description}`);
        } else {
            // Fallback action
            car.executeAction(CAR_ACTIONS.ACCELERATE);
            console.log("🎯 Default action: accelerating");
        }
    }

    updateTrackMemory(state) {
        // Store information about track segments we've seen
        const currentPosition = Math.floor(state.car.position / 10) * 10; // Round to segment
        const key = `${state.car.lap}_${currentPosition}`;
        
        // Store current track situation using new helper methods
        const currentTrackInfo = {
            obstacles: state.getObstaclesAhead().slice(0, 3), // Store next 3 obstacles
            fuelStations: state.getFuelStationsAhead().slice(0, 2), // Store next 2 fuel stations
            boostPads: state.getBoostPadsAhead().slice(0, 3), // Store next 3 boost pads
            seenAt: Date.now()
        };

        this.trackMemory.set(key, currentTrackInfo);

        // CHALLENGE: Use memory for better planning
        // if (this.trackMemory.size > 0) {
        //     console.log("Track memory contains", this.trackMemory.size, "segments");
        // }
    }
}

/*
LESSON 3.5: TRACK READING MASTERY

CORE CONCEPTS:

1. LOOKAHEAD ANALYSIS USING NEW HELPER METHODS:
   - state.getObstaclesAhead() returns array of all obstacles ahead
   - state.getFuelStationsAhead() returns array of all fuel stations ahead
   - state.getBoostPadsAhead() returns array of all boost pads ahead
   - Plan based on distances of these elements (usually 30-50 meters)
   - Consider your reaction time at current speed

2. TRACK ELEMENTS USING HELPER METHODS:
   - state.hasObstacleAhead() - true if obstacle in current lane
   - state.hasFuelStationAhead() - true if fuel station in current lane
   - state.hasBoostPadAhead() - true if boost pad in current lane
   - state.isLaneSafe(lane) - true if can safely change to that lane
   - Each element has lane and distance properties

3. INFORMATION PROCESSING:
   - Categorize threats vs opportunities
   - Calculate priorities and urgency
   - Plan multi-step sequences
   - Adapt plan based on changing conditions

STRATEGIC FRAMEWORKS:

1. THREAT ASSESSMENT:
   - Immediate (0-10m): React now
   - Short-term (10-30m): Prepare now
   - Medium-term (30-50m): Plan now
   - Long-term (50m+): Remember for later

2. OPPORTUNITY EVALUATION:
   - Benefit value (speed, fuel, position)
   - Cost to access (lane changes, fuel)
   - Risk involved (obstacle conflicts)
   - Time sensitivity (how soon must decide)

3. DECISION MATRIX:
   Priority 10: Life-threatening obstacles
   Priority 8: Fuel emergencies
   Priority 6: High-value opportunities
   Priority 4: Future preparation
   Priority 2: Optimization
   Priority 0: Default behavior

ADVANCED TECHNIQUES:

1. PATTERN RECOGNITION:
   - Track repeating obstacle patterns
   - Remember fuel zone locations
   - Identify boost pad clusters
   - Map optimal racing lines

2. PREDICTIVE ANALYSIS:
   - Estimate arrival times at features
   - Calculate fuel consumption to targets
   - Predict opponent movements
   - Plan resource usage

3. CONTINGENCY PLANNING:
   - Primary plan + backup options
   - If-then decision trees
   - Risk mitigation strategies
   - Adaptive replanning

PRACTICAL APPLICATIONS:

1. "I see an obstacle in 30m in my lane and a fuel zone in 40m in lane 2"
   → Plan: Change to lane 2 now to avoid obstacle AND access fuel

2. "Boost pad in lane 0 at 20m but I'm low on fuel"
   → Analysis: Lane 0 has no fuel zones, skip this boost

3. "Multiple obstacles spread across all lanes at 50m"
   → Strategy: Use boost charge to build speed for jump sequence

DEBUGGING YOUR LOOKAHEAD:

console.log("Obstacles ahead:", state.getObstaclesAhead().length);
console.log("Fuel stations ahead:", state.getFuelStationsAhead().length);
console.log("Boost pads ahead:", state.getBoostPadsAhead().length);
console.log("Obstacle in lane?", state.hasObstacleAhead());
console.log("Lane 0 safe?", state.isLaneSafe(0));

Track what you see:
- How many obstacles vs opportunities?
- Which lanes are safest?
- Where are the fuel zones?
- What's the optimal path?

MENTAL MODEL:

Think like a chess player:
1. Assess the current position
2. Identify immediate threats
3. Look for opportunities
4. Plan several moves ahead
5. Execute the best first move
6. Reassess after each move

Remember: The best racers don't just react to what's happening,
they anticipate what's coming and position themselves accordingly!

CHALLENGE EXERCISES:

1. Complete a lap without any emergency maneuvers
2. Collect every boost pad while avoiding all obstacles
3. Plan fuel stops 100 meters in advance
4. Navigate complex obstacle sequences smoothly
5. Win races through superior planning, not just speed
*/