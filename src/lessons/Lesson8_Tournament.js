// LESSON 8: Tournament and Competition Mastery
// Goal: Build the ultimate racing bot for tournament play!

class TournamentBot {
    constructor() {
        // Tournament-specific systems
        this.tournament = {
            currentRound: 1,
            totalRounds: 8,
            opponents: new Map(),      // Track all opponents faced
            strategies: new Map(),     // Strategy effectiveness against opponents
            adaptation: new Map(),     // Adaptive counters per opponent
            meta: {
                currentMeta: "unknown",
                metaHistory: [],
                dominantStrategies: []
            }
        };
        
        // Comprehensive analysis systems
        this.analytics = {
            winRate: 0,
            averagePosition: 0,
            totalRaces: 0,
            wins: 0,
            strategiesUsed: [],
            weaknesses: [],
            strengths: []
        };
        
        // Multi-strategy system
        this.strategies = {
            "aggressive": new AggressiveStrategy(),
            "conservative": new ConservativeStrategy(),
            "adaptive": new AdaptiveStrategy(),
            "psychological": new PsychologicalStrategy(),
            "technical": new TechnicalStrategy(),
            "endgame": new EndgameStrategy()
        };
        
        this.currentStrategy = "adaptive"; // Start adaptive
        this.strategyConfidence = 0.5;
        this.tickCount = 0;
        
        console.log("🏆 Lesson 8: TOURNAMENT MASTERY - The ultimate competitive racing bot!");
        console.log("🎯 Ready for championship-level competition!");
    }

    decide(state, car) {
        this.tickCount++;
        
        // CONCEPT 1: Tournament Meta-Game Analysis
        this.analyzeTournamentMeta(state);
        
        // CONCEPT 2: Opponent-Specific Strategy Selection
        this.selectOptimalStrategy(state);
        
        // CONCEPT 3: Real-time Strategy Adaptation
        this.adaptStrategy(state);
        
        // CONCEPT 4: Performance Analytics and Learning
        this.trackPerformance(state);
        
        // CONCEPT 5: Championship Decision Making
        const action = this.makeChampionshipDecision(state, car);
        
        // Execute with tournament-level precision
        this.executeTournamentAction(action, car, state);
        
        // Championship reporting every 3 seconds
        if (this.tickCount % 180 === 0) {
            this.reportChampionshipStatus();
        }
    }

    analyzeTournamentMeta(state) {
        // Analyze the current tournament meta-game
        const opponentId = this.getOpponentId(state);
        
        if (!this.tournament.opponents.has(opponentId)) {
            this.tournament.opponents.set(opponentId, {
                racesAgainst: 0,
                wins: 0,
                losses: 0,
                preferredStrategy: "unknown",
                weaknesses: [],
                counters: [],
                lastSeen: this.tickCount
            });
        }
        
        const opponent = this.tournament.opponents.get(opponentId);
        opponent.racesAgainst++;
        opponent.lastSeen = this.tickCount;
        
        // Detect opponent's current strategy
        this.detectOpponentStrategy(state, opponent);
        
        // Update meta-game understanding
        this.updateMetaGame();
    }

    getOpponentId(state) {
        // Create unique opponent ID based on behavior patterns
        // In real tournament, this would be actual opponent ID
        return `opponent_${Math.floor(this.tickCount / 3600)}`; // Changes every minute for demo
    }

    detectOpponentStrategy(state, opponent) {
        // Analyze opponent behavior to determine their strategy
        const behaviors = {
            aggressive: 0,
            conservative: 0,
            technical: 0,
            psychological: 0
        };
        
        // Aggression indicators
        if (state.opponent.speed > 220) behaviors.aggressive += 1;
        if (Math.abs(state.opponent.distance) < 30) behaviors.aggressive += 0.5;
        
        // Conservative indicators
        if (state.opponent.speed < 180) behaviors.conservative += 1;
        const raceProgress = (state.car.lap - 1) / state.track.totalLaps;
        if (raceProgress < 0.8 && state.opponent.speed < 200) behaviors.conservative += 0.5;
        
        // Technical indicators (lane optimization, fuel management)
        if (this.isOpponentOptimizingLanes(state)) behaviors.technical += 1;
        if (this.isOpponentManagingFuelWell(state)) behaviors.technical += 0.5;
        
        // Psychological indicators (copying, blocking, pressure)
        if (this.isOpponentUsingPsychTactics(state)) behaviors.psychological += 1;
        
        // Determine dominant behavior
        const dominantBehavior = Object.keys(behaviors).reduce((a, b) => 
            behaviors[a] > behaviors[b] ? a : b
        );
        
        if (behaviors[dominantBehavior] > 1.0) {
            opponent.preferredStrategy = dominantBehavior;
            console.log(`🎯 TOURNAMENT: Detected opponent strategy: ${dominantBehavior}`);
        }
    }

