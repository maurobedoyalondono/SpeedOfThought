// LESSON 6: Competitive Psychology and Meta-Game
// Goal: Master the mental game and outsmart human opponents!

class PlayerBot {
    constructor() {
        this.opponentProfile = {
            aggression: 0.5,        // How aggressive are they? (0-1)
            consistency: 0.5,       // How consistent are they? (0-1)  
            fuelManagement: 0.5,    // How well do they manage fuel? (0-1)
            adaptability: 0.5,      // How quickly do they adapt? (0-1)
            patterns: [],           // What patterns have we noticed?
            weaknesses: [],         // What weaknesses can we exploit?
            strengths: []           // What strengths should we respect?
        };
        
        this.psychWarfare = {
            intimidationLevel: 0,   // How much are we intimidating them?
            pressureApplied: 0,     // How much pressure are we applying?
            misdirection: false,    // Are we using misdirection?
            mindGames: []           // Track our psychological tactics
        };

        this.metaStrategy = "analysis"; // Current meta-strategy
        this.analysisPhase = true;      // Are we still learning about opponent?
        this.tickCount = 0;
        
        console.log("🧠 Lesson 6: Competitive Psychology - Reading and manipulating opponents!");
    }

    decide(state, car) {
        this.tickCount++;

        // CONCEPT 1: Opponent Analysis and Profiling
        this.analyzeOpponent(state);

        // CONCEPT 2: Psychological Pressure Application
        this.applyPsychologicalPressure(state);

        // CONCEPT 3: Meta-Game Strategy Selection
        this.selectMetaStrategy(state);

        // CONCEPT 4: Adaptive Counter-Strategies
        this.executeCounterStrategy(state, car);

        // CONCEPT 5: Information Warfare and Misdirection
        this.deployMisdirection(state, car);

        // Report psychological state every 5 seconds
        if (this.tickCount % 300 === 0) {
            this.reportPsychologicalProfile();
        }
    }

    analyzeOpponent(state) {
        const opponent = state.opponent;
        
        // Analyze opponent behavior patterns
        if (this.tickCount % 60 === 0) { // Every second
            // Aggression analysis
            if (opponent.speed > 200) {
                this.opponentProfile.aggression += 0.01;
            } else if (opponent.speed < 150) {
                this.opponentProfile.aggression -= 0.01;
            }

            // Consistency analysis (based on speed variation)
            if (!this.lastOpponentSpeed) this.lastOpponentSpeed = opponent.speed;
            const speedVariation = Math.abs(opponent.speed - this.lastOpponentSpeed);
            if (speedVariation > 20) {
                this.opponentProfile.consistency -= 0.01; // Inconsistent
            } else if (speedVariation < 5) {
                this.opponentProfile.consistency += 0.01; // Very consistent
            }
            this.lastOpponentSpeed = opponent.speed;

            // Fuel management analysis (inferred from behavior)
            const raceProgress = (state.car.lap - 1 + state.car.position / state.track.lapDistance) / state.track.totalLaps;
            if (raceProgress > 0.8 && opponent.speed > 220) {
                this.opponentProfile.fuelManagement += 0.02; // Good fuel management to sprint at end
            }

            // Clamp all values between 0 and 1
            Object.keys(this.opponentProfile).forEach(key => {
                if (typeof this.opponentProfile[key] === 'number') {
                    this.opponentProfile[key] = Math.max(0, Math.min(1, this.opponentProfile[key]));
                }
            });
        }

        // Pattern detection
        this.detectBehaviorPatterns(state);
    }

