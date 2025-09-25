class PlayerBot {
  constructor() {
    this.avoidingObstacle = false;
    this.avoidingObstacleSegmentCount = 0;
  }

  decide(state, car) {
    if (this.isObstacleInFront(state, state.car.lane)) {
        car.executeAction(CAR_ACTIONS.JUMP);
    }

    if (state.car.lane !== 0) {
        car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
    }

    if (state.car.lap === state.track.totalLaps) {
      car.executeAction(CAR_ACTIONS.BOOST);
    } else {
      car.executeAction(CAR_ACTIONS.ACCELERATE);
    }
  }

  isObstacleInFront(state, currentLane) {
    console.log("obstacle in front");

    return state.track.ahead[0].obstacles.length > 0 
        && state.track.ahead[0].obstacles[0].lane == currentLane;
  }
}
