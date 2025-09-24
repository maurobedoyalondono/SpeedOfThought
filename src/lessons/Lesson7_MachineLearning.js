// LESSON 7: Machine Learning and Adaptive AI
// Goal: Create AI that learns and evolves during the race!

class LearningBot {
    constructor() {
        // Neural network weights (simplified)
        this.weights = {
            fuelImportance: 0.3,
            speedImportance: 0.4,
            opponentDistance: 0.2,
            boostTiming: 0.1
        };
        
        // Learning system
        this.memory = {
            decisions: [],          // Track decisions made
            outcomes: [],           // Track outcomes of decisions
            patterns: new Map(),    // Pattern recognition
            rewards: [],            // Reward history
            experiences: []         // Experience replay buffer
        };
        
        // Performance metrics
        this.performance = {
            averageSpeed: 0,
            fuelEfficiency: 0,
            racePosition: 0,
            improvementRate: 0
        };
        
        // Learning parameters
        this.learningRate = 0.01;
        this.explorationRate = 0.1; // Epsilon for epsilon-greedy
        this.memorySize = 1000;
        this.batchSize = 32;
        
        this.tickCount = 0;
        this.lastReward = 0;
        
        console.log("🤖 Lesson 7: Machine Learning Bot - AI that learns as it races!");
    }

    decide(state, car) {
        this.tickCount++;
        
        // CONCEPT 1: State Representation and Feature Extraction
        const gameState = this.extractFeatures(state);
        
        // CONCEPT 2: Decision Making with Exploration vs Exploitation
        const action = this.selectAction(gameState, state);
        
        // CONCEPT 3: Reward Calculation and Learning Signal
        const reward = this.calculateReward(state);
        
        // CONCEPT 4: Experience Storage and Replay
        this.storeExperience(gameState, action, reward);
        
        // CONCEPT 5: Weight Updates and Learning
        this.updateWeights(reward);
        
        // CONCEPT 6: Pattern Recognition and Adaptation
        this.recognizePatterns(state, action);
        
        // Execute the selected action
        this.executeAction(action, car);
        
        // Report learning progress every 5 seconds
        if (this.tickCount % 300 === 0) {
            this.reportLearningProgress();
        }
    }

    extractFeatures(state) {
        // Convert game state to normalized feature vector
        const features = {
            // Normalized values between 0 and 1
            fuelLevel: state.car.fuel / 100,
            speed: state.car.speed / 250,
            opponentDistance: this.normalizeDistance(state.opponent.distance),
            opponentSpeed: state.opponent.speed / 250,
            raceProgress: (state.car.lap - 1) / state.track.totalLaps,
            isDrafting: state.car.isDrafting ? 1 : 0,
            boostsAvailable: state.car.boosts / 3,
            lanePosition: state.car.lane / 2, // 0, 0.5, or 1
            obstacleAhead: this.hasObstacleAhead(state) ? 1 : 0,
            fuelStationAhead: this.hasFuelStationAhead(state) ? 1 : 0
        };

        // Calculate derived features
        features.fuelEfficiency = this.calculateFuelEfficiency();
        features.positionAdvantage = state.opponent.distance > 0 ? 1 : 0;
        features.speedDifference = (state.car.speed - state.opponent.speed) / 250;
        
        return features;
    }

    normalizeDistance(distance) {
        // Normalize distance to [-1, 1] range
        return Math.max(-1, Math.min(1, distance / 200));
    }

    hasObstacleAhead(state) {
        // Check for obstacles in the next 100 units
        const lookahead = 100;
        const myLane = state.car.lane;
        
        for (let obstacle of state.track.obstacles) {
            const relativeDistance = obstacle.position - state.car.position;
            if (relativeDistance > 0 && relativeDistance < lookahead && obstacle.lane === myLane) {
                return true;
            }
        }
        return false;
    }