    isOpponentOptimizingLanes(state) {
        // Check if opponent makes smart lane choices
        // This is a simplified heuristic
        return Math.random() > 0.7; // 30% chance they're optimizing
    }

    isOpponentManagingFuelWell(state) {
        // Infer fuel management from speed patterns
        const raceProgress = (state.car.lap - 1) / state.track.totalLaps;
        if (raceProgress > 0.5 && state.opponent.speed > 200) {
            return true; // Good fuel management to maintain speed late
        }
        return false;
    }

    isOpponentUsingPsychTactics(state) {
        // Detect psychological tactics
        if (!this.lastOpponentLane) this.lastOpponentLane = state.opponent.lane;
        
        const laneChanged = state.opponent.lane !== this.lastOpponentLane;
        const close = Math.abs(state.opponent.distance) < 40;
        
        this.lastOpponentLane = state.opponent.lane;
        
        return laneChanged && close; // Lane changes when close = psych tactics
    }

    updateMetaGame() {
        // Update understanding of tournament meta
        const strategies = Array.from(this.tournament.opponents.values())
            .map(opp => opp.preferredStrategy)
            .filter(strat => strat !== "unknown");
        
        // Count strategy frequency
        const stratCounts = {};
        strategies.forEach(strat => {
            stratCounts[strat] = (stratCounts[strat] || 0) + 1;
        });
        
        // Identify dominant meta strategies
        const dominant = Object.keys(stratCounts)
            .sort((a, b) => stratCounts[b] - stratCounts[a])
            .slice(0, 2);
        
        if (dominant.length > 0) {
            this.tournament.meta.dominantStrategies = dominant;
            this.tournament.meta.currentMeta = dominant[0];
            console.log(`📊 META UPDATE: Current meta is ${dominant[0]} (${stratCounts[dominant[0]]} opponents)`);
        }
    }

    selectOptimalStrategy(state) {
        const opponentId = this.getOpponentId(state);
        const opponent = this.tournament.opponents.get(opponentId);
        
        if (!opponent || opponent.preferredStrategy === "unknown") {
            // Unknown opponent - start with adaptive
            this.currentStrategy = "adaptive";
            this.strategyConfidence = 0.3;
            return;
        }
        
        // Select counter-strategy based on opponent type
        const counterStrategy = this.getCounterStrategy(opponent.preferredStrategy);
        
        // Check our historical success with this counter
        const strategyKey = `${counterStrategy}_vs_${opponent.preferredStrategy}`;
        if (this.tournament.strategies.has(strategyKey)) {
            const performance = this.tournament.strategies.get(strategyKey);
            if (performance.winRate > 0.6) {
                this.currentStrategy = counterStrategy;
                this.strategyConfidence = performance.winRate;
                console.log(`🎯 STRATEGY: Using ${counterStrategy} (${(performance.winRate * 100).toFixed(0)}% win rate)`);
            } else {
                // Our usual counter isn't working - try meta counter
                this.currentStrategy = this.getMetaCounterStrategy();
                this.strategyConfidence = 0.4;
                console.log(`🔄 STRATEGY: Counter failed, trying meta strategy: ${this.currentStrategy}`);
            }
        } else {
            // No history with this counter - try it
            this.currentStrategy = counterStrategy;
            this.strategyConfidence = 0.5;
            console.log(`🆕 STRATEGY: Trying new counter: ${counterStrategy}`);
        }
    }

