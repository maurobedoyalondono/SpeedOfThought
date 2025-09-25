class PlayerBot {
  decide(state, car) {
    // Check for close obstacles in my lane (within 20m)
    const obstaclesInMyLane = state.getObstaclesAhead().filter(obstacle => 
      obstacle.lane === state.car.lane && obstacle.distance <= 5
    );

    // Jump if there's a close obstacle and we're not already jumping
    if (obstaclesInMyLane.length > 0 && !state.car.isJumping && state.car.fuel >= 5) {
      car.executeAction(CAR_ACTIONS.JUMP);
    }

    // Only accelerate if we have enough fuel (keep at least 10 for emergencies)
    if (state.car.fuel > 10) {
      car.executeAction(CAR_ACTIONS.ACCELERATE);
    } else {
      // Low fuel - just coast
      car.executeAction(CAR_ACTIONS.COAST);
    }
  }
}
