# SpeedOfThought - Use Cases

## 1. Student Use Cases

### UC1.1: First Time Student - Hello Race
**Actor**: Student with no programming experience
**Precondition**: Student has index.html and access to text editor
**Flow**:
1. Teacher demonstrates simplest possible bot:
   ```javascript
   class PlayerBot {
     decide(state, car) {
       car.executeAction(CAR_ACTIONS.ACCELERATE);
     }
   }
   ```
2. Student types this code in Notepad/VS Code
3. Saves as `MyFirstBot.js`
4. Opens index.html in browser
5. Drags MyFirstBot.js to Player 1 slot
6. Drags teacher's ExampleBot.js to Player 2 slot
7. Clicks "RACE!"
8. Watches their car accelerate (and probably crash)
9. Sees the crash in the log: "Lap 1, Tick 145: Hit obstacle - No JUMP action"
**Outcome**: Student understands the basic write-save-test cycle

### UC1.2: Learning from Failure
**Actor**: Student who just watched their bot crash
**Precondition**: Student's bot crashed into obstacle
**Flow**:
1. Student reads error log: "Hit obstacle at position 245"
2. Clicks "Show State at Crash" button
3. Sees state.track.ahead showed obstacle coming
4. Modifies code:
   ```javascript
   class PlayerBot {
     decide(state, car) {
       if (state.track.ahead[0].obstacles.length > 0) {
         car.executeAction(CAR_ACTIONS.JUMP);
       }
       car.executeAction(CAR_ACTIONS.ACCELERATE);
     }
   }
   ```
5. Saves file
6. Clicks "Reload Bots" in browser
7. Races again
8. Car successfully jumps obstacle!
**Outcome**: Student learns debugging process and conditional logic

### UC1.3: Discovering Features Through State
**Actor**: Student exploring the framework
**Precondition**: Basic bot working, student curious about state
**Flow**:
1. Student adds console.log to explore:
   ```javascript
   decide(state, car) {
     if (state.car.fuel < 20) {
       console.log("Low fuel!", state.car.fuel);
     }
   }
   ```
2. Notices fuel decreasing during race
3. Sees car stops when fuel reaches 0
4. Explores state object, finds state.track.ahead[i].type === 'fuel_zone'
5. Implements fuel strategy:
   ```javascript
   if (state.car.fuel < 30 && nearFuelZone(state)) {
     car.executeAction(CAR_ACTIONS.COAST);
   }
   ```
6. Discovers COAST uses less fuel
**Outcome**: Student learns resource management through exploration

### UC1.4: Competitive Iteration
**Actor**: Student competing against classmate
**Precondition**: Both students have working bots
**Flow**:
1. Student loads their bot vs friend's bot
2. Loses race - opponent is faster
3. Reviews replay, notices opponent using SPRINT
4. Checks CAR_ACTIONS documentation/autocomplete
5. Discovers SPRINT action exists
6. Implements smart sprinting:
   ```javascript
   if (state.car.fuel > 60 && state.opponent.distance < 0) {
     car.executeAction(CAR_ACTIONS.SPRINT);
   }
   ```
7. Re-races, now competitive!
8. Iterates further: drafting, blocking, pit strategy
**Outcome**: Competition drives deeper learning

### UC1.5: Advanced Strategy Development
**Actor**: Student mastering the framework
**Precondition**: Student comfortable with basics
**Flow**:
1. Student analyzes opponent patterns:
   ```javascript
   class PlayerBot {
     constructor() {
       this.opponentHistory = [];
     }

     decide(state, car) {
       this.opponentHistory.push(state.opponent.speed);

       if (this.predictOpponentPit()) {
         car.executeAction(CAR_ACTIONS.SPRINT);
       }
     }
   }
   ```
2. Implements multi-factor decisions
3. Optimizes fuel efficiency curves
4. Times pit stops strategically
5. Uses replay analysis to refine strategy
**Outcome**: Deep algorithmic thinking emerges

## 2. Teacher Use Cases

### UC2.1: Classroom Setup
**Actor**: Computer Science teacher
**Precondition**: Has SpeedOfThought on USB drive
**Flow**:
1. Copies index.html to shared network folder
2. Creates `StudentExamples/` folder with progressive examples
3. Opens index.html on projector
4. Demonstrates basic bot creation live
5. Shows students where to save their .js files
6. Runs first race: TeacherBot vs SimpleBot
**Outcome**: Class ready to start programming

### UC2.2: Running a Lesson
**Actor**: Teacher facilitating Lesson 2 (Fuel Management)
**Precondition**: Students completed Lesson 1 (basic movement)
**Flow**:
1. Teacher loads `Lessons/Lesson2_Fuel.html` (preconfigured track)
2. Shows track with prominent fuel zones
3. Demonstrates bot running out of fuel
4. Guides students to discover state.car.fuel
5. Students experiment with COAST vs ACCELERATE
6. Teacher shows fuel consumption graph
7. Challenges: "Complete 3 laps on 50 fuel"
**Outcome**: Students understand resource management

### UC2.3: Managing a Tournament
**Actor**: Teacher running class competition
**Precondition**: All students have submitted bot files
**Flow**:
1. Teacher collects all .js files in `Tournament/` folder
2. Opens index.html in Tournament Mode
3. Loads all bot files (drag & drop multiple)
4. System shows bracket automatically
5. Teacher clicks "Run Round 1"
6. All matches run sequentially (or parallel on multiple screens)
7. Winners advance automatically
8. Teacher projects bracket on screen
9. Finals run with commentary
10. Exports results as CSV for grading
**Outcome**: Engaging competition with minimal management