    hasFuelStationAhead(state) {
        // Check for fuel stations in the next 150 units
        const lookahead = 150;
        
        for (let station of state.track.fuelStations) {
            const relativeDistance = station.position - state.car.position;
            if (relativeDistance > 0 && relativeDistance < lookahead) {
                return true;
            }
        }
        return false;
    }

    calculateFuelEfficiency() {
        // Calculate current fuel efficiency (distance per fuel)
        if (this.memory.decisions.length < 60) return 0.5; // Default for first minute
        
        const recentDecisions = this.memory.decisions.slice(-60);
        const totalFuelUsed = recentDecisions.reduce((sum, decision) => {
            return sum + this.getActionFuelCost(decision.action);
        }, 0);
        
        return totalFuelUsed > 0 ? 60 / totalFuelUsed : 1.0; // Distance/fuel ratio
    }

    getActionFuelCost(action) {
        // Estimated fuel cost per action (per tick)
        switch (action) {
            case CAR_ACTIONS.SPRINT: return 2.7 / 60; // ~2.7L/sec
            case CAR_ACTIONS.ACCELERATE: return 1.5 / 60; // ~1.5L/sec
            case CAR_ACTIONS.BOOST: return 3.5 / 60; // ~3.5L/sec
            default: return 0;
        }
    }

    selectAction(features, state) {
        // Epsilon-greedy action selection with learning
        if (Math.random() < this.explorationRate) {
            // Exploration: Random action
            return this.selectRandomAction(state);
        } else {
            // Exploitation: Use learned policy
            return this.selectBestAction(features, state);
        }
    }

    selectRandomAction(state) {
        const possibleActions = [
            CAR_ACTIONS.COAST,
            CAR_ACTIONS.ACCELERATE,
            CAR_ACTIONS.SPRINT
        ];
        
        // Add lane changes if possible
        if (state.car.lane > 0) {
            possibleActions.push(CAR_ACTIONS.CHANGE_LANE_LEFT);
        }
        if (state.car.lane < 2) {
            possibleActions.push(CAR_ACTIONS.CHANGE_LANE_RIGHT);
        }
        
        // Add boost if available
        if (state.car.boosts > 0) {
            possibleActions.push(CAR_ACTIONS.BOOST);
        }
        
        const randomIndex = Math.floor(Math.random() * possibleActions.length);
        return possibleActions[randomIndex];
    }

    selectBestAction(features, state) {
        // Use neural network weights to evaluate actions
        const actionScores = new Map();
        
        // Score each possible action
        actionScores.set(CAR_ACTIONS.COAST, this.evaluateCoast(features));
        actionScores.set(CAR_ACTIONS.ACCELERATE, this.evaluateAccelerate(features));
        actionScores.set(CAR_ACTIONS.SPRINT, this.evaluateSprint(features));
        
        // Lane changes
        if (state.car.lane > 0) {
            actionScores.set(CAR_ACTIONS.CHANGE_LANE_LEFT, this.evaluateLaneChange(features, -1));
        }
        if (state.car.lane < 2) {
            actionScores.set(CAR_ACTIONS.CHANGE_LANE_RIGHT, this.evaluateLaneChange(features, 1));
        }
        
        // Boost
        if (state.car.boosts > 0) {
            actionScores.set(CAR_ACTIONS.BOOST, this.evaluateBoost(features));
        }
        
        // Select action with highest score
        let bestAction = CAR_ACTIONS.COAST;
        let bestScore = -Infinity;
        
        for (let [action, score] of actionScores) {
            if (score > bestScore) {
                bestScore = score;
                bestAction = action;
            }
        }
        
        return bestAction;
    }

    evaluateCoast(features) {
        // Score coasting based on current situation
        let score = 0;
        
        // Good when fuel is low
        score += (1 - features.fuelLevel) * this.weights.fuelImportance;
        
        // Good when drafting (free speed)
        score += features.isDrafting * 0.3;
        
        // Less good when behind and not making progress
        if (features.positionAdvantage === 0 && features.speedDifference < 0) {
            score -= 0.2;
        }
        
        return score;
    }

