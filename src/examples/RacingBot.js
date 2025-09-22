// RacingBot - Competitive racing with tactics
// Uses drafting, blocking, and smart boost usage
//
// TRACK ELEMENTS:
// - Orange cones = OBSTACLES (avoid these or crash!)
// - Yellow zones = BOOST PADS (drive over for +20 km/h speed)
// - Green zones = FUEL ZONES (drive through to refuel)
// - Inner lane (0) is shorter (5% less distance)
// - Outer lane (2) is longer (5% more distance)
// - Drafting behind opponent saves 30% fuel!

class PlayerBot {
    constructor() {
        this.lastOpponentDistance = 0;
        this.raceMode = "normal";
    }

    decide(state, car) {
        // PRIORITY 1: Avoid obstacles (but check boost pads first if very close)
        const immediateObstacle = this.checkImmediateObstacle(state);
        const immediateBoost = this.checkImmediateBoost(state);

        // If boost is RIGHT HERE and no obstacle, get it!
        if (immediateBoost && !immediateObstacle) {
            if (immediateBoost.lane < state.car.lane) {
                car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
            } else if (immediateBoost.lane > state.car.lane) {
                car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
            }
            return;
        }

        // Avoid obstacles
        if (immediateObstacle && immediateObstacle.lane === state.car.lane) {
            // Smart avoidance - prefer inner lane (shorter!)
            if (state.car.lane === 0) {
                car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
            } else if (state.car.lane === 2) {
                car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
            } else {
                // Middle lane - go to inner if opponent isn't there
                if (state.opponent.lane !== 0) {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                } else {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                }
            }
            return;
        }

        // RACING TACTICS
        const opponentAhead = state.opponent.distance > 0;
        const gap = Math.abs(state.opponent.distance);

        // Drafting strategy (saves fuel!)
        if (opponentAhead && gap > 5 && gap < 25) {
            if (state.opponent.lane !== state.car.lane) {
                // Get behind them for drafting
                if (state.opponent.lane < state.car.lane) {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                } else {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                }
                return;
            }
        }

        // Blocking strategy (if we're ahead)
        if (!opponentAhead && gap < 15) {
            if (state.opponent.lane !== state.car.lane) {
                // Block them!
                if (state.opponent.lane < state.car.lane) {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                } else {
                    car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                }
                return;
            }
        }

        // BOOST USAGE
        if (state.car.boosts > 0) {
            // Use boost to overtake
            if (opponentAhead && gap < 30) {
                car.executeAction(CAR_ACTIONS.BOOST);
                return;
            }
            // Use boost to defend
            if (!opponentAhead && gap < 10 && this.opponentGaining()) {
                car.executeAction(CAR_ACTIONS.BOOST);
                return;
            }
            // Final lap sprint
            if (state.car.lap === state.track.totalLaps) {
                car.executeAction(CAR_ACTIONS.BOOST);
                return;
            }
        }

        // Look for boost pads (only if close)
        for (let i = 0; i < Math.min(2, state.track.ahead.length); i++) {
            if (state.track.ahead[i].type === 'boost_zone' && state.track.ahead[i].items) {
                const boostPad = state.track.ahead[i].items[0];
                if (boostPad && boostPad.lane !== state.car.lane) {
                    if (boostPad.lane < state.car.lane) {
                        car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
                    } else {
                        car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
                    }
                    return;
                }
            }
        }

        // SPEED MANAGEMENT based on position
        if (!opponentAhead && gap > 100) {
            this.raceMode = "cruising";
        } else if (opponentAhead && gap > 100) {
            this.raceMode = "catching_up";
        } else {
            this.raceMode = "battle";
        }

        // Execute based on mode and fuel
        if (this.raceMode === "cruising") {
            // We're way ahead - save fuel
            if (state.car.fuel > 50) {
                car.executeAction(CAR_ACTIONS.ACCELERATE);
            } else {
                car.executeAction(CAR_ACTIONS.COAST);
            }
        } else if (this.raceMode === "catching_up") {
            // We're behind - push hard!
            if (state.car.fuel > 25) {
                car.executeAction(CAR_ACTIONS.SPRINT);
            } else if (state.car.fuel > 15) {
                car.executeAction(CAR_ACTIONS.ACCELERATE);
            } else {
                car.executeAction(CAR_ACTIONS.COAST);
            }
        } else {
            // Close battle!
            if (state.car.isDrafting && state.car.fuel < 40) {
                // Drafting saves fuel - just coast!
                car.executeAction(CAR_ACTIONS.COAST);
            } else if (state.car.fuel > 35) {
                car.executeAction(CAR_ACTIONS.SPRINT);
            } else if (state.car.fuel > 20) {
                car.executeAction(CAR_ACTIONS.ACCELERATE);
            } else {
                car.executeAction(CAR_ACTIONS.COAST);
            }
        }

        // Track opponent movement
        this.lastOpponentDistance = state.opponent.distance;
    }

    checkImmediateObstacle(state) {
        if (state.track.ahead[0].obstacles && state.track.ahead[0].obstacles.length > 0) {
            return state.track.ahead[0].obstacles[0];
        }
        return null;
    }

    checkImmediateBoost(state) {
        if (state.track.ahead[0].type === 'boost_zone' && state.track.ahead[0].items) {
            return state.track.ahead[0].items[0];
        }
        return null;
    }

    opponentGaining() {
        // Simple check - in real race we'd track over time
        return Math.random() > 0.5;
    }
}