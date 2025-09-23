/*
 * ActionShowcaseBot
 * Systematically demonstrates ALL car actions with basic obstacle avoidance.
 * Cycles through every action to ensure complete visual coverage.
 */

class PlayerBot {
    constructor() {
        this.tick = 0;
        this.phase = 0;
        this.phaseTicks = 0;
        this.actionSequence = [
            'ACCELERATE',
            'SPRINT', 
            'COAST',
            'BRAKE',
            'BOOST',
            'IDLE',
            'JUMP',
            'LANE_WEAVE'  // Special phase for lane changing
        ];
        this.currentActionIndex = 0;
    }

    decide(state, car) {
        this.tick++;
        this.phaseTicks++;

        // Simple obstacle avoidance: if obstacle ahead in current lane, try lane change
        const laneThreat = this.detectObstacleAhead(state, car, 60); // meters
        if (laneThreat && !car.isJumping && !car.changingLane) {
            // Try left then right
            if (car.lane > 0) {
                car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
            } else if (car.lane < 2) {
                car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
            }
        }

        // Look for boost pads to trigger boost effects
        const boostPadAhead = this.detectBoostPadAhead(state, car, 40);
        
        // Cycle through action sequence every ~90 ticks (~1.5 seconds)
        if (this.phaseTicks > 90) {
            this.currentActionIndex = (this.currentActionIndex + 1) % this.actionSequence.length;
            this.phaseTicks = 0;
        }

        const currentAction = this.actionSequence[this.currentActionIndex];
        
        switch (currentAction) {
            case 'ACCELERATE':
                car.executeAction(CAR_ACTIONS.ACCELERATE);
                break;
                
            case 'SPRINT':
                if (car.fuel > 30) {
                    car.executeAction(CAR_ACTIONS.SPRINT);
                } else {
                    car.executeAction(CAR_ACTIONS.COAST); // Fallback if low fuel
                }
                break;
                
            case 'COAST':
                car.executeAction(CAR_ACTIONS.COAST);
                break;
                
            case 'BRAKE':
                if (car.speed > 60) {
                    car.executeAction(CAR_ACTIONS.BRAKE);
                } else {
                    car.executeAction(CAR_ACTIONS.ACCELERATE); // Don't brake too much
                }
                break;
                
            case 'BOOST':
                if (car.boosts && car.boosts > 0 && car.fuel > 20) {
                    car.executeAction(CAR_ACTIONS.BOOST);
                } else {
                    car.executeAction(CAR_ACTIONS.ACCELERATE); // Fallback
                }
                break;
                
            case 'IDLE':
                // Deliberately do nothing for a few ticks to show idle state
                // This will trigger the idle visual state
                break;
                
            case 'JUMP':
                if (!car.isJumping && car.fuel > 15 && this.phaseTicks < 30) {
                    car.executeAction(CAR_ACTIONS.JUMP);
                } else {
                    car.executeAction(CAR_ACTIONS.ACCELERATE); // Normal driving when not jumping
                }
                break;
                
            case 'LANE_WEAVE':
                // Demonstrate lane changing
                if (!car.changingLane && this.phaseTicks % 30 < 15) {
                    if (car.lane < 2) {
                        car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                    } else {
                        car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                    }
                } else if (!car.changingLane && this.phaseTicks % 30 >= 15) {
                    if (car.lane > 0) {
                        car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                    } else {
                        car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                    }
                }
                car.executeAction(CAR_ACTIONS.ACCELERATE); // Keep moving
                break;
        }

        return car.getExecutionPlan();
    }

    detectObstacleAhead(state, car, range) {
        if (!state.track || !state.track.segments) return false;
        const currentPos = car.position;
        const lapDistance = state.track.lapDistance;
        const futurePos = currentPos + range;

        // Normalize future position for wrap-around
        const normFuture = futurePos % lapDistance;
        const segmentIndex = Math.floor(normFuture / (lapDistance / state.track.segments.length));
        const segment = state.track.segments[segmentIndex];
        if (!segment) return false;
        if (segment.obstacles && segment.obstacles.length > 0) {
            return segment.obstacles.some(o => Math.abs(o.lane - car.lane) < 0.5);
        }
        return false;
    }

    detectBoostPadAhead(state, car, range) {
        if (!state.track || !state.track.segments) return false;
        const currentPos = car.position;
        const lapDistance = state.track.lapDistance;
        const futurePos = currentPos + range;

        // Normalize future position for wrap-around
        const normFuture = futurePos % lapDistance;
        const segmentIndex = Math.floor(normFuture / (lapDistance / state.track.segments.length));
        const segment = state.track.segments[segmentIndex];
        if (!segment) return false;
        if (segment.boosts && segment.boosts.length > 0) {
            return segment.boosts.some(b => Math.abs(b.lane - car.lane) < 0.5);
        }
        return false;
    }
}

// Export for loader
if (typeof module !== 'undefined') {
    module.exports = PlayerBot;
}
