# Assets Directory Structure

Place your image assets in the following folders:

## 📁 `/assets/cars/`
- `car1_normal.png` - Player 1 car (red/orange theme)
- `car1_boost.png` - Player 1 with boost effect
- `car2_normal.png` - Player 2 car (blue theme)
- `car2_boost.png` - Player 2 with boost effect
- `car_shadow.png` - Shadow under cars
- `car_jumping.png` - Car in mid-jump (optional)

## 📁 `/assets/track/`
- `track_straight.png` - Straight track segment
- `track_curve_left.png` - Left curve
- `track_curve_right.png` - Right curve
- `start_line.png` - Start/finish line
- `pit_lane.png` - Pit lane entrance/exit
- `lane_divider.png` - Dashed line between lanes

## 📁 `/assets/objects/`
- `cone.png` - Traffic cone obstacle
- `fuel_zone.png` - Fuel station/zone marker
- `boost_pad.png` - Speed boost pad
- `pit_stop.png` - Pit stop area

## 📁 `/assets/ui/`
- `speedometer.png` - Speed gauge
- `fuel_gauge.png` - Fuel indicator
- `boost_icon.png` - Boost charge indicator
- `lap_counter.png` - Lap display
- `position_1st.png` - 1st place badge
- `position_2nd.png` - 2nd place badge
- `btn_start.png` - Start button
- `btn_pause.png` - Pause button
- `btn_reset.png` - Reset button

## 📁 `/assets/effects/`
- `boost_trail.png` - Speed trail effect
- `smoke.png` - Tire smoke
- `sparks.png` - Collision sparks
- `draft_lines.png` - Drafting indicator
- `jump_dust.png` - Landing dust effect

## Recommended Specifications

### Image Format
- **Format**: PNG with transparency
- **Color Mode**: RGBA

### Sizes
- **Cars**: 64x96 pixels (top-down view)
- **Track tiles**: 256x256 pixels
- **Obstacles**: 32x48 pixels
- **UI icons**: 48x48 pixels
- **Effects**: Various (keep under 128x128)

### Style Guidelines
- **Perspective**: Top-down view for all track elements
- **Colors**: Bright, high contrast for visibility
- **Style**: Cartoon/arcade game aesthetic appeals to teenagers

## How to Integrate Assets

Once you've added your images, update the `index.html` file to load them:

1. Add an assets loader section:
```javascript
const assets = {
    cars: {
        player1: new Image(),
        player2: new Image()
    },
    // ... etc
};

// Load assets
assets.cars.player1.src = 'assets/cars/car1_normal.png';
assets.cars.player2.src = 'assets/cars/car2_normal.png';
```

2. Update the renderer to use sprites instead of shapes:
```javascript
// Instead of fillRect for cars:
ctx.drawImage(assets.cars.player1, x, y, width, height);
```

## Current Implementation

The game currently uses **canvas drawing** for all graphics, so it works without any external images. When you add assets, they will enhance the visual experience but are not required for the game to function.