    detectBehaviorPatterns(state) {
        const opponent = state.opponent;
        
        // Track opponent lane preferences
        if (!this.laneUsagePattern) this.laneUsagePattern = [0, 0, 0];
        this.laneUsagePattern[opponent.lane]++;

        // Detect if opponent copies our moves (follower behavior)
        if (this.lastMyLane !== undefined && this.lastOpponentLane !== undefined) {
            const myLaneChange = Math.abs(state.car.lane - this.lastMyLane);
            const opponentLaneChange = Math.abs(opponent.lane - this.lastOpponentLane);
            
            if (myLaneChange > 0 && opponentLaneChange > 0) {
                this.opponentProfile.patterns.push("FOLLOWER");
                console.log("🎯 DETECTED: Opponent copies our lane changes");
            }
        }

        // Detect drafting behavior
        const distance = Math.abs(opponent.distance);
        if (distance < 25 && distance > 5 && opponent.lane === state.car.lane) {
            this.opponentProfile.patterns.push("DRAFTER");
            console.log("🎯 DETECTED: Opponent seeks drafting positions");
        }

        // Detect panic behavior (erratic movement when pressured)
        if (this.psychWarfare.pressureApplied > 0.7 && this.opponentProfile.consistency < 0.3) {
            this.opponentProfile.weaknesses.push("PANIC_UNDER_PRESSURE");
            console.log("🎯 DETECTED: Opponent panics under pressure!");
        }

        this.lastMyLane = state.car.lane;
        this.lastOpponentLane = opponent.lane;
    }

    applyPsychologicalPressure(state) {
        const opponent = state.opponent;
        const distance = opponent.distance;
        const gap = Math.abs(distance);

        // Pressure technique 1: Aggressive following
        if (distance > 0 && gap < 30) { // They're ahead but close
            this.psychWarfare.pressureApplied = Math.min(1, this.psychWarfare.pressureApplied + 0.01);
            
            // Stay close but not too close - create psychological pressure
            if (gap > 15 && state.car.fuel > 40) {
                console.log("😈 PSYCHOLOGICAL PRESSURE: Staying aggressively close");
                return CAR_ACTIONS.SPRINT;
            }
        }

        // Pressure technique 2: Strategic blocking
        if (distance < 0 && gap < 20) { // They're behind and catching up
            if (opponent.lane !== state.car.lane) {
                console.log("🚧 PSYCHOLOGICAL PRESSURE: Moving to block opponent");
                // Move to their lane to block
                if (opponent.lane < state.car.lane) {
                    return CAR_ACTIONS.CHANGE_LANE_LEFT;
                } else {
                    return CAR_ACTIONS.CHANGE_LANE_RIGHT;
                }
            }
        }

        // Pressure technique 3: Fake-outs and misdirection
        if (this.tickCount % 180 === 0 && gap < 50) { // Every 3 seconds when close
            console.log("🎭 PSYCHOLOGICAL PRESSURE: Fake lane change to confuse opponent");
            this.psychWarfare.misdirection = true;
        }

        return null; // No pressure action this tick
    }

    selectMetaStrategy(state) {
        const profile = this.opponentProfile;
        const raceProgress = (state.car.lap - 1) / state.track.totalLaps;

        // Early race: Analysis and positioning
        if (raceProgress < 0.3) {
            this.metaStrategy = "analysis";
            console.log("🔍 META-STRATEGY: Analysis phase - learning opponent");
        }
        // Mid race: Pressure and manipulation  
        else if (raceProgress < 0.7) {
            if (profile.aggression > 0.7) {
                this.metaStrategy = "patience"; // Let aggressive opponents burn fuel
                console.log("⏳ META-STRATEGY: Patience - let aggressive opponent burn out");
            } else if (profile.consistency > 0.8) {
                this.metaStrategy = "disruption"; // Disrupt consistent opponents
                console.log("💥 META-STRATEGY: Disruption - break opponent's rhythm");
            } else {
                this.metaStrategy = "pressure";
                console.log("🔥 META-STRATEGY: Pressure - exploit inconsistency");
            }
        }
        // End game: All-out attack or defense
        else {
            if (state.opponent.distance > 0) {
                this.metaStrategy = "desperation"; // Behind, need to catch up
                console.log("🚨 META-STRATEGY: Desperation attack - everything to win");
            } else {
                this.metaStrategy = "protection"; // Ahead, protect lead
                console.log("🛡️ META-STRATEGY: Protection - defend the lead");
            }
        }
    }

