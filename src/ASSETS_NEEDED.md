# SpeedOfThought - Assets Needed

## Visual Assets Required

### Track Elements
1. **Track Segments** (top-down view)
   - Straight track section (with 3 lanes marked)
   - Track curves (for oval turns)
   - Start/finish line
   - Pit lane entrance/exit
   - Track surface textures (asphalt)
   - Lane divider lines (dashed white)

### Cars (top-down view)
1. **Player 1 Car**
   - Base sprite
   - Boost/sprint effect sprite
   - Drafting glow effect
   - Damage/worn state (optional)

2. **Player 2 Car**
   - Different color scheme
   - Same state variations as Player 1

3. **Car Effects**
   - Exhaust flames (for boost)
   - Tire skid marks
   - Shadow underneath car

### Track Objects
1. **Obstacles**
   - Traffic cones
   - Barriers
   - Oil spills (optional)
   - Jump ramp (if obstacle is jumpable)

2. **Fuel Zones**
   - Fuel station graphic
   - Fuel pickup icon
   - Green zone marking on track

3. **Boost Pads**
   - Speed boost pad graphic
   - Activation effect (glow/arrows)
   - Chevron arrows showing speed

4. **Pit Lane**
   - Pit stop area
   - Fuel pump graphics
   - Pit crew (optional)

### UI Elements
1. **HUD Components**
   - Speedometer gauge
   - Fuel gauge
   - Lap counter badge
   - Position indicator (1st/2nd)
   - Boost charges icons

2. **Effects**
   - Speed lines (motion blur effect)
   - Particle effects (sparks, smoke)
   - Countdown numbers (3, 2, 1, GO!)
   - Victory/defeat banners

3. **Icons**
   - Play button
   - Pause button
   - Reset button
   - Speed controls (1x, 2x, 4x)
   - Debug mode icon
   - Trophy icon

### Backgrounds
1. **Environment**
   - Stadium/grandstands (background)
   - Sky/clouds
   - Grass infield
   - Crowd (optional, can be simple)

## Preferred Formats
- **PNG** with transparency for sprites
- **Sizes**:
  - Cars: 64x96 pixels
  - Track segments: 256x256 tiles
  - Icons: 32x32 or 48x48
  - Full track canvas: 1280x720 minimum

## Color Palette Suggestions
- **Player 1**: Red/Orange tones (#FF4444, #FF6B6B)
- **Player 2**: Blue/Cyan tones (#4444FF, #6B9FFF)
- **Track**: Dark gray asphalt (#2C2C2C)
- **Fuel Zones**: Green (#44FF44)
- **Boost Pads**: Yellow/Gold (#FFD700)
- **Obstacles**: Orange warning (#FF8C00)
- **UI Background**: Dark theme (#1A1A1A)

## Animation Frames Needed
1. **Car Jump** (3-5 frames)
   - Normal
   - Rising
   - Apex
   - Landing

2. **Boost Effect** (3 frames for loop)
   - Exhaust flame animation

3. **Fuel Pickup** (3 frames)
   - Approach
   - Collect
   - Sparkle effect

## Optional But Nice
- Loading screen graphic
- Character avatars for players
- Weather effects (rain drops)
- Night mode variants
- Celebration confetti

## Asset Organization
```
/src/assets/
├── cars/
│   ├── car1_normal.png
│   ├── car1_boost.png
│   ├── car2_normal.png
│   └── car2_boost.png
├── track/
│   ├── straight.png
│   ├── curve.png
│   ├── start_line.png
│   └── pit_lane.png
├── objects/
│   ├── cone.png
│   ├── fuel_zone.png
│   ├── boost_pad.png
│   └── pit_stop.png
├── ui/
│   ├── speedometer.png
│   ├── fuel_gauge.png
│   └── buttons.png
└── effects/
    ├── boost_trail.png
    ├── smoke.png
    └── sparks.png
```

## Notes for Asset Creation
- Keep sprites clean and readable at small sizes
- Use consistent perspective (top-down view)
- Ensure high contrast for visibility
- Consider colorblind-friendly palettes
- Optimize file sizes (use PNG compression)

Ready to receive assets! We can embed them as base64 in the HTML or load them dynamically.