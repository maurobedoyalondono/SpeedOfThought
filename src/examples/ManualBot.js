class PlayerBot {
  constructor() {
    this.tick = 0;
    this.laneChangeTick = 0;
  }

  decide(state, car) {
    this.tick++;

    const closeObstaclesInMyLane = state.getObstaclesAhead().filter(obstacle =>
      obstacle.lane === state.car.lane && obstacle.distance <= 10
    );

    if (closeObstaclesInMyLane.length > 0) {
      if (state.car.lane === 1 || state.car.lane === 2) {
        car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
      } else {
        car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
      }
      this.laneChangeTick = this.tick;
    } else {
      if (state.car.lane > 0) {
        if (this.tick - this.laneChangeTick > 60) {
          car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
        }        
      }
    }

    car.executeAction(CAR_ACTIONS.ACCELERATE);
  }
}