    executeCounterStrategy(state, car) {
        const pressureAction = this.applyPsychologicalPressure(state);
        if (pressureAction) {
            car.executeAction(pressureAction);
            return;
        }

        switch (this.metaStrategy) {
            case "analysis":
                this.executeAnalysisStrategy(state, car);
                break;
            case "patience":
                this.executePatienceStrategy(state, car);
                break;
            case "disruption":
                this.executeDisruptionStrategy(state, car);
                break;
            case "pressure":
                this.executePressureStrategy(state, car);
                break;
            case "desperation":
                this.executeDesperationStrategy(state, car);
                break;
            case "protection":
                this.executeProtectionStrategy(state, car);
                break;
            default:
                this.executeBalancedStrategy(state, car);
        }
    }

    executeAnalysisStrategy(state, car) {
        // Conservative racing while we learn about opponent
        if (state.car.fuel > 50) {
            car.executeAction(CAR_ACTIONS.ACCELERATE);
        } else {
            car.executeAction(CAR_ACTIONS.COAST);
        }
        console.log("🔍 ANALYSIS: Conservative racing while learning opponent patterns");
    }

    executePatienceStrategy(state, car) {
        // Let aggressive opponent waste fuel, stay efficient
        if (state.car.isDrafting) {
            car.executeAction(CAR_ACTIONS.COAST); // Maximum fuel savings
            console.log("⏳ PATIENCE: Drafting efficiently while opponent wastes fuel");
        } else if (state.car.fuel > 40) {
            car.executeAction(CAR_ACTIONS.ACCELERATE);
        } else {
            car.executeAction(CAR_ACTIONS.COAST);
        }
    }

    executeDisruptionStrategy(state, car) {
        // Disrupt consistent opponent's rhythm
        const shouldDisrupt = this.tickCount % 120 === 0; // Every 2 seconds
        
        if (shouldDisrupt && Math.abs(state.opponent.distance) < 40) {
            // Change lanes randomly to disrupt their strategy
            const randomLane = Math.floor(Math.random() * 3);
            if (randomLane !== state.car.lane) {
                if (randomLane < state.car.lane) {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                } else {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                }
                console.log("💥 DISRUPTION: Random lane change to break opponent's rhythm");
                return;
            }
        }

        // Normal racing otherwise
        if (state.car.fuel > 50) {
            car.executeAction(CAR_ACTIONS.ACCELERATE);
        } else {
            car.executeAction(CAR_ACTIONS.COAST);
        }
    }

    executePressureStrategy(state, car) {
        // Apply maximum pressure on inconsistent opponent
        const gap = Math.abs(state.opponent.distance);
        
        if (gap < 30 && state.car.fuel > 30) {
            car.executeAction(CAR_ACTIONS.SPRINT);
            console.log("🔥 PRESSURE: Sprinting to maintain pressure on opponent");
        } else if (state.car.fuel > 40) {
            car.executeAction(CAR_ACTIONS.ACCELERATE);
        } else {
            car.executeAction(CAR_ACTIONS.COAST);
        }
    }

    executeDesperationStrategy(state, car) {
        // All-out attack - use everything
        if (state.car.boosts > 0 && state.car.fuel > 15) {
            car.executeAction(CAR_ACTIONS.BOOST);
            console.log("🚨 DESPERATION: Using boost charge in final push!");
        } else if (state.car.fuel > 10) {
            car.executeAction(CAR_ACTIONS.SPRINT);
            console.log("🚨 DESPERATION: All-out sprint to catch up!");
        } else {
            car.executeAction(CAR_ACTIONS.ACCELERATE);
        }
    }