    evaluateAccelerate(features) {
        // Score acceleration based on situation
        let score = 0.5; // Base score
        
        // Good when we have fuel
        score += features.fuelLevel * this.weights.fuelImportance;
        
        // Good for maintaining speed
        score += this.weights.speedImportance * 0.7;
        
        // Adjust based on opponent position
        if (features.opponentDistance < 0) { // Behind
            score += 0.2;
        }
        
        return score;
    }

    evaluateSprint(features) {
        // Score sprinting
        let score = 0;
        
        // Only good with sufficient fuel
        if (features.fuelLevel < 0.3) {
            score -= 0.5; // Heavy penalty for low fuel
        } else {
            score += this.weights.speedImportance;
        }
        
        // Good when we need to catch up
        if (features.positionAdvantage === 0) {
            score += 0.3;
        }
        
        // Good near the end of race
        score += features.raceProgress * 0.2;
        
        return score;
    }

    evaluateBoost(features) {
        // Score boost usage
        let score = 0;
        
        // High value action - be selective
        score += this.weights.boostTiming;
        
        // Better when we have fuel to sustain speed after boost
        score += features.fuelLevel * 0.4;
        
        // Better when we're behind and need to catch up
        if (features.positionAdvantage === 0) {
            score += 0.5;
        }
        
        // Better later in race
        score += features.raceProgress * 0.3;
        
        // Not good if already fastest
        if (features.speedDifference > 0.2) {
            score -= 0.3;
        }
        
        return score;
    }

    evaluateLaneChange(features, direction) {
        // Score lane changes
        let score = 0.1; // Small base score
        
        // Good to avoid obstacles
        if (features.obstacleAhead) {
            score += 0.8;
        }
        
        // Good to reach fuel stations
        if (features.fuelStationAhead && features.fuelLevel < 0.4) {
            score += 0.6;
        }
        
        // Good for overtaking
        if (features.positionAdvantage === 0 && Math.abs(features.opponentDistance) < 0.2) {
            score += 0.4;
        }
        
        return score;
    }

    calculateReward(state) {
        // Multi-objective reward function
        let reward = 0;
        
        // Speed reward (encourage going fast)
        reward += (state.car.speed / 250) * 0.1;
        
        // Position reward (encourage being ahead)
        if (state.opponent.distance < 0) { // We're ahead
            reward += 0.5;
        } else {
            reward -= Math.min(0.3, Math.abs(state.opponent.distance) / 1000);
        }
        
        // Fuel efficiency reward
        const fuelEfficiency = this.calculateFuelEfficiency();
        reward += fuelEfficiency * 0.2;
        
        // Penalty for running out of fuel
        if (state.car.fuel < 5) {
            reward -= 1.0;
        }
        
        // Bonus for drafting (efficient racing)
        if (state.car.isDrafting) {
            reward += 0.1;
        }
        
        // Progress reward
        const currentProgress = (state.car.lap - 1 + state.car.position / state.track.lapDistance);
        if (this.lastProgress && currentProgress > this.lastProgress) {
            reward += (currentProgress - this.lastProgress) * 10;
        }
        this.lastProgress = currentProgress;
        
        return reward;
    }

    storeExperience(gameState, action, reward) {
        // Store experience in replay buffer
        const experience = {
            state: { ...gameState },
            action: action,
            reward: reward,
            timestamp: this.tickCount
        };
        
        this.memory.experiences.push(experience);
        
        // Keep buffer size manageable
        if (this.memory.experiences.length > this.memorySize) {
            this.memory.experiences.shift(); // Remove oldest
        }
        
        // Also track in simpler arrays for quick access
        this.memory.decisions.push({ action, timestamp: this.tickCount });
        this.memory.rewards.push(reward);
        
        if (this.memory.decisions.length > this.memorySize) {
            this.memory.decisions.shift();
            this.memory.rewards.shift();
        }
    }