    getCounterStrategy(opponentStrategy) {
        // Rock-paper-scissors style strategy counters
        const counters = {
            "aggressive": "conservative",    // Let them burn fuel
            "conservative": "aggressive",   // Apply pressure  
            "technical": "psychological",   // Disrupt their precision
            "psychological": "technical",   // Ignore mind games, focus on optimization
            "adaptive": "psychological",    // Confuse their adaptation
            "unknown": "adaptive"           // Start adaptive against unknowns
        };
        
        return counters[opponentStrategy] || "adaptive";
    }

    getMetaCounterStrategy() {
        // Counter the dominant meta strategy
        const metaStrategy = this.tournament.meta.currentMeta;
        
        if (metaStrategy === "aggressive") {
            return "endgame"; // Survive early, win late
        } else if (metaStrategy === "conservative") {
            return "aggressive"; // Pressure conservative players
        } else if (metaStrategy === "technical") {
            return "psychological"; // Disrupt technical players
        } else {
            return "adaptive"; // When in doubt, adapt
        }
    }

    adaptStrategy(state) {
        // Real-time strategy adaptation based on current performance
        const raceProgress = (state.car.lap - 1) / state.track.totalLaps;
        
        // If we're losing badly, switch strategies
        if (raceProgress > 0.3 && state.opponent.distance > 100) {
            if (this.strategyConfidence > 0.3) {
                this.strategyConfidence -= 0.05;
                console.log(`📉 ADAPTATION: Strategy confidence dropping (${(this.strategyConfidence * 100).toFixed(0)}%)`);
                
                if (this.strategyConfidence < 0.3) {
                    // Switch to desperation strategy
                    this.currentStrategy = "endgame";
                    this.strategyConfidence = 0.8;
                    console.log("🚨 ADAPTATION: Switching to desperation strategy!");
                }
            }
        }
        
        // If we're dominating, maintain strategy but prepare for counters
        if (state.opponent.distance < -50) {
            this.strategyConfidence = Math.min(0.9, this.strategyConfidence + 0.01);
            console.log(`📈 ADAPTATION: Dominating with ${this.currentStrategy} strategy`);
        }
        
        // Late race adaptations
        if (raceProgress > 0.8) {
            if (state.opponent.distance > 0 && this.currentStrategy !== "endgame") {
                console.log("🏁 ENDGAME: Switching to final push strategy!");
                this.currentStrategy = "endgame";
                this.strategyConfidence = 1.0;
            }
        }
    }

    trackPerformance(state) {
        // Track detailed performance analytics
        if (this.tickCount % 60 === 0) { // Every second
            this.analytics.totalRaces = this.tournament.currentRound;
            
            // Calculate current position advantage
            const positionAdvantage = state.opponent.distance < 0 ? 1 : 0;
            this.analytics.averagePosition = 
                (this.analytics.averagePosition * (this.tickCount - 60) + positionAdvantage) / this.tickCount;
                
            // Track strategy effectiveness
            const currentStrategyData = this.analytics.strategiesUsed.find(s => s.name === this.currentStrategy) || 
                { name: this.currentStrategy, ticksUsed: 0, averagePosition: 0 };
                
            currentStrategyData.ticksUsed += 60;
            currentStrategyData.averagePosition = 
                (currentStrategyData.averagePosition * (currentStrategyData.ticksUsed - 60) + positionAdvantage) / currentStrategyData.ticksUsed;
                
            // Update or add strategy data
            const existingIndex = this.analytics.strategiesUsed.findIndex(s => s.name === this.currentStrategy);
            if (existingIndex >= 0) {
                this.analytics.strategiesUsed[existingIndex] = currentStrategyData;
            } else {
                this.analytics.strategiesUsed.push(currentStrategyData);
            }
        }
    }

    makeChampionshipDecision(state, car) {
        // Execute the current strategy with championship-level decision making
        const strategy = this.strategies[this.currentStrategy];
        
        if (strategy && strategy.decide) {
            return strategy.decide(state, this.tournament, this.analytics);
        } else {
            // Fallback to adaptive decision making
            return this.makeAdaptiveDecision(state);
        }
    }

