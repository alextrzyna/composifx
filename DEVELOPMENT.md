# Development Guide

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Build All Packages

```bash
pnpm build
```

### Development Mode

Build packages in watch mode:

```bash
pnpm dev
```

### Run Example

```bash
cd examples/basic
pnpm dev
```

Then open http://localhost:5173 in your browser.

## Project Structure

```
composifx/
├── packages/
│   └── core/              # @composifx/core - Core composition engine
│       ├── src/
│       │   ├── composition.ts   # Main composition class
│       │   ├── layer.ts         # Layer management
│       │   ├── effect.ts        # Effect plugin system
│       │   ├── parameter.ts     # Animatable parameters
│       │   ├── easing.ts        # Easing functions
│       │   ├── types.ts         # TypeScript definitions
│       │   └── index.ts         # Public API exports
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
│
├── examples/
│   └── basic/             # Basic usage example
│       ├── index.html
│       ├── main.ts
│       └── package.json
│
├── design/                # Architecture documentation
│   └── foundation-architecture.md
│
└── [config files]
```

## Development Workflow

### Adding a New Package

1. Create directory in `packages/`
2. Add `package.json` with name `@composifx/package-name`
3. Add to `pnpm-workspace.yaml` if needed (already includes `packages/*`)
4. Run `pnpm install` to link workspace dependencies

### Adding a New Effect

Effects will be separate packages:

```
packages/
└── effect-name/
    ├── src/
    │   ├── index.ts
    │   └── shaders/
    ├── package.json
    └── tsconfig.json
```

### Type Checking

```bash
pnpm type-check
```

### Testing

```bash
pnpm test
```

(Tests not yet implemented)

## Code Style

This project uses:
- **TypeScript** with strict mode
- **Prettier** for code formatting
- **ESLint** for linting (configuration pending)

## Architecture Notes

### Core Concepts

1. **Composition** - Container for layers and timeline
2. **Layer** - Visual element with transforms and effects
3. **Effect** - Plugin that processes layer output
4. **Parameter** - Animatable value with keyframes

### Key Design Decisions

- **Tree-shakeable**: Effects are separate packages
- **TypeScript-first**: Full type safety
- **AI-friendly**: Clear, predictable API
- **Renderer-agnostic**: Core doesn't depend on WebGL

See [design/foundation-architecture.md](design/foundation-architecture.md) for detailed architecture.

## Next Steps

1. Implement WebGL2 renderer
2. Build Auto Fill effect
3. Add comprehensive tests
4. Create documentation site
5. Add more examples

## Resources

- [Architecture Plan](design/foundation-architecture.md)
- [Project README](README.md)