    updateWeights(reward) {
        // Simple gradient ascent on weights
        const rewardDelta = reward - this.lastReward;
        
        // Update weights based on reward signal
        if (this.memory.experiences.length > 10) {
            // Calculate recent performance
            const recentRewards = this.memory.rewards.slice(-60); // Last second
            const averageReward = recentRewards.reduce((a, b) => a + b, 0) / recentRewards.length;
            
            // Adjust weights based on performance
            if (averageReward > 0.1) {
                // Good performance - slightly increase current strategy weights
                this.weights.fuelImportance += this.learningRate * 0.1;
                this.weights.speedImportance += this.learningRate * 0.1;
            } else if (averageReward < -0.1) {
                // Poor performance - adjust weights
                this.weights.fuelImportance -= this.learningRate * 0.1;
                this.weights.speedImportance += this.learningRate * 0.1;
            }
            
            // Normalize weights to sum to 1
            const weightSum = Object.values(this.weights).reduce((a, b) => a + b, 0);
            for (let key in this.weights) {
                this.weights[key] = Math.max(0.05, Math.min(0.8, this.weights[key] / weightSum));
            }
        }
        
        this.lastReward = reward;
        
        // Decay exploration rate over time (exploit more as we learn)
        this.explorationRate = Math.max(0.01, this.explorationRate * 0.9995);
    }

    recognizePatterns(state, action) {
        // Pattern recognition for state-action pairs
        const stateKey = this.stateToKey(state);
        
        if (!this.memory.patterns.has(stateKey)) {
            this.memory.patterns.set(stateKey, {
                actions: new Map(),
                totalCount: 0,
                averageReward: 0
            });
        }
        
        const pattern = this.memory.patterns.get(stateKey);
        pattern.totalCount++;
        
        if (!pattern.actions.has(action)) {
            pattern.actions.set(action, { count: 0, totalReward: 0 });
        }
        
        const actionData = pattern.actions.get(action);
        actionData.count++;
        actionData.totalReward += this.lastReward;
        
        // Update running average reward for this state
        pattern.averageReward = (pattern.averageReward * (pattern.totalCount - 1) + this.lastReward) / pattern.totalCount;
        
        console.log(`🧠 PATTERN: State ${stateKey} → Action ${action} (${actionData.count} times, avg reward: ${(actionData.totalReward / actionData.count).toFixed(2)})`);
    }

    stateToKey(state) {
        // Convert state to discrete key for pattern recognition
        const fuel = Math.floor(state.car.fuel / 20) * 20; // Bucket by 20s
        const speed = Math.floor(state.car.speed / 50) * 50; // Bucket by 50s
        const opponentPos = state.opponent.distance > 0 ? "ahead" : "behind";
        const drafting = state.car.isDrafting ? "draft" : "nodraft";
        
        return `F${fuel}_S${speed}_${opponentPos}_${drafting}`;
    }

    executeAction(action, car) {
        car.executeAction(action);
        console.log(`🤖 LEARNING: Executed ${action} (exploration rate: ${(this.explorationRate * 100).toFixed(1)}%)`);
    }