    makeAdaptiveDecision(state) {
        // Master-level adaptive decision making
        const raceProgress = (state.car.lap - 1) / state.track.totalLaps;
        const gap = state.opponent.distance;
        const fuel = state.car.fuel;
        
        // Championship-level fuel management
        const fuelNeeded = this.estimateFuelNeeded(state);
        const fuelCushion = fuel - fuelNeeded;
        
        // Endgame decision making (last 20% of race)
        if (raceProgress > 0.8) {
            if (gap > 0 && fuel > 10) { // Behind with fuel
                return CAR_ACTIONS.SPRINT;
            } else if (gap < -20) { // Safely ahead
                return CAR_ACTIONS.COAST;
            } else { // Close race
                return CAR_ACTIONS.ACCELERATE;
            }
        }
        
        // Mid-race strategic decisions
        if (raceProgress > 0.3) {
            // Apply pressure if we have fuel advantage
            if (fuelCushion > 20 && Math.abs(gap) < 50) {
                return CAR_ACTIONS.SPRINT;
            }
            
            // Efficient racing if close on fuel
            if (fuelCushion < 10) {
                if (state.car.isDrafting) {
                    return CAR_ACTIONS.COAST;
                } else {
                    return CAR_ACTIONS.ACCELERATE;
                }
            }
        }
        
        // Early race conservative approach
        if (fuel > 60) {
            return CAR_ACTIONS.ACCELERATE;
        } else {
            return CAR_ACTIONS.COAST;
        }
    }

    estimateFuelNeeded(state) {
        // Sophisticated fuel requirement estimation
        const raceProgress = (state.car.lap - 1 + state.car.position / state.track.lapDistance) / state.track.totalLaps;
        const remainingProgress = 1 - raceProgress;
        
        // Base fuel consumption (conservative estimate)
        const baseFuelPerProgress = 60; // Fuel needed for conservative racing
        const baseFuelNeeded = remainingProgress * baseFuelPerProgress;
        
        // Adjustment for competition pressure
        const competitiveFactor = Math.abs(state.opponent.distance) < 100 ? 1.2 : 1.0;
        
        return baseFuelNeeded * competitiveFactor;
    }

    executeTournamentAction(action, car, state) {
        // Execute action with championship precision
        car.executeAction(action);
        
        // Log championship-level decision reasoning
        const reasoning = this.getDecisionReasoning(action, state);
        console.log(`🏆 CHAMPIONSHIP: ${action} - ${reasoning}`);
    }

    getDecisionReasoning(action, state) {
        const gap = state.opponent.distance;
        const fuel = state.car.fuel;
        const raceProgress = (state.car.lap - 1) / state.track.totalLaps;
        
        switch (action) {
            case CAR_ACTIONS.SPRINT:
                if (raceProgress > 0.8) return "Final push for victory";
                if (gap > 0) return "Closing gap on leader";
                return "Applying pressure";
                
            case CAR_ACTIONS.BOOST:
                return "Using boost charge strategically";
                
            case CAR_ACTIONS.ACCELERATE:
                return "Maintaining competitive pace";
                
            case CAR_ACTIONS.COAST:
                if (fuel < 30) return "Fuel conservation mode";
                if (gap < -30) return "Protecting lead efficiently";
                return "Strategic coasting";
                
            case CAR_ACTIONS.CHANGE_LANE_LEFT:
            case CAR_ACTIONS.CHANGE_LANE_RIGHT:
                return "Tactical lane change";
                
            default:
                return "Championship positioning";
        }
    }

    reportChampionshipStatus() {
        console.log("\n🏆 === CHAMPIONSHIP STATUS REPORT ===");
        console.log(`Round: ${this.tournament.currentRound}/${this.tournament.totalRounds}`);
        console.log(`Current Strategy: ${this.currentStrategy} (${(this.strategyConfidence * 100).toFixed(0)}% confidence)`);
        console.log(`Tournament Meta: ${this.tournament.meta.currentMeta}`);
        console.log(`Opponents Analyzed: ${this.tournament.opponents.size}`);
        
        // Performance statistics
        console.log("\n📊 PERFORMANCE ANALYTICS:");
        console.log(`Average Position Advantage: ${(this.analytics.averagePosition * 100).toFixed(1)}%`);
        
        // Strategy effectiveness
        console.log("\n🎯 STRATEGY EFFECTIVENESS:");
        const topStrategies = this.analytics.strategiesUsed
            .sort((a, b) => b.averagePosition - a.averagePosition)
            .slice(0, 3);
            
        topStrategies.forEach((strat, i) => {
            console.log(`${i + 1}. ${strat.name}: ${(strat.averagePosition * 100).toFixed(1)}% advantage`);
        });
        
        // Opponent insights
        const recentOpponents = Array.from(this.tournament.opponents.values())
            .filter(opp => this.tickCount - opp.lastSeen < 1800) // Last 30 seconds
            .slice(-3);
            
        console.log("\n👥 RECENT OPPONENTS:");
        recentOpponents.forEach((opp, i) => {
            console.log(`Opponent ${i + 1}: ${opp.preferredStrategy} strategy`);
        });
        
        console.log("==========================================\n");
    }
}

