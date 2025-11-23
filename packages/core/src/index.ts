/**
 * ComposiFX Core
 * Main entry point for the core composition engine
 */

// Core classes
export { Composition } from './composition.js';
export type { CompositionOptions } from './composition.js';

export { Layer } from './layer.js';
export type { LayerOptions } from './layer.js';

export { Parameter } from './parameter.js';

export { BaseEffect } from './effect.js';
export type { Effect } from './effect.js';

// Types
export type {
  Vector2,
  Color,
  BlendMode,
  EasingFunction,
  ImageSource,
  VideoSource,
  RenderableSource,
  ShaderType,
  Texture,
  RenderContext,
  Keyframe,
  TimelineEvent,
  EventHandler,
} from './types.js';

// Easing functions
export { easing } from './easing.js';
