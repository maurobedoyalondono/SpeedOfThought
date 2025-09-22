# SpeedOfThought - System Requirements

## 1. Executive Summary

SpeedOfThought is a competitive programming education platform designed for 15-16 year old students with minimal programming experience. Students write JavaScript bot logic to control race cars in a head-to-head racing simulation. The system runs entirely in a web browser with no server requirements, allowing teachers to distribute and run competitions from a USB drive.

## 2. Core Concept

### 2.1 Game Overview
- **Type**: Two-player racing simulation on an oval track
- **Competition**: Player vs Player (PvP) with simultaneous execution
- **Programming Model**: Students write a single JavaScript class with a `decide()` method
- **Execution**: Deterministic, tick-based simulation (60 ticks per second)
- **Victory Condition**: Complete specified number of laps fastest

### 2.2 Educational Philosophy
- **Simple to Start**: First working bot in 3 lines of code
- **Deep to Master**: Rich action set and state information for complex strategies
- **Learn by Doing**: Students discover optimal strategies through experimentation
- **Immediate Feedback**: Visual racing simulation shows consequences of code decisions

## 3. Student Programming Interface

### 3.1 Bot Structure
```javascript
class PlayerBot {
  constructor() {
    // Optional: Initialize any persistent state
    this.strategy = 'aggressive';
  }

  decide(state, car) {
    // Required: Make decisions each tick
    car.executeAction(CAR_ACTIONS.ACCELERATE);

    if (state.track.ahead[0].obstacles.length > 0) {
      car.executeAction(CAR_ACTIONS.CHANGE_LANE_LEFT);
    }
  }
}
```

### 3.2 Action System
Students control their car by executing actions. Multiple actions can be executed per tick, with intelligent conflict resolution:
- Speed actions (ACCELERATE, SPRINT, COAST, BRAKE) - last one wins
- Lane actions (CHANGE_LANE_LEFT, CHANGE_LANE_RIGHT) - last one wins
- Special actions (JUMP, ENTER_PIT) - can stack

### 3.3 State Information
Students receive complete race state each tick including:
- Car position, speed, fuel, and resources
- Opponent location and behavior patterns
- Track layout and upcoming obstacles/items
- Race progress and timing

## 4. Technical Architecture

### 4.1 Technology Stack
- **Frontend**: Pure HTML5 + CSS3 + JavaScript (ES6+)
- **Rendering**: Canvas API for smooth 60fps animation
- **Code Execution**: Web Workers for sandboxed bot execution
- **File Handling**: File API for loading student .js files
- **Storage**: None required (file-based workflow)
- **Dependencies**: Zero (single HTML file)

### 4.2 Deployment Model
- **Distribution**: Single index.html file
- **Execution**: Opens directly in any modern browser
- **Requirements**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Network**: None required (fully offline capable)

### 4.3 File-Based Workflow
1. Students write bot code in any text editor (VS Code, Notepad++, etc.)
2. Save as `PlayerName.js` file
3. Open `index.html` in browser
4. Drag and drop two .js files into the application
5. Click "RACE" to start competition

## 5. Game Mechanics

### 5.1 Physics Simulation
- **Movement**: Realistic acceleration/deceleration curves
- **Fuel Consumption**: Non-linear based on speed (exponential at high speeds)
- **Drafting**: Automatic efficiency boost when following opponent
- **Collisions**: Cars cannot occupy same space, blocking creates slowdown
- **Lane Changes**: Smooth transitions with time cost

### 5.2 Track Features
- **Layout**: Oval track with multiple lanes (typically 3)
- **Length**: Configurable (2000-5000 meters)
- **Elements**:
  - Obstacles (must jump or avoid)
  - Fuel zones (drive through to refuel)
  - Boost pads (temporary speed increase)
  - Pit lane (full refuel but time cost)

### 5.3 Resource Management
- **Fuel**: Primary resource, consumed by all actions
- **Boosts**: Limited use power-ups for speed bursts
- **Tire Condition**: Affects grip and efficiency (optional advanced feature)

## 6. User Interface Requirements