// Strategy implementations for tournament play
class AggressiveStrategy {
    decide(state, tournament, analytics) {
        if (state.car.fuel > 30) return CAR_ACTIONS.SPRINT;
        if (state.car.fuel > 15) return CAR_ACTIONS.ACCELERATE;
        return CAR_ACTIONS.COAST;
    }
}

class ConservativeStrategy {
    decide(state, tournament, analytics) {
        if (state.car.isDrafting) return CAR_ACTIONS.COAST;
        if (state.car.fuel > 50) return CAR_ACTIONS.ACCELERATE;
        return CAR_ACTIONS.COAST;
    }
}

class AdaptiveStrategy {
    decide(state, tournament, analytics) {
        const gap = state.opponent.distance;
        if (gap > 50 && state.car.fuel > 40) return CAR_ACTIONS.SPRINT;
        if (gap < -50 && state.car.fuel < 40) return CAR_ACTIONS.COAST;
        return CAR_ACTIONS.ACCELERATE;
    }
}

class PsychologicalStrategy {
    decide(state, tournament, analytics) {
        // Stay close to apply pressure
        const gap = Math.abs(state.opponent.distance);
        if (gap > 30 && state.car.fuel > 30) return CAR_ACTIONS.SPRINT;
        if (gap < 10) return CAR_ACTIONS.ACCELERATE;
        return CAR_ACTIONS.COAST;
    }
}

class TechnicalStrategy {
    decide(state, tournament, analytics) {
        // Optimal fuel management
        const raceProgress = (state.car.lap - 1) / state.track.totalLaps;
        const fuelNeeded = (1 - raceProgress) * 60;
        
        if (state.car.fuel > fuelNeeded + 20) return CAR_ACTIONS.ACCELERATE;
        if (state.car.fuel > fuelNeeded + 10) return CAR_ACTIONS.COAST;
        return CAR_ACTIONS.COAST;
    }
}

class EndgameStrategy {
    decide(state, tournament, analytics) {
        // All-out attack for final push
        const raceProgress = (state.car.lap - 1) / state.track.totalLaps;
        
        if (raceProgress > 0.8) {
            if (state.car.boosts > 0 && state.car.fuel > 10) return CAR_ACTIONS.BOOST;
            if (state.car.fuel > 5) return CAR_ACTIONS.SPRINT;
        }
        
        return CAR_ACTIONS.ACCELERATE;
    }
}