### UC2.4: Assessment and Grading
**Actor**: Teacher evaluating student work
**Precondition**: Students submitted final bots
**Flow**:
1. Teacher loads student bot vs StandardTestBot
2. Runs on 3 different tracks (easy, medium, hard)
3. Reviews metrics:
   - Completion rate (finished without crashing)
   - Average lap time
   - Fuel efficiency
   - Code quality (displayed with syntax highlighting)
4. Uses rubric overlay on screen
5. Exports grade sheet with metrics + comments
**Outcome**: Objective assessment with clear criteria

### UC2.5: Debugging Student Code
**Actor**: Teacher helping struggling student
**Precondition**: Student's bot behaving incorrectly
**Flow**:
1. Teacher loads student's bot
2. Enables Debug Mode (tick-by-tick stepping)
3. Opens DevTools console
4. Steps through race tick by tick
5. Shows state object at each tick
6. Highlights which actions were executed
7. Identifies logic error with student
8. Helps student fix the condition
**Outcome**: Student learns debugging techniques

## 3. Competition Use Cases

### UC3.1: Lunch-time Racing Club
**Actor**: Students self-organizing races
**Precondition**: Students have access to computer lab
**Flow**:
1. Students share index.html via USB/network
2. Each brings their latest bot on USB
3. Set up elimination bracket on whiteboard
4. Run matches on different computers
5. Winners advance, update bracket
6. Share particularly clever strategies
7. Iterate and improve between rounds
**Outcome**: Organic learning community forms

### UC3.2: Inter-Class Championship
**Actor**: Multiple classes competing
**Precondition**: Multiple teachers using SpeedOfThought
**Flow**:
1. Each class runs internal tournament
2. Top 2 from each class advance
3. Championship held in auditorium
4. Races projected on big screen
5. Live commentary by teachers
6. Winning code displayed and explained
7. Trophy/certificate for winners
**Outcome**: School-wide engagement with programming

### UC3.3: Asynchronous Competition
**Actor**: Students competing from home
**Precondition**: Students have index.html at home
**Flow**:
1. Teacher posts TrackOfTheWeek.json
2. Students download track file
3. Develop and test bot at home
4. Submit .js file by deadline
5. Teacher runs all bots on same track
6. Posts replay files for all to watch
7. Leaderboard updated weekly
**Outcome**: Extended engagement beyond class time

## 4. Progressive Learning Path

### UC4.1: Complete Lesson Progression

**Lesson 1: First Movement**
- Objective: Write first bot, understand tick-based execution
- New Concepts: Functions, car.executeAction()
- Actions Available: ACCELERATE, BRAKE
- Success: Complete 1 lap without stopping

**Lesson 2: Fuel Management**
- Objective: Manage resources
- New Concepts: Conditionals, state reading
- Actions Available: + COAST
- Success: Complete 3 laps on limited fuel

**Lesson 3: Obstacles and Reactions**
- Objective: React to track hazards
- New Concepts: Arrays, lookahead
- Actions Available: + JUMP, CHANGE_LANE_LEFT/RIGHT
- Success: Complete track with obstacles

**Lesson 4: Racing an Opponent**
- Objective: Strategic competition
- New Concepts: Relative positioning, patterns
- Actions Available: + SPRINT, BOOST
- Success: Beat intermediate-level bot

**Lesson 5: Pit Strategy**
- Objective: Long-term planning
- New Concepts: Complex state, planning
- Actions Available: + ENTER_PIT
- Success: Win 10-lap endurance race

## 5. Edge Cases and Error Handling

### UC5.1: Invalid Student Code
**Scenario**: Student's .js file has syntax error
**Handling**:
1. System catches error when loading
2. Shows friendly error message with line number
3. Highlights problematic code
4. Suggests common fixes
5. Allows race with "DefaultBot" as placeholder

### UC5.2: Infinite Loop in Bot
**Scenario**: Student creates infinite loop in decide()
**Handling**:
1. Web Worker detects timeout (>1ms)
2. Terminates bot execution for that tick
3. Executes IDLE action
4. Logs warning: "Bot timeout at tick 234"
5. Race continues, student sees consequence

### UC5.3: Browser Compatibility Issues
**Scenario**: Student using older browser
**Handling**:
1. index.html detects browser version
2. Shows compatibility warning
3. Provides fallback rendering (if possible)
4. Suggests browser update with links
5. Offers "BasicMode" with reduced features

### UC5.4: Large Tournament Management
**Scenario**: 50+ students in tournament
**Handling**:
1. System offers "Pool Play" format
2. Divides into groups of 8
3. Round-robin within groups
4. Top 2 from each group advance
5. Automatic scheduling and result tracking

## 6. Success Metrics

### Student Success Indicators
- Time to first working bot: <5 minutes
- Iterations per session: 5-10
- Progress through lessons: 80% reach Lesson 3
- Competition participation: 70% enter tournaments
- Code sophistication: Measurable increase in condition complexity

### Teacher Success Indicators
- Setup time: <10 minutes
- Lesson completion rate: 90%
- Technical issues: <1 per session
- Student engagement: Visible excitement
- Assessment time: <2 minutes per student

### System Success Indicators
- Load time: <2 seconds
- Race execution: Smooth 60fps
- Crash rate: <0.1%
- Browser compatibility: 95%+
- File handling: 100% reliable