    reportLearningProgress() {
        console.log("\n🤖 === LEARNING PROGRESS REPORT ===");
        console.log("Experience Buffer Size:", this.memory.experiences.length);
        console.log("Patterns Recognized:", this.memory.patterns.size);
        console.log("Exploration Rate:", (this.explorationRate * 100).toFixed(1) + "%");
        
        console.log("\nCurrent Weights:");
        for (let [key, value] of Object.entries(this.weights)) {
            console.log(`  ${key}: ${(value * 100).toFixed(1)}%`);
        }
        
        // Recent performance
        const recentRewards = this.memory.rewards.slice(-300); // Last 5 seconds
        if (recentRewards.length > 0) {
            const avgReward = recentRewards.reduce((a, b) => a + b, 0) / recentRewards.length;
            console.log("Recent Average Reward:", avgReward.toFixed(3));
        }
        
        // Best patterns discovered
        const sortedPatterns = Array.from(this.memory.patterns.entries())
            .sort((a, b) => b[1].averageReward - a[1].averageReward)
            .slice(0, 3);
            
        console.log("\nTop 3 Learned Patterns:");
        for (let [stateKey, pattern] of sortedPatterns) {
            const bestAction = Array.from(pattern.actions.entries())
                .sort((a, b) => (b[1].totalReward / b[1].count) - (a[1].totalReward / a[1].count))[0];
            
            if (bestAction) {
                console.log(`  ${stateKey} → ${bestAction[0]} (reward: ${(bestAction[1].totalReward / bestAction[1].count).toFixed(2)})`);
            }
        }
        
        console.log("======================================\n");
    }
}