/*
LESSON 8: TOURNAMENT AND COMPETITION MASTERY

CHAMPIONSHIP-LEVEL CONCEPTS:

1. TOURNAMENT META-GAME:
   - Strategy frequency analysis
   - Meta evolution tracking
   - Dominant strategy identification
   - Counter-meta preparation

2. OPPONENT MODELING:
   - Behavior pattern recognition
   - Strategy classification
   - Weakness identification
   - Historical performance tracking

3. ADAPTIVE STRATEGY SYSTEM:
   - Multi-strategy framework
   - Real-time strategy switching
   - Performance-based adaptation
   - Confidence-weighted decisions

4. CHAMPIONSHIP DECISION MAKING:
   - Risk-reward optimization
   - Endgame specialization
   - Fuel management mastery
   - Pressure application techniques

TOURNAMENT STRATEGY FRAMEWORK:

STRATEGY TYPES:
1. Aggressive: High risk, high reward
2. Conservative: Low risk, consistent
3. Technical: Optimization-focused
4. Psychological: Mind games and pressure
5. Adaptive: Reactive to opponent
6. Endgame: Late-race specialization

STRATEGY COUNTERS:
- Aggressive → Conservative (let them burn fuel)
- Conservative → Aggressive (apply pressure)
- Technical → Psychological (disrupt precision)
- Psychological → Technical (ignore mind games)
- Adaptive → Psychological (confuse adaptation)

META-GAME CONCEPTS:

TOURNAMENT PHASES:
1. Early Tournament: Information gathering
2. Mid Tournament: Strategy refinement
3. Late Tournament: Peak performance
4. Finals: Championship mindset

META EVOLUTION:
- Identify dominant strategies
- Develop counter-strategies
- Prepare counter-counter strategies
- Stay ahead of the meta curve

OPPONENT ANALYSIS:

BEHAVIORAL INDICATORS:
- Speed patterns (aggressive vs conservative)
- Lane usage (technical vs chaotic)
- Fuel management (skilled vs wasteful)
- Response patterns (predictable vs random)

STRATEGY DETECTION:
- Aggressive: High speeds, risky moves
- Conservative: Steady pace, fuel saving
- Technical: Optimal lane choices
- Psychological: Blocking, following

CHAMPIONSHIP PSYCHOLOGY:

MENTAL PREPARATION:
- Confidence in strategy system
- Adaptability under pressure
- Learning from losses
- Maintaining focus in finals

PRESSURE MANAGEMENT:
- Stay calm in close races
- Execute under championship pressure
- Trust your preparation
- Focus on process, not outcome

ADVANCED TOURNAMENT TECHNIQUES:

1. STRATEGIC DECEPTION:
   - Hide your true strategy early
   - False tells to mislead scouts
   - Surprise factor in finals
   - Multiple contingency plans

2. ADAPTIVE LEARNING:
   - Real-time opponent analysis
   - Strategy effectiveness tracking
   - In-race adjustments
   - Performance pattern recognition

3. RISK MANAGEMENT:
   - Conservative early rounds
   - Aggressive when necessary
   - Calculated risks only
   - Preserve resources for finals

4. CHAMPIONSHIP EXECUTION:
   - Peak performance timing
   - Clutch decision making
   - Pressure situation mastery
   - Victory condition optimization

TOURNAMENT PREPARATION:

PRE-TOURNAMENT:
- Study opponent histories
- Develop strategy matrix
- Practice all scenarios
- Mental preparation routine

DURING TOURNAMENT:
- Gather intelligence each round
- Adapt strategies based on performance
- Maintain focus and composure
- Execute championship decisions

POST-MATCH ANALYSIS:
- Review performance metrics
- Update opponent models
- Refine strategy effectiveness
- Prepare for next round

CHAMPIONSHIP MINDSET:

QUALITIES OF CHAMPIONS:
1. Adaptability: Adjust to any opponent
2. Consistency: Perform under pressure
3. Intelligence: Make optimal decisions
4. Resilience: Recover from setbacks
5. Innovation: Find new advantages

VICTORY CONDITIONS:
- Technical Excellence: Outrace opponents
- Strategic Superiority: Outthink opponents
- Mental Toughness: Outlast opponents
- Adaptive Mastery: Out-adapt opponents

THE CHAMPION'S PATH:

BEGINNER → INTERMEDIATE → ADVANCED → EXPERT → CHAMPION

Each level requires:
- Deeper understanding
- Better execution
- Stronger mental game
- More sophisticated strategies

TOURNAMENT SUCCESS METRICS:

PERFORMANCE INDICATORS:
- Win rate improvement
- Strategy adaptation speed
- Opponent modeling accuracy
- Championship consistency

ADVANCED METRICS:
- Meta-game understanding
- Strategy innovation rate
- Pressure performance ratio
- Learning curve optimization

THE ULTIMATE GOAL:

Create a racing bot that doesn't just follow
optimal strategies, but creates new ones,
adapts to any opponent, performs under pressure,
and consistently delivers championship-level
performance in tournament competition.

CHAMPION'S CREED:
"I will adapt to any opponent,
 execute under any pressure,
 learn from every race,
 and never stop improving
 until I reach the podium!"

This is what separates champions from competitors:
the ability to perform optimally when it matters most,
against the best opponents, under the highest pressure,
with everything on the line.

Welcome to championship racing. 
Time to prove you belong among the elite!
*/