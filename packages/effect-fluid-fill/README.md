# @composifx/effect-fluid-fill

FluidFill effect for ComposiFX - an organic fluid fill animation effect that creates smooth growth animations using distance field algorithms.

## Installation

```bash
npm install @composifx/core @composifx/renderer-webgl2 @composifx/effect-fluid-fill
```

## Usage

```typescript
import { Composition, Layer, easing } from '@composifx/core';
import { WebGL2Renderer } from '@composifx/renderer-webgl2';
import { FluidFill } from '@composifx/effect-fluid-fill';

// Create composition
const comp = new Composition({
  width: 1920,
  height: 1080,
  duration: 5,
  frameRate: 60,
});

// Create layer from image
const layer = new Layer({
  name: 'logo',
  source: await loadImage('./logo.png'),
});

// Create FluidFill effect
const fluidFill = new FluidFill({
  direction: 'center-out',
  fillColor: { r: 255, g: 107, b: 53, a: 255 },
  speed: 1.0,
  progress: 0,
});

// Add effect to layer
layer.addEffect(fluidFill);

// Animate fill progress
fluidFill.animate('progress', [
  { time: 0, value: 0 },
  { time: 2, value: 1, easing: easing.easeInOutCubic },
]);

// Add layer and render
comp.addLayer(layer);
```

## API

### `FluidFill`

Creates an organic fluid fill animation that respects layer transparency.

#### Constructor Options

```typescript
interface FluidFillOptions {
  direction?: FillDirection;
  anchorPoint?: Vector2;
  speed?: number;
  fillColor?: Color;
  threshold?: number;
  progress?: number;
}
```

**Options:**

- `direction` - Fill direction: `'center-out'`, `'edge-in'`, `'left-right'`, `'top-bottom'`, or `'custom'` (default: `'center-out'`)
- `anchorPoint` - Custom anchor point for `'custom'` direction (default: `{ x: 0.5, y: 0.5 }`)
- `speed` - Fill speed multiplier, range 0.1-10 (default: `1.0`)
- `fillColor` - Fill color in RGBA format, values 0-255 (default: `{ r: 255, g: 107, b: 53, a: 255 }`)
- `threshold` - Alpha threshold for transparency detection, range 0-1 (default: `0.1`)
- `progress` - Initial progress value, range 0-1 (default: `0`)

#### Animatable Parameters

- `progress` - Fill progress from 0 (no fill) to 1 (fully filled)
- `speed` - Fill speed multiplier

#### Methods

**`setFillColor(color: Color): void`**

Set the fill color dynamically.

**`setDirection(direction: FillDirection): void`**

Change the fill direction.

**`setAnchorPoint(point: Vector2): void`**

Set custom anchor point (for `'custom'` direction).

## Fill Directions

- **`center-out`** - Fill expands from the center outward
- **`edge-in`** - Fill grows from the edges inward
- **`left-right`** - Fill moves from left to right
- **`top-bottom`** - Fill moves from top to bottom
- **`custom`** - Fill from a custom anchor point

## Examples

### Basic Center-Out Fill

```typescript
const fluidFill = new FluidFill({
  direction: 'center-out',
  fillColor: { r: 52, g: 152, b: 219, a: 255 },
});

fluidFill.animate('progress', [
  { time: 0, value: 0 },
  { time: 2, value: 1, easing: easing.easeOutExpo },
]);
```

### Custom Direction with Anchor Point

```typescript
const fluidFill = new FluidFill({
  direction: 'custom',
  anchorPoint: { x: 0.2, y: 0.8 }, // Bottom-left
  fillColor: { r: 231, g: 76, b: 60, a: 255 },
});
```

### Variable Speed Animation

```typescript
const fluidFill = new FluidFill({
  direction: 'left-right',
  fillColor: { r: 46, g: 204, b: 113, a: 255 },
});

// Animate both progress and speed
fluidFill.animate('progress', [
  { time: 0, value: 0 },
  { time: 3, value: 1 },
]);

fluidFill.animate('speed', [
  { time: 0, value: 0.5 },
  { time: 1.5, value: 2.0 },
  { time: 3, value: 0.5 },
]);
```

## Implementation Status

**Phase 2.1 - Package Setup:** ✅ Complete

- Effect class with animatable parameters
- TypeScript definitions
- Build configuration

**Phase 2.2 - SDF Shaders:** ✅ Shaders Created

- Jump Flooding Algorithm implementation
- Distance field generation
- Flow direction calculation

**Phase 2.3 - Radial Fill:** ✅ Shader Created

- Basic center-out fill shader
- Alpha-based masking
- Color blending

**Phase 2.4 - Integration:** 🚧 In Progress

- WebGL2 renderer integration (pending)
- Multi-pass rendering (pending)
- Visual testing (pending)

## Technical Details

The FluidFill effect uses a **Signed Distance Field (SDF)** generated via the **Jump Flooding Algorithm** to create organic fill animations that respect layer transparency.

### Algorithm Overview

1. **Initialization** - Seeds the distance field from opaque pixels (alpha > threshold)
2. **Jump Flooding** - Iteratively propagates distance information in steps (N/2, N/4, N/8...)
3. **Flow Generation** - Converts distance field to flow direction vectors
4. **Fill Rendering** - Uses flow and progress to create organic fill effect

### Shaders

- `sdf-init.frag.glsl` - SDF initialization from alpha channel
- `sdf-jump.frag.glsl` - Jump flooding distance propagation
- `sdf-flow.frag.glsl` - Flow direction generation
- `radial-fill.frag.glsl` - Basic radial fill rendering

## Browser Support

- WebGL2 required
- Modern browsers (Chrome, Firefox, Safari, Edge)

## License

MIT

## Related

- [@composifx/core](../core) - Core composition engine
- [@composifx/renderer-webgl2](../renderer-webgl2) - WebGL2 renderer
- [Foundation Architecture](../../design/foundation-architecture.md) - Technical design document
