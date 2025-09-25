class PlayerBot {
  decide(state, car) {
    console.log("=== COMPLETE TRACK VISION Bot ===");
    
    // NOW you see EVERYTHING in ALL lanes as proper objects!
    
    // Get complete track information as objects
    const obstacles = state.getObstaclesAhead();
    const fuelStations = state.getFuelStationsAhead(); 
    const boostPads = state.getBoostPadsAhead();
    
    console.log("OBSTACLES:", obstacles.map(o => `Lane ${o.lane} @ ${o.distance}m`));
    console.log("FUEL STATIONS:", fuelStations.map(f => `Lane ${f.lane} @ ${f.distance}m`));
    console.log("BOOST PADS:", boostPads.map(b => `Lane ${b.lane} @ ${b.distance}m`));
    
    // 1. Handle immediate obstacles in my lane
    const myObstacles = obstacles.filter(obs => obs.lane === state.car.lane && obs.distance < 30);
    if (myObstacles.length > 0) {
      const nearestObstacle = myObstacles[0];
      console.log(`Obstacle in my lane ${state.car.lane} at ${nearestObstacle.distance}m!`);
      
      if (state.car.fuel > 15) {
        console.log("Jumping over obstacle!");
        car.executeAction(CAR_ACTIONS.JUMP);
        return;
      } else {
        // Find safest lane to dodge to
        let bestLane = -1;
        let bestScore = -1;
        
        for (let lane = 0; lane <= 2; lane++) {
          if (lane === state.car.lane) continue;
          if (!state.isLaneSafe(lane)) continue;
          
          // Score this lane based on objects
          const laneObstacles = obstacles.filter(obs => obs.lane === lane && obs.distance < 50);
          const laneFuel = fuelStations.filter(f => f.lane === lane && f.distance < 100);
          const laneBoosts = boostPads.filter(b => b.lane === lane && b.distance < 50);
          
          let score = 100 - (laneObstacles.length * 20) + (laneFuel.length * 10) + (laneBoosts.length * 5);
          
          if (score > bestScore) {
            bestScore = score;
            bestLane = lane;
          }
        }
        
        if (bestLane !== -1) {
          console.log(`Strategic dodge to lane ${bestLane}!`);
          if (bestLane < state.car.lane) {
            car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
          } else {
            car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
          }
          return;
        } else {
          console.log("No escape - braking!");
          car.executeAction(CAR_ACTIONS.BRAKE);
          return;
        }
      }
    }
    
    // 2. Strategic lane positioning based on ALL track elements
    if (!state.car.changingLane && state.car.fuel > 30) {
      let bestLane = state.car.lane;
      let bestScore = -1;
      
      for (let lane = 0; lane <= 2; lane++) {
        if (!state.isLaneSafe(lane)) continue;
        
        const laneObstacles = obstacles.filter(obs => obs.lane === lane && obs.distance < 80);
        const laneFuel = fuelStations.filter(f => f.lane === lane && f.distance < 150);
        const laneBoosts = boostPads.filter(b => b.lane === lane && b.distance < 80);
        
        // Score: avoid obstacles, seek boosts, consider fuel if low
        let score = 100 - (laneObstacles.length * 15) + (laneBoosts.length * 20);
        if (state.car.fuel < 40) {
          score += (laneFuel.length * 25); // Fuel is more important when low
        }
        
        // Inner lane bonus (shorter distance)
        if (lane === 0) score += 10;
        
        console.log(`Lane ${lane} score: ${score} (obs:${laneObstacles.length}, fuel:${laneFuel.length}, boost:${laneBoosts.length})`);
        
        if (score > bestScore) {
          bestScore = score;
          bestLane = lane;
        }
      }
      
      if (bestLane !== state.car.lane) {
        console.log(`Strategic move to better lane ${bestLane}!`);
        if (bestLane < state.car.lane) {
          car.executeAction(CAR_ACTIONS.CHANGE_LANE_RIGHT);
        } else {
          car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
        }
        return;
      }
    }
    
    // 3. Speed decisions based on what's coming
    const nearFuel = fuelStations.filter(f => f.lane === state.car.lane && f.distance < 40);
    const nearBoosts = boostPads.filter(b => b.lane === state.car.lane && b.distance < 30);
    
    if (nearFuel.length > 0 && state.car.fuel < 60) {
      console.log(`Fuel station at ${nearFuel[0].distance}m - coasting to refuel!`);
      car.executeAction(CAR_ACTIONS.COAST);
    } else if (nearBoosts.length > 0) {
      console.log(`Boost pad at ${nearBoosts[0].distance}m - using boost to maximize benefit!`);
      if (state.car.boosts > 0) {
        car.executeAction(CAR_ACTIONS.BOOST);
      } else {
        car.executeAction(CAR_ACTIONS.SPRINT);
      }
    } else if (state.car.fuel > 20) {
      console.log("Clear track - accelerating!");
      car.executeAction(CAR_ACTIONS.ACCELERATE);
    } else {
      console.log("Low fuel - conserving energy!");
      car.executeAction(CAR_ACTIONS.COAST);
    }
  }
}

// COMPLETE TRACK VISIBILITY WITH PROPER OBJECTS:
//
// state.getObstaclesAhead() returns array of:
// { lane: 0-2, distance: number, type: 'obstacle' }
//
// state.getFuelStationsAhead() returns array of:
// { lane: 0-2, distance: number, type: 'fuel_station' }
//
// state.getBoostPadsAhead() returns array of:
// { lane: 0-2, distance: number, type: 'boost_pad' }
//
// Convenience methods for your current lane:
// - state.hasObstacleAhead(), state.hasFuelStationAhead(), state.hasBoostPadAhead()
// - state.isLaneSafe(lane) - can I move to this lane safely?
//
// Now YOU can make strategic decisions with COMPLETE information as proper objects!