### 6.1 Visual Design
- **Style**: Attractive, game-like aesthetic appealing to teenagers
- **View**: Top-down perspective of oval track
- **Animation**: Smooth car movement with visual effects
- **Feedback**: Clear indication of speed, fuel, position
- **Colors**: Vibrant, high-contrast, colorblind-safe palette

### 6.2 Screen Layout
- **Main View**: Canvas showing race track (70% of screen)
- **Code Panels**: Display both players' code (collapsible)
- **Stats Panel**: Real-time race statistics
- **Control Panel**: Race controls (Start, Pause, Reset, Speed)
- **Log Panel**: Action history and debug information

### 6.3 Visual Elements
- **Cars**: Distinct colors/designs for each player
- **Effects**: Particle effects for boost, smoke for braking
- **Track**: Clear lane markings, visible obstacles
- **HUD**: Lap counter, speedometer, fuel gauge
- **Notifications**: "BOOST!", "LOW FUEL!", "PIT STOP!"

## 7. Performance Requirements

### 7.1 Execution Performance
- **Simulation Rate**: 60 ticks per second
- **Bot Execution Time**: <1ms per tick per bot
- **Render Performance**: Maintain 60fps on moderate hardware
- **Memory Usage**: <100MB for complete application
- **Load Time**: <2 seconds to start race

### 7.2 Scalability
- **Race Length**: Support 1-10 laps without performance degradation
- **Replay Size**: Store complete race history in <1MB
- **Tournament Size**: Handle 32 students in single-elimination

## 8. Security Requirements

### 8.1 Code Sandboxing
- **Isolation**: Bot code runs in Web Worker (no DOM access)
- **No Network**: Prevent all external communication
- **No File System**: Block file system access
- **No Imports**: Disallow module imports
- **CPU Limits**: Terminate bots exceeding 1ms execution time

### 8.2 State Protection
- **Immutable State**: Bots receive deep-cloned state objects
- **No Shared Memory**: Complete isolation between bots
- **Deterministic**: Same inputs always produce same race outcome

## 9. Educational Features

### 9.1 Progressive Difficulty
- **Tier 1**: Basic movement (ACCELERATE, BRAKE)
- **Tier 2**: Fuel management (COAST, fuel zones)
- **Tier 3**: Obstacles and lane changes
- **Tier 4**: Opponent interaction and drafting
- **Tier 5**: Full strategy with pit stops and boosts

### 9.2 Learning Support
- **Syntax Highlighting**: Built-in code display with highlighting
- **Error Messages**: Clear, beginner-friendly error descriptions
- **Action Log**: See what actions were executed each tick
- **Replay System**: Review races to understand outcomes
- **Debug Mode**: Step through race tick by tick

### 9.3 Assessment Tools
- **Metrics Collected**:
  - Code completeness (handles all scenarios)
  - Efficiency (fuel usage, lap times)
  - Robustness (crashes, illegal actions)
  - Strategy sophistication
- **Export Format**: CSV for grade tracking

## 10. Non-Functional Requirements

### 10.1 Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels for UI elements
- **Visual Options**: High contrast mode, colorblind modes
- **Text Size**: Adjustable font sizes
- **Animation**: Option to reduce/disable animations

### 10.2 Browser Compatibility
- **Chrome**: 90+ (primary target)
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile**: Not required (desktop-first design)

### 10.3 Localization
- **Languages**: English (primary), Spanish (planned)
- **Date/Time**: Use browser locale
- **Number Format**: Use browser locale

## 11. Future Enhancements (Post-v1)

### 11.1 Advanced Features
- Team races (2v2)
- Weather conditions affecting physics
- Car customization and upgrades
- Track editor for custom courses
- Online multiplayer competitions

### 11.2 Integration Options
- LMS integration via LTI
- Cloud storage for bot code
- Leaderboards and rankings
- Social features (share replays)

## 12. Success Criteria

### 12.1 Student Engagement
- Students can write first working bot in <5 minutes
- Average session length >20 minutes
- Students iterate on their code 5+ times per session

### 12.2 Learning Outcomes
- Students demonstrate understanding of:
  - Sequential execution
  - Conditional logic
  - State management
  - Resource optimization
  - Debugging techniques

### 12.3 Teacher Adoption
- Zero setup time required
- Works on all school computers
- No IT department involvement needed
- Clear assessment rubrics provided