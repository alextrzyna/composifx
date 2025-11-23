# ComposiFX Foundation Architecture Plan

## Document Status

**Last Updated:** 2025-11-23

**Implementation Status:** Phase 2 FluidFill Effect ⏳ **IN PROGRESS**

Phase 1 foundation is complete. Phase 2.1-2.3 (FluidFill package setup and shader creation) are complete. Currently working on Phase 2.4 (shader integration with WebGL2 renderer).

**Phase 1:** ✅ **FULLY COMPLETED**
- Complete foundation architecture including WebGL2 renderer and animation system

**Phase 2 Progress:**
- ✅ Phase 2.1: FluidFill package structure and API design
- ✅ Phase 2.2: SDF shaders created (Jump Flooding Algorithm)
- ✅ Phase 2.3: Basic radial fill shader created
- ⏳ Phase 2.4: WebGL2 renderer integration (NEXT)

**Current Capabilities:**
- ✅ Full composition system with timeline and playback controls
- ✅ WebGL2-accelerated rendering pipeline
- ✅ Keyframe animation with 30+ easing functions
- ✅ Layer transforms (position, scale, rotation, opacity)
- ✅ Texture management with caching and pooling
- ✅ Working interactive demo at http://localhost:5173

See [Development Roadmap](#7-development-roadmap) for detailed progress and next steps.

---

## Executive Summary

ComposiFX is a TypeScript/JavaScript library for creating scripted compositing, animation, and motion graphics rendered in the browser. This document outlines the scalable foundation architecture with a focus on:

- **AI Agent-Friendly API**: Clear, predictable, and well-documented interfaces
- **Modular Architecture**: Tree-shakeable, plugin-based system for effects
- **Performance**: WebGL2-based rendering with efficient caching
- **First Effect**: FluidFill - a fluid fill animation effect inspired by After Effects

---

## 1. Core Architecture

### 1.1 Technology Stack

**Rendering Backend**
- **Primary**: WebGL2 (with WebGL1 fallback)
- **Canvas API**: For 2D operations and fallback
- **WebGPU**: Future consideration as adoption increases

**Language & Build**
- **TypeScript**: Strict typing for better AI code generation and developer experience
- **ES Modules**: Native tree-shaking support
- **Build Tool**: Vite or Rollup for optimal bundling and code splitting

**Performance Considerations**
- Multi-frame rendering (MFR) support for parallel processing
- Compute caching system for expensive operations
- Efficient state management to minimize re-renders

### 1.2 Modular Plugin System

```
composifx/
├── core/              # Core composition engine (required)
├── effects/           # Effect plugins (optional, tree-shakeable)
│   ├── fluid-fill/
│   ├── blur/
│   ├── glow/
│   └── ...
├── renderers/         # Rendering backends
│   ├── webgl2/
│   ├── webgl/
│   └── canvas2d/
├── utils/             # Shared utilities
└── types/             # TypeScript definitions
```

**Import Strategy**
```typescript
// Minimal core
import { Composition, Layer } from 'composifx';

// Individual effects (tree-shakeable)
import { FluidFill } from 'composifx/effects/fluid-fill';
import { Blur } from 'composifx/effects/blur';

// Or via plugin registration
composition.use(FluidFill);
```

### 1.3 Core Components

#### Composition
The main container that manages layers, timeline, and rendering.

```typescript
interface Composition {
  width: number;
  height: number;
  duration: number;
  frameRate: number;
  backgroundColor?: Color;

  addLayer(layer: Layer): void;
  removeLayer(layer: Layer): void;
  render(time: number): void;
  play(): void;
  pause(): void;
}
```

#### Layer
Represents a visual element with transform, effects, and masks.

```typescript
interface Layer {
  name: string;
  source: ImageSource | VideoSource | null;
  position: Vector2;
  scale: Vector2;
  rotation: number;
  opacity: number;
  blendMode: BlendMode;

  // Effects stack
  effects: Effect[];

  // Masking
  masks: Mask[];

  // Keyframe animation
  animate(property: string, keyframes: Keyframe[]): void;
}
```

#### Effect
Base interface for all effects (blur, glow, fluid-fill, etc.)

```typescript
interface Effect {
  name: string;
  enabled: boolean;

  // Parameters that can be animated
  parameters: Record<string, Parameter>;

  // Apply effect to input texture
  apply(input: Texture, context: RenderContext): Texture;

  // Optional: compute caching for expensive effects
  getCacheKey?(): string;
}
```

---

## 2. AI-Friendly API Design

### 2.1 Design Principles

**Declarative Over Imperative**
- Describe *what* you want, not *how* to achieve it
- Chainable methods for fluent API
- Sensible defaults to minimize required configuration

**Predictable Naming**
- Consistent verb-noun patterns (`addLayer`, `removeEffect`)
- No abbreviations unless industry-standard
- Clear hierarchical structure

**Strong Typing**
- Comprehensive TypeScript definitions
- Discriminated unions for variant types
- Generic constraints where appropriate

**Documentation-First**
- JSDoc comments on all public APIs
- Example code in documentation
- Clear parameter descriptions with units

### 2.2 Example API Usage

```typescript
import { Composition, Layer, FluidFill, easing } from 'composifx';

// Create composition
const comp = new Composition({
  width: 1920,
  height: 1080,
  duration: 5, // seconds
  frameRate: 60
});

// Create layer from image
const logoLayer = new Layer({
  name: 'logo',
  source: await loadImage('./logo.png')
});

// Add FluidFill effect
const fluidFill = new FluidFill({
  direction: 'center-out',
  speed: 1.0,
  fillColor: '#ff6b35',
  style: 'fluid'
});

logoLayer.addEffect(fluidFill);

// Animate effect parameters
fluidFill.animate('progress', [
  { time: 0, value: 0 },
  { time: 2, value: 1, easing: easing.easeInOutCubic }
]);

// Add layer to composition
comp.addLayer(logoLayer);

// Render to canvas
comp.render(document.querySelector('#canvas'));
comp.play();
```

### 2.3 AI Agent Considerations

**Clear Error Messages**
- Descriptive errors with suggested fixes
- Validation on common mistakes
- Type errors at compile time when possible

**Discoverable API**
- Autocomplete-friendly structure
- Consistent method signatures
- Progressive enhancement (basic -> advanced)

**Configuration Objects**
- Named parameters via objects (not positional)
- Optional parameters with defaults
- Validation with helpful messages

---

## 3. FluidFill Effect Implementation

### 3.1 Overview

FluidFill is a fluid animation effect that fills layer bounds based on transparency, creating organic growth animations. It simulates liquid flowing through an image, avoiding transparent areas.

**Key Features** (from After Effects plugin)
- Uses layer transparency as a flow guide
- Multiple speed map modes (shape-based flow, turbulent noise, combined)
- Style builder for compositing multiple fill layers
- Real-time preview with compute caching
- Directional control (center-out, edge-in, custom anchor points)

### 3.2 Technical Approach

**Algorithm Overview**
1. **Transparency Analysis**: Read alpha channel to create a flow map
2. **Distance Field Generation**: Compute signed distance field (SDF) from opaque pixels
3. **Flow Simulation**: Use distance field to guide particle or flood-fill simulation
4. **Style Application**: Apply colors, textures, blending modes
5. **Output Composition**: Composite filled result with original

**WebGL2 Implementation**
- Fragment shader for SDF generation (Jump Flooding Algorithm)
- Compute shader for flow simulation (if supported)
- Multi-pass rendering for style composition
- Texture caching for performance

### 3.3 FluidFill API

```typescript
interface FluidFillOptions {
  // Flow direction
  direction: 'center-out' | 'edge-in' | 'left-right' | 'top-bottom' | 'custom';
  anchorPoint?: Vector2; // For 'custom' direction

  // Speed and timing
  speed: number; // Multiplier for fill speed
  speedMap?: Texture | 'turbulent-noise' | 'shape-based';

  // Visual style
  fillColor?: Color | Gradient;
  fillTexture?: Texture;
  blendMode?: BlendMode;

  // Advanced
  turbulence?: number; // 0-1, adds noise to flow
  threshold?: number; // Alpha threshold for transparency

  // Multi-layer style builder
  layers?: FluidFillLayer[];
}

interface FluidFillLayer {
  delay: number; // Offset in seconds
  color: Color;
  blendMode: BlendMode;
  blur?: number;
  displace?: number;
}

class FluidFill implements Effect {
  name = 'FluidFill';
  parameters = {
    progress: new Parameter(0, 0, 1), // Animatable 0-1
    speed: new Parameter(1.0, 0.1, 10),
    turbulence: new Parameter(0, 0, 1),
    // ... other parameters
  };

  constructor(options: FluidFillOptions);

  apply(input: Texture, context: RenderContext): Texture;

  // Precompute expensive operations
  precompute(input: Texture): void;
}
```

### 3.4 Implementation Phases

**Phase 1: Basic FluidFill**
- Simple center-out radial fill
- Single color fill
- Alpha-based masking
- Linear interpolation

**Phase 2: Distance Field Optimization**
- Jump Flooding Algorithm for SDF
- Shape-based flow direction
- Compute caching

**Phase 3: Advanced Features**
- Multiple speed map modes
- Turbulent noise integration
- Multi-layer style builder
- Custom anchor points

**Phase 4: Performance & Polish**
- Multi-frame rendering support
- Real-time preview optimization
- Preset system (30+ presets like AE plugin)

---

## 4. Rendering Architecture

### 4.1 Renderer Abstraction

```typescript
interface Renderer {
  initialize(canvas: HTMLCanvasElement): void;
  render(composition: Composition, time: number): void;
  dispose(): void;

  // Texture management
  createTexture(source: ImageSource): Texture;
  updateTexture(texture: Texture, source: ImageSource): void;

  // Shader compilation (WebGL-specific)
  compileShader?(source: string, type: ShaderType): Shader;
}
```

### 4.2 WebGL2 Renderer

**Rendering Pipeline**
1. **Setup**: Initialize WebGL2 context, compile shaders
2. **Upload**: Create textures from layer sources
3. **Effect Pass**: Apply effects in sequence (each effect = shader pass)
4. **Composite**: Blend layers according to blend modes
5. **Output**: Draw final result to canvas

**Texture Pooling**
- Reuse framebuffer textures to minimize allocation
- LRU cache for effect results
- Automatic cleanup of unused resources

**Shader Management**
- Hot-reload in development
- Optimized builds for production
- Fallback shaders for unsupported features

### 4.3 Fallback Strategy

```
WebGL2 (preferred)
  ↓ (if unavailable)
WebGL1 (limited features)
  ↓ (if unavailable)
Canvas2D (basic features only)
```

---

## 5. Animation & Timeline System

### 5.1 Keyframe Animation

```typescript
interface Keyframe<T = number> {
  time: number; // Seconds
  value: T;
  easing?: EasingFunction;

  // Bezier handles for custom curves
  inTangent?: T;
  outTangent?: T;
}

class Parameter<T = number> {
  constructor(
    public defaultValue: T,
    public min?: T,
    public max?: T
  ) {}

  keyframes: Keyframe<T>[] = [];

  // Get interpolated value at time
  valueAt(time: number): T;

  // Add keyframe
  addKeyframe(keyframe: Keyframe<T>): void;
}
```

### 5.2 Easing Functions

Standard easing library (similar to GSAP):
- Linear
- Quad, Cubic, Quart, Quint (In/Out/InOut)
- Sine, Expo, Circ (In/Out/InOut)
- Back, Elastic, Bounce (In/Out/InOut)
- Custom bezier curves

### 5.3 Timeline Control

```typescript
interface Timeline {
  currentTime: number;
  duration: number;
  playing: boolean;
  loop: boolean;

  play(): void;
  pause(): void;
  seek(time: number): void;

  // Events
  on(event: 'play' | 'pause' | 'complete', handler: () => void): void;
}
```

---

## 6. Project Structure

### 6.1 Current Directory Layout ✅ IMPLEMENTED

```
composifx/
├── packages/
│   ├── core/                    # @composifx/core ✅ IMPLEMENTED
│   │   ├── src/
│   │   │   ├── composition.ts   # Composition class ✅
│   │   │   ├── layer.ts         # Layer with animatable properties ✅
│   │   │   ├── effect.ts        # Effect system ✅
│   │   │   ├── parameter.ts     # Base Parameter class ✅
│   │   │   ├── animatable.ts    # NumberParameter & Vector2Parameter ✅
│   │   │   ├── easing.ts        # 30+ easing functions ✅
│   │   │   ├── types.ts         # TypeScript types ✅
│   │   │   └── index.ts         # Public API ✅
│   │   ├── package.json         # ✅
│   │   ├── tsconfig.json        # ✅
│   │   └── vite.config.ts       # ✅
│   │
│   └── renderer-webgl2/         # @composifx/renderer-webgl2 ✅ IMPLEMENTED
│       ├── src/
│       │   ├── webgl2-renderer.ts  # Main renderer ✅
│       │   ├── shader-loader.ts    # Shader compilation ✅
│       │   ├── texture-manager.ts  # Texture caching ✅
│       │   ├── shaders/
│       │   │   ├── basic.vert.glsl # Vertex shader ✅
│       │   │   └── basic.frag.glsl # Fragment shader ✅
│       │   └── index.ts            # Public API ✅
│       ├── package.json         # ✅
│       ├── tsconfig.json        # ✅
│       └── vite.config.ts       # ✅
│
├── examples/
│   └── basic/                   # ✅ IMPLEMENTED
│       ├── index.html           # Demo page ✅
│       ├── main.ts              # WebGL2 example with animations ✅
│       ├── package.json         # ✅
│       └── tsconfig.json        # ✅
│
├── design/                      # ✅ IMPLEMENTED
│   └── foundation-architecture.md  # This document ✅
│
├── DEVELOPMENT.md               # Dev guide ✅
├── README.md                    # Project overview ✅
├── package.json                 # Monorepo root ✅
├── pnpm-workspace.yaml          # Workspace config ✅
├── tsconfig.json                # Root TS config ✅
├── .prettierrc                  # Code formatting ✅
└── .gitignore                   # ✅
```

### 6.2 Planned Packages (Next: Phase 2)

```
packages/
├── effect-fluid-fill/        # @composifx/effect-fluid-fill (NEXT - Phase 2)
│   ├── src/
│   │   ├── shaders/
│   │   │   ├── sdf.frag
│   │   │   ├── flow.frag
│   │   │   └── composite.frag
│   │   ├── fluid-fill.ts
│   │   ├── presets.ts
│   │   └── index.ts
│   ├── examples/
│   └── package.json
│
└── effects/                 # Bundled effects package (planned)
    └── package.json         # Re-exports all effects
```

### 6.3 Package Strategy

**Separate Packages**
- `@composifx/core` - Core composition engine
- `@composifx/renderer-webgl2` - WebGL2 renderer
- `@composifx/effect-fluid-fill` - FluidFill effect
- `@composifx/effect-blur` - Blur effect
- `@composifx/effects` - Bundled effects (convenience)

**Installation Examples**
```bash
# Minimal install
npm install @composifx/core @composifx/renderer-webgl2

# With specific effects
npm install @composifx/effect-fluid-fill

# With all effects
npm install @composifx/effects
```

---

## 7. Development Roadmap

### Phase 1: Foundation ✅ COMPLETED
- [x] Project setup (TypeScript, build tools, testing)
- [x] Core composition system
- [x] Layer management with transforms
- [x] Simple animation/keyframe system
- [x] Effect plugin architecture
- [x] Comprehensive easing functions (30+)
- [x] Monorepo structure with pnpm workspaces
- [x] Basic example with Canvas2D rendering
- [x] Basic WebGL2 renderer ✅ **COMPLETED 2025-11-23**

**Completed Files:**
- `packages/core/src/composition.ts` - Timeline, playback, layer management
- `packages/core/src/layer.ts` - Layer with animatable Parameter properties
- `packages/core/src/effect.ts` - Base effect system
- `packages/core/src/parameter.ts` - Keyframe animation support
- `packages/core/src/animatable.ts` - NumberParameter & Vector2Parameter classes ✅ **NEW**
- `packages/core/src/easing.ts` - 30+ easing functions
- `packages/core/src/types.ts` - TypeScript definitions
- `packages/renderer-webgl2/` - WebGL2 renderer package ✅
  - `src/webgl2-renderer.ts` - Main renderer implementation
  - `src/shader-loader.ts` - Shader compilation and management
  - `src/texture-manager.ts` - Texture caching and pooling
- `examples/basic/` - Interactive demo with WebGL2 rendering and animations ✅

### Phase 1.5: Animation System Enhancement ✅ **COMPLETED 2025-11-23**

After initial WebGL2 renderer implementation, discovered and fixed animation system issues:

**Problem Identified:**
- Layer properties were plain values, not animatable
- `.animate()` method didn't exist on layer properties
- Time wasn't propagating to layers for animation evaluation

**Solution Implemented:**
- Created `NumberParameter` and `Vector2Parameter` classes with proper interpolation
- Updated `Layer` class to use Parameter instances for all animatable properties
- Added `updateTime()` method to Layer for time-based evaluation
- Added getter methods (`getPosition()`, `getScale()`, etc.) for evaluated values
- Updated `Composition.seek()` to propagate time to all layers
- Updated `WebGL2Renderer` to use getter methods for animated properties

**Result:**
- ✅ Fully functional keyframe animation system
- ✅ Smooth interpolation with 30+ easing functions
- ✅ Working example with animated position, scale, rotation, and opacity
- ✅ Interactive playback controls (Play, Pause, Reset)

---

### Phase 2: FluidFill Effect ⏳ IN PROGRESS

**Goal:** Implement the signature FluidFill effect with fluid animation capabilities.

**Prerequisites:** ✅ All complete
- WebGL2 renderer with shader pipeline
- Texture management system
- Parameter animation system
- Effect plugin architecture

**Progress:**

#### 2.1 Basic FluidFill Effect Package Setup ✅ COMPLETED
- [x] Create `@composifx/effect-fluid-fill` package structure
- [x] Set up package.json and build configuration
- [x] Define FluidFill effect class extending BaseEffect
- [x] Create basic parameter interface (progress, direction, color)

**Completed Files:**
- `packages/effect-fluid-fill/src/fluid-fill.ts` - FluidFill effect class with animatable parameters
- `packages/effect-fluid-fill/package.json` - Package configuration
- `packages/effect-fluid-fill/vite.config.ts` - Build configuration
- `examples/fluid-fill/` - Interactive demo example

#### 2.2 Distance Field Generation (SDF) ✅ SHADERS CREATED
- [x] Implement Jump Flooding Algorithm shaders
  - [x] Initialization pass (seed from alpha channel) - `sdf-init.frag.glsl`
  - [x] Jump flooding passes (iterative distance propagation) - `sdf-jump.frag.glsl`
  - [x] Final distance field output - `sdf-flow.frag.glsl`
- [ ] Create framebuffer management for multi-pass rendering
- [ ] Add SDF caching system for performance

**Shader Files Created:**
- `packages/effect-fluid-fill/src/shaders/sdf-init.frag.glsl` - SDF initialization from alpha
- `packages/effect-fluid-fill/src/shaders/sdf-jump.frag.glsl` - Jump flooding propagation
- `packages/effect-fluid-fill/src/shaders/sdf-flow.frag.glsl` - Flow direction generation

#### 2.3 Basic Radial Fill Implementation ✅ SHADER CREATED
- [x] Implement center-out radial fill shader - `radial-fill.frag.glsl`
- [x] Add progress parameter (0-1) for fill amount
- [x] Implement simple color fill (single solid color)
- [x] Add alpha-based masking using layer transparency
- [ ] Integrate shader into WebGL2 renderer pipeline

**Shader Files Created:**
- `packages/effect-fluid-fill/src/shaders/radial-fill.frag.glsl` - Basic radial fill effect

#### 2.4 Integration & Testing ⏳ IN PROGRESS
- [x] Create example demonstrating FluidFill effect
- [ ] Integrate shaders with WebGL2 renderer
- [ ] Test with various image sources and alpha channels
- [ ] Performance profiling and optimization
- [ ] Documentation for basic usage

**Next Steps:**
1. Integrate FluidFill shaders with WebGL2 renderer
2. Implement multi-pass rendering for SDF generation
3. Connect shader uniforms to effect parameters
4. Test and validate visual output
5. Performance optimization

**Timeline:** 1-2 weeks remaining for shader integration and testing

### Phase 3: Advanced Features (Weeks 7-9)
- [ ] Multiple speed map modes
- [ ] Turbulent noise
- [ ] Multi-layer style builder
- [ ] Preset system
- [ ] Polish and edge cases

### Phase 4: Documentation & Testing (Weeks 10-12)
- [x] Architecture documentation
- [x] Development guide
- [x] Basic README
- [ ] Comprehensive API documentation
- [ ] Interactive examples
- [ ] AI agent usage guide
- [ ] Performance benchmarks
- [ ] Unit and integration tests

---

## 8. Testing Strategy

### 8.1 Unit Tests
- Pure functions (easing, math utilities)
- Composition/Layer API methods
- Keyframe interpolation
- Parameter validation

### 8.2 Visual Regression Tests
- Snapshot testing for rendered output
- Cross-browser compatibility
- WebGL vs Canvas fallback comparison

### 8.3 Performance Tests
- Frame rate benchmarks
- Memory usage profiling
- Cache effectiveness metrics

### 8.4 AI Agent Tests
- Example scripts that AI would generate
- Common use case coverage
- Error handling validation

---

## 9. Documentation Strategy

### 9.1 API Documentation
- TSDoc comments on all public APIs
- Auto-generated from TypeScript types
- Interactive playground examples

### 9.2 AI Agent Guide
Special documentation section for AI agents:
- Common patterns and idioms
- Complete working examples
- Parameter ranges and units
- Performance considerations
- Error handling patterns

### 9.3 Example Gallery
- Categorized by complexity (beginner, intermediate, advanced)
- Searchable by effect type
- Editable in browser playground
- Export code functionality

---

## 10. Performance Considerations

### 10.1 Rendering Optimizations
- **Texture Caching**: Cache effect results when inputs unchanged
- **Dirty Flags**: Only re-render layers that changed
- **Batch Rendering**: Minimize state changes and draw calls
- **Level of Detail**: Reduce quality for real-time preview

### 10.2 Memory Management
- **Texture Pooling**: Reuse WebGL textures
- **Lazy Loading**: Load effects on demand
- **Garbage Collection**: Explicit disposal methods
- **Resource Limits**: Warn on excessive memory usage

### 10.3 Compute Caching (FluidFill)
```typescript
class FluidFillCache {
  // Cache expensive SDF computation
  private sdfCache = new Map<string, Texture>();

  getCachedSDF(input: Texture): Texture | null {
    const key = this.getTextureHash(input);
    return this.sdfCache.get(key) ?? null;
  }

  cacheSDF(input: Texture, sdf: Texture): void {
    const key = this.getTextureHash(input);
    this.sdfCache.set(key, sdf);
  }
}
```

---

## 11. Comparison with Existing Libraries

| Feature | ComposiFX | Two.js | Pixi.js | GSAP | After Effects |
|---------|-----------|--------|---------|------|---------------|
| **Primary Focus** | Motion graphics compositing | 2D drawing | 2D sprites/games | Animation library | Professional video |
| **Renderer** | WebGL2 (with fallbacks) | SVG/Canvas/WebGL | WebGL | DOM/SVG/Canvas | CPU/GPU |
| **Layer System** | ✅ Full (like AE) | ❌ | ⚠️ Basic | ❌ | ✅ Full |
| **Effects System** | ✅ Modular plugins | ❌ | ⚠️ Limited filters | ❌ | ✅ Extensive |
| **AI-Friendly API** | ✅ Designed for it | ⚠️ | ⚠️ | ✅ | ❌ |
| **Tree-Shakeable** | ✅ Per-effect | ❌ | ⚠️ | ⚠️ | N/A |
| **FluidFill** | ✅ Planned | ❌ | ❌ | ❌ | ✅ (plugin) |
| **Browser-Native** | ✅ | ✅ | ✅ | ✅ | ❌ |

**ComposiFX Unique Value**:
- After Effects-like workflow in the browser
- AI agent-optimized API design
- Modular effect system with tree-shaking
- High-performance WebGL2 rendering
- Scripting-first approach

---

## 12. Success Metrics

### 12.1 Technical Metrics
- **Bundle Size**: Core < 50KB gzipped, each effect < 20KB
- **Performance**: 60 FPS at 1080p for basic compositions
- **Load Time**: < 100ms to initialize
- **Memory**: < 100MB for typical project

### 12.2 Developer Experience
- **Time to First Animation**: < 5 minutes with examples
- **API Learnability**: AI agent success rate > 80%
- **Documentation Coverage**: 100% of public API
- **Error Clarity**: Error messages lead to solutions

### 12.3 Ecosystem
- **Effect Library**: 10+ effects in first year
- **Community Contributions**: Plugin system enables 3rd party effects
- **Integration Examples**: React, Vue, Svelte, vanilla JS

---

## 13. Risk Mitigation

### 13.1 Technical Risks

**Risk**: WebGL2 browser support
- **Mitigation**: WebGL1 and Canvas2D fallbacks

**Risk**: Performance on low-end devices
- **Mitigation**: Quality settings, frame skipping, reduced resolution

**Risk**: Complex shader debugging
- **Mitigation**: Shader validation, hot-reload, verbose error messages

### 13.2 API Design Risks

**Risk**: API too complex for AI agents
- **Mitigation**: Regular testing with LLMs, iterative simplification

**Risk**: Breaking changes during development
- **Mitigation**: Semver, deprecation warnings, migration guides

---

## References

### Fluid Fill Animation Research
- [Auto Fill v2 - aescripts.com](https://aescripts.com/autofill/) - Inspiration for fluid fill effects
- [Auto Fill Tips and Tricks Tutorial](https://aescripts.com/learn/autofill-tips-and-tricks---after-effects-tutorial/)
- [Auto Fill Plugin Everything](https://www.plugineverything.com/autofill)

### Motion Graphics Libraries
- [VFX-JS: WebGL Effects Made Easy](https://tympanus.net/codrops/2025/01/20/vfx-js-webgl-effects-made-easy/)
- [Two.js Homepage](https://two.js.org/)
- [Motion — JavaScript & React animation library](https://motion.dev)
- [Motion Graphics for the Web — Matt DesLauriers](https://mattdesl.svbtle.com/motion-graphics)

### WebGL & Rendering
- [Mixing PixiJS and Three.js](https://pixijs.com/8.x/guides/third-party/mixing-three-and-pixi)
- [PixiJS Update - v8.7.0](https://pixijs.com/blog/8.7.0)
- [WebGL: 2D and 3D graphics for the web - MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
- [A collection of WebGL and WebGPU frameworks and libraries](https://gist.github.com/dmnsgn/76878ba6903cf15789b712464875cfdc)

### API Design
- [Imperative vs Declarative drawing API](https://anvaka.github.io/sj/compare/)

---

## Appendix A: Distance Field Algorithm (for FluidFill)

The Signed Distance Field (SDF) is crucial for FluidFill's fluid behavior.

**Jump Flooding Algorithm (JFA)**
1. Initialize seeds from opaque pixels
2. Iteratively propagate in decreasing step sizes (N/2, N/4, N/8...)
3. Each pixel checks neighbors and updates to closest seed
4. Result: Distance to nearest opaque pixel

**GLSL Shader Pseudocode**
```glsl
// Pass 1: Initialize
vec4 initSDF(vec2 uv) {
  float alpha = texture(inputTexture, uv).a;
  if (alpha > threshold) {
    return vec4(uv, 0.0, 1.0); // seed position + distance + is_seed
  }
  return vec4(-1.0, -1.0, 999999.0, 0.0); // invalid
}

// Pass 2-N: Jump flooding
vec4 jumpFlood(vec2 uv, float stepSize) {
  vec4 closest = texture(sdfTexture, uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(x, y) * stepSize;
      vec4 neighbor = texture(sdfTexture, uv + offset);

      if (neighbor.w > 0.5) { // valid seed
        float dist = distance(uv, neighbor.xy);
        if (dist < closest.z) {
          closest = vec4(neighbor.xy, dist, 1.0);
        }
      }
    }
  }

  return closest;
}

// Final: Convert to flow direction
vec4 flowDirection(vec2 uv) {
  vec4 sdf = texture(sdfTexture, uv);
  vec2 direction = normalize(uv - sdf.xy);
  return vec4(direction, sdf.z, 1.0);
}
```

This SDF serves as the foundation for FluidFill's fluid simulation, guiding particles or flood-fill algorithms to create organic growth patterns that respect the layer's transparency.

---

## Appendix B: Initial File Structure

When starting implementation, create this initial structure:

```
composifx/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
├── README.md
│
├── packages/
│   └── core/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── composition.ts
│           ├── layer.ts
│           ├── effect.ts
│           └── types.ts
│
├── examples/
│   └── basic/
│       ├── index.html
│       └── main.ts
│
└── design/
    └── foundation-architecture.md  (this file)
```

This structure supports the modular architecture while keeping initial complexity low.
