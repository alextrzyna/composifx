/**
 * Core type definitions for ComposiFX
 */

/**
 * 2D vector with x and y coordinates
 */
export interface Vector2 {
  x: number;
  y: number;
}

/**
 * RGBA color with values from 0-255
 */
export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Blend modes for layer compositing
 */
export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'add';

/**
 * Easing function type
 */
export type EasingFunction = (t: number) => number;

/**
 * Image source types
 */
export type ImageSource = HTMLImageElement | HTMLCanvasElement | ImageBitmap;

/**
 * Video source types
 */
export type VideoSource = HTMLVideoElement;

/**
 * Any renderable source
 */
export type RenderableSource = ImageSource | VideoSource;

/**
 * Shader types for WebGL
 */
export type ShaderType = 'vertex' | 'fragment';

/**
 * Texture interface (abstract - implemented by renderer)
 */
export interface Texture {
  width: number;
  height: number;
  dispose(): void;
}

/**
 * Rendering context passed to effects
 */
export interface RenderContext {
  time: number;
  deltaTime: number;
  frameRate: number;
  width: number;
  height: number;
}

/**
 * Keyframe for animation
 */
export interface Keyframe<T = number> {
  time: number;
  value: T;
  easing?: EasingFunction;
  inTangent?: T;
  outTangent?: T;
}

/**
 * Events emitted by timeline
 */
export type TimelineEvent = 'play' | 'pause' | 'seek' | 'complete';

/**
 * Event handler type
 */
export type EventHandler = () => void;