/*
LESSON 7: MACHINE LEARNING AND ADAPTIVE AI MASTERY

CORE ML CONCEPTS FOR RACING AI:

1. STATE REPRESENTATION:
   - Feature extraction from game state
   - Normalization of values (0-1 range)
   - Derived features (fuel efficiency, position advantage)
   - State discretization for pattern recognition

2. ACTION SELECTION:
   - Epsilon-greedy exploration vs exploitation
   - Neural network-style action evaluation
   - Multi-objective action scoring
   - Adaptive exploration rate decay

3. REWARD ENGINEERING:
   - Multi-objective reward function
   - Speed, position, fuel efficiency rewards
   - Penalty for poor decisions (fuel depletion)
   - Bonus for efficient racing (drafting)

4. EXPERIENCE REPLAY:
   - Store state-action-reward tuples
   - Replay buffer with size limits
   - Pattern recognition from experiences
   - Learning from past decisions

5. WEIGHT UPDATES:
   - Gradient ascent on reward signal
   - Adaptive learning rates
   - Weight normalization and constraints
   - Performance-based adjustments

MACHINE LEARNING TECHNIQUES:

1. REINFORCEMENT LEARNING:
   - Q-Learning style updates
   - Policy gradient methods
   - Reward-based learning
   - Temporal difference learning

2. PATTERN RECOGNITION:
   - State-action pattern mapping
   - Frequency-based learning
   - Best action discovery
   - Context-aware decision making

3. EXPLORATION STRATEGIES:
   - Epsilon-greedy with decay
   - Random action selection
   - Curiosity-driven exploration
   - Exploitation of learned policies

4. ADAPTIVE PARAMETERS:
   - Dynamic weight adjustment
   - Learning rate scheduling
   - Exploration rate decay
   - Performance-based tuning

ADVANCED AI TECHNIQUES:

1. FEATURE ENGINEERING:
   - Domain-specific features (fuel, speed, position)
   - Temporal features (race progress, trends)
   - Relational features (opponent comparisons)
   - Derived metrics (efficiency, advantage)

2. ACTION EVALUATION:
   - Multi-criteria decision making
   - Weighted scoring systems
   - Context-sensitive evaluation
   - Risk-reward analysis

3. MEMORY SYSTEMS:
   - Short-term decision buffer
   - Long-term pattern storage
   - Experience replay mechanisms
   - Forgetting old patterns

4. ADAPTATION MECHANISMS:
   - Performance monitoring
   - Weight adjustment algorithms
   - Strategy switching
   - Online learning updates

NEURAL NETWORK CONCEPTS:

1. WEIGHT MATRICES:
   - Input-to-hidden connections
   - Hidden-to-output connections
   - Bias terms and thresholds
   - Activation functions

2. FORWARD PROPAGATION:
   - Feature input processing
   - Hidden layer computation
   - Output layer decision
   - Action selection logic

3. BACKPROPAGATION:
   - Error signal calculation
   - Gradient computation
   - Weight update rules
   - Learning rate application

4. NETWORK ARCHITECTURE:
   - Input layer (game features)
   - Hidden layers (decision processing)
   - Output layer (action probabilities)
   - Skip connections and shortcuts

OPTIMIZATION TECHNIQUES:

1. GRADIENT METHODS:
   - Gradient ascent for rewards
   - Gradient descent for errors
   - Momentum-based updates
   - Adaptive learning rates

2. REGULARIZATION:
   - Weight decay and constraints
   - Early stopping criteria
   - Dropout for exploration
   - Batch normalization

3. HYPERPARAMETER TUNING:
   - Learning rate optimization
   - Exploration rate scheduling
   - Memory buffer sizing
   - Update frequency tuning

LEARNING ALGORITHMS IMPLEMENTED:

1. TEMPORAL DIFFERENCE LEARNING:
   ```
   V(s) ← V(s) + α[r + γV(s') - V(s)]
   Where:
   - V(s) = Value of current state
   - α = Learning rate
   - r = Immediate reward
   - γ = Discount factor
   - V(s') = Value of next state
   ```

2. Q-LEARNING UPDATE:
   ```
   Q(s,a) ← Q(s,a) + α[r + γ max Q(s',a') - Q(s,a)]
   Where:
   - Q(s,a) = Quality of action a in state s
   - max Q(s',a') = Best future action value
   ```

3. POLICY GRADIENT:
   ```
   θ ← θ + α ∇θ log π(a|s) R
   Where:
   - θ = Policy parameters (weights)
   - π(a|s) = Policy (action probability)
   - R = Cumulative reward
   ```

PERFORMANCE METRICS:

1. LEARNING CURVES:
   - Average reward over time
   - Win rate improvement
   - Action selection consistency
   - Exploration vs exploitation balance

2. CONVERGENCE INDICATORS:
   - Weight stability
   - Policy consistency
   - Performance plateaus
   - Exploration rate decay

3. GENERALIZATION MEASURES:
   - Performance on new opponents
   - Adaptation to track changes
   - Transfer learning capability
   - Robustness to noise

PRACTICAL IMPLEMENTATION:

1. DATA COLLECTION:
   - Continuous experience gathering
   - State-action-reward logging
   - Performance metric tracking
   - Pattern frequency analysis

2. MODEL UPDATES:
   - Online learning integration
   - Batch processing options
   - Real-time adaptation
   - Periodic model saving

3. DEBUGGING TOOLS:
   - Learning progress visualization
   - Weight evolution tracking
   - Action distribution analysis
   - Reward signal inspection

ADVANCED TOPICS:

1. DEEP REINFORCEMENT LEARNING:
   - Deep Q-Networks (DQN)
   - Actor-Critic methods
   - Policy gradient variants
   - Advanced architectures

2. MULTI-AGENT LEARNING:
   - Opponent modeling
   - Nash equilibrium seeking
   - Competitive adaptation
   - Cooperative strategies

3. TRANSFER LEARNING:
   - Knowledge transfer between tracks
   - Pre-trained model adaptation
   - Domain adaptation techniques
   - Meta-learning approaches

THE LEARNING LOOP:

OBSERVE → DECIDE → ACT → LEARN → ADAPT

1. OBSERVE: Extract features from game state
2. DECIDE: Use policy to select action
3. ACT: Execute action in environment
4. LEARN: Update weights based on reward
5. ADAPT: Adjust strategy and parameters

This creates a continuous improvement cycle where
the AI becomes better through experience, just like
human drivers improve through practice!

PHILOSOPHICAL CONSIDERATIONS:

AI LEARNING vs HUMAN LEARNING:
- Humans learn through intuition and practice
- AI learns through mathematical optimization
- Both can achieve expertise through repetition
- AI can process more experiences faster
- Humans have better generalization initially

THE GOAL: Create AI that not only follows rules
but discovers optimal strategies through experience,
becoming a formidable opponent that grows stronger
with every race!
*/