    executeProtectionStrategy(state, car) {
        // Protect lead efficiently
        const gap = Math.abs(state.opponent.distance);
        
        if (gap < 20) { // They're close - defend actively
            if (state.car.fuel > 30) {
                car.executeAction(CAR_ACTIONS.ACCELERATE);
                console.log("🛡️ PROTECTION: Defending lead against close opponent");
            } else {
                car.executeAction(CAR_ACTIONS.COAST);
            }
        } else { // Safe lead - conserve
            car.executeAction(CAR_ACTIONS.COAST);
            console.log("🛡️ PROTECTION: Conserving fuel with safe lead");
        }
    }

    executeBalancedStrategy(state, car) {
        // Fallback balanced strategy
        if (state.car.fuel > 60) {
            car.executeAction(CAR_ACTIONS.ACCELERATE);
        } else if (state.car.fuel > 30) {
            car.executeAction(CAR_ACTIONS.COAST);
        } else {
            car.executeAction(CAR_ACTIONS.COAST);
        }
    }

    deployMisdirection(state, car) {
        // Advanced psychological tactics
        if (this.psychWarfare.misdirection) {
            // Execute fake-out maneuver
            console.log("🎭 MISDIRECTION: Executing fake-out maneuver");
            this.psychWarfare.misdirection = false;
        }
    }

    reportPsychologicalProfile() {
        console.log("\n🧠 === PSYCHOLOGICAL PROFILE ===");
        console.log("Opponent Aggression:", (this.opponentProfile.aggression * 100).toFixed(0) + "%");
        console.log("Opponent Consistency:", (this.opponentProfile.consistency * 100).toFixed(0) + "%");
        console.log("Fuel Management:", (this.opponentProfile.fuelManagement * 100).toFixed(0) + "%");
        console.log("Detected Patterns:", this.opponentProfile.patterns.slice(-3)); // Last 3 patterns
        console.log("Weaknesses Found:", this.opponentProfile.weaknesses.slice(-2)); // Last 2 weaknesses
        console.log("Current Meta-Strategy:", this.metaStrategy);
        console.log("Pressure Applied:", (this.psychWarfare.pressureApplied * 100).toFixed(0) + "%");
        
        const mostUsedLane = this.laneUsagePattern ? 
            this.laneUsagePattern.indexOf(Math.max(...this.laneUsagePattern)) : "unknown";
        console.log("Opponent prefers lane:", mostUsedLane);
        console.log("=====================================\n");
    }
}

/*
LESSON 6: COMPETITIVE PSYCHOLOGY MASTERY

NEW HELPER METHODS FOR SAFE PSYCHOLOGICAL WARFARE:
- state.hasObstacleAhead(): Check safety before aggressive moves
- state.isLaneSafe(lane): Verify lane change safety during maneuvers
- state.hasFuelStationAhead(): Control fuel access strategically
- Always prioritize safety over psychological tactics!

CORE PSYCHOLOGICAL CONCEPTS:

1. OPPONENT PROFILING:
   - Aggression Level: Do they take risks or play safe?
   - Consistency: Are their actions predictable?
   - Fuel Management: Do they conserve or waste fuel?
   - Adaptability: How quickly do they change strategy?
   - Pattern Recognition: What habits do they have?

2. PSYCHOLOGICAL PRESSURE:
   - Aggressive Following: Stay close to create pressure
   - Strategic Blocking: Cut off their preferred lines
   - Intimidation: Make them doubt their decisions
   - Misdirection: Fake movements to confuse them

3. META-GAME STRATEGIES:
   - Analysis: Learn their patterns (early race)
   - Patience: Let aggressive opponents self-destruct
   - Disruption: Break consistent opponents' rhythm
   - Pressure: Exploit inconsistent opponents
   - Desperation: All-out attack when behind
   - Protection: Efficient defense when ahead

PSYCHOLOGICAL TACTICS:

1. THE INTIMIDATION GAME:
   - Stay just behind them in their mirrors
   - Make aggressive moves that look risky
   - Force them into defensive decisions
   - Create doubt about their fuel/speed

2. THE PATIENCE TRAP:
   - Let aggressive opponents waste fuel
   - Draft behind them while they work hard
   - Strike when they're forced to conserve
   - Capitalize on their mistakes

3. THE RHYTHM BREAKER:
   - Disrupt consistent opponents
   - Change lanes unpredictably
   - Vary your speed patterns
   - Force them out of their comfort zone

4. THE MIND READER:
   - Learn their preferred lanes
   - Anticipate their fuel stops
   - Predict their boost usage
   - Counter their strategies before they execute

ADVANCED PSYCHOLOGICAL WARFARE:

1. INFORMATION WARFARE:
   - Control what information they have
   - Use misdirection to hide your intentions
   - Fake fuel emergencies or mechanical issues
   - Make them think you're weaker/stronger than you are

2. EMOTIONAL MANIPULATION:
   - Frustrate them with defensive moves
   - Surprise them with unexpected aggression
   - Build false confidence then crush it
   - Create desperation through hopeless situations

3. ADAPTIVE COUNTER-STRATEGIES:
   - If they're aggressive → Be patient
   - If they're conservative → Apply pressure  
   - If they're consistent → Be disruptive
   - If they're erratic → Be steady
   - If they copy you → Use misdirection

READING OPPONENT PSYCHOLOGY:

AGGRESSIVE OPPONENTS:
- High speeds consistently
- Take risky overtakes
- Waste fuel on sprinting
- Counter: Patience, let them burn out

CONSERVATIVE OPPONENTS:
- Steady, predictable speeds
- Good fuel management
- Avoid risks
- Counter: Pressure, force mistakes

ERRATIC OPPONENTS:
- Inconsistent behavior
- Poor planning
- Emotional decisions
- Counter: Steady pressure, exploit mistakes

COPYCAT OPPONENTS:
- Mirror your moves
- Follow your strategy
- Lack original thinking
- Counter: Misdirection, fake-outs

PROFESSIONAL MIND GAMES:

1. "The Phantom Overtake":
   Move to overtake, force them defensive, return to original position

2. "The Fuel Fake":
   Act like you're conserving fuel, then sprint when they relax

3. "The Lane Trap":
   Fake moving to their preferred lane, force them to move first

4. "The Pressure Cooker":
   Stay close enough to pressure, not close enough to draft

5. "The Rope-a-Dope":
   Act weak/struggling, lull them into overconfidence, then strike

PSYCHOLOGICAL VICTORY CONDITIONS:

WIN CONDITION 1: FRUSTRATION
- Make them make emotional mistakes
- Capitalize on their frustration

WIN CONDITION 2: EXHAUSTION
- Force them to work harder than you
- Let them waste resources

WIN CONDITION 3: CONFUSION
- Make them doubt their strategy
- Create uncertainty about optimal play

WIN CONDITION 4: DESPERATION
- Put them in hopeless situations
- Force all-or-nothing moves

MENTAL FORTITUDE:

STAY CALM UNDER PRESSURE:
- Don't let them read your emotions
- Stick to optimal strategy regardless of their tactics
- Don't fall for their psychological games

MAINTAIN CONFIDENCE:
- Believe in your strategy
- Don't second-guess good decisions
- Learn from losses without emotional damage

ETHICAL CONSIDERATIONS:

Remember: This is competitive strategy in a game context.
Real-world racing has sportsmanship and safety rules.
Use these concepts to:
- Improve your strategic thinking
- Understand competitive psychology
- Develop better game AI
- Learn about human behavior patterns

SAFETY FIRST: Always use helper methods for safety checks!
Psychological warfare means nothing if you crash during execution.

THE ULTIMATE PSYCHOLOGICAL VICTORY:
Make your opponent beat themselves.
The best psychological warfare is when your opponent
makes the mistakes that cost them the race.

"The supreme excellence is to subdue the enemy without fighting."
- Sun Tzu (adapted for racing)
*/