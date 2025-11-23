# ComposiFX

A TypeScript/JavaScript library for scripted compositing, animation, and motion graphics rendered in the browser.

## Overview

ComposiFX brings After Effects-like compositing capabilities to the web with a scripting-first approach. The API is designed to be both human-friendly and AI agent-friendly, enabling powerful motion graphics creation through code.

## Features

- **Layer-based Composition** - Familiar workflow for video editors and motion designers
- **Modular Architecture** - Tree-shakeable effects system, only load what you need
- **AI-Friendly API** - Clear, predictable, and well-documented interfaces optimized for AI code generation
- **WebGL2 Rendering** - High-performance GPU-accelerated rendering with fallbacks
- **Rich Animation System** - Keyframe animation with extensive easing functions
- **TypeScript-First** - Full type safety and excellent IntelliSense support

## Project Status

🚧 **Early Development** - The foundation is being built. This is not yet ready for production use.

### Current Progress

- ✅ Core composition engine
- ✅ Layer management with transforms
- ✅ Animation and keyframe system (30+ easing functions)
- ✅ Effect plugin architecture
- ✅ WebGL2 renderer with texture management
- ✅ Interactive demo with animations
- 🚧 FluidFill effect (package structure complete, shader integration in progress)
- 🚧 Additional effects library

## Quick Start

```typescript
import { Composition, Layer, easing } from '@composifx/core';

// Create a composition
const comp = new Composition({
  width: 1920,
  height: 1080,
  duration: 5, // seconds
  frameRate: 60
});

// Create a layer
const layer = new Layer({
  name: 'My Layer',
  position: { x: 960, y: 540 },
  scale: { x: 1, y: 1 },
  opacity: 1
});

// Add layer to composition
comp.addLayer(layer);

// Control playback
comp.play();
comp.pause();
comp.seek(2.5);
```

## Installation

**Note:** Not yet published to npm. Currently in development.

For local development:

```bash
# Install dependencies (using pnpm)
pnpm install

# Build all packages
pnpm build

# Run example
cd examples/basic
pnpm dev
```

## Project Structure

```
composifx/
├── packages/
│   ├── core/                    # Core composition engine
│   ├── renderer-webgl2/         # WebGL2 renderer
│   └── effect-fluid-fill/        # FluidFill effect (in development)
├── examples/
│   ├── basic/                   # Basic WebGL2 example with animations
│   └── fluid-fill/               # FluidFill effect demo (in development)
└── design/                      # Architecture and design docs
```

## Architecture

ComposiFX uses a modular monorepo structure:

- **@composifx/core** - Core composition engine (layers, timeline, effects system)
- **@composifx/renderer-webgl2** - WebGL2 GPU-accelerated renderer
- **@composifx/effect-fluid-fill** - FluidFill effect (in development)
- Additional effect packages (planned)

See [design/foundation-architecture.md](design/foundation-architecture.md) for detailed architecture documentation.

## Roadmap

### Phase 1: Foundation ✅ COMPLETED
- Core composition system
- Layer management with animatable properties
- Animation/keyframe system with 30+ easing functions
- Effect plugin architecture
- WebGL2 renderer with shader pipeline
- Texture management and caching
- Interactive demo

### Phase 2: FluidFill Effect ⏳ IN PROGRESS
- Package structure and API design ✅
- Distance field generation shaders (Jump Flooding Algorithm) ✅
- Basic radial fill shader ✅
- WebGL2 renderer integration (in progress)
- Multi-pass rendering pipeline (pending)
- Visual testing and optimization (pending)

### Phase 3: Advanced Features (Planned)
- Multiple fill directions and speed maps
- Turbulent noise integration
- Multi-layer style builder
- Preset system with 30+ presets

### Phase 4: Ecosystem (Planned)
- Additional effects (blur, glow, displacement, etc.)
- Documentation site with API reference
- Interactive playground
- Community contributions

## Design Goals

1. **AI Agent-Friendly** - APIs that are predictable and easy for AI to use correctly
2. **Performance** - 60 FPS at 1080p for typical compositions
3. **Developer Experience** - Clear errors, great TypeScript support, excellent docs
4. **Modular** - Small bundle sizes through tree-shaking
5. **Web-Native** - No dependencies on native plugins or external services

## Contributing

This project is in early development. Contributions are welcome once the foundation is more stable.

## License

MIT

## Inspiration

ComposiFX is inspired by:
- Adobe After Effects - Industry-standard motion graphics workflow
- [FluidFill Plugin](https://aescripts.com/autofill/) - Fluid animation effects
- [Motion.dev](https://motion.dev) - Modern web animation
- [VFX-JS](https://tympanus.net/codrops/2025/01/20/vfx-js-webgl-effects-made-easy/) - Simplified WebGL effects

---

Built with ❤️ for the web motion graphics community
