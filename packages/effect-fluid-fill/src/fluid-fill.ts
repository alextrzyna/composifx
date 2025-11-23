/**
 * FluidFill Effect
 *
 * Organic fluid fill animation effect that fills layer bounds based on transparency,
 * creating smooth growth animations using distance field algorithms.
 */

import { BaseEffect } from '@composifx/core';
import { NumberParameter } from '@composifx/core';
import type { Texture, RenderContext, Color, Vector2 } from '@composifx/core';

/**
 * Direction for fill animation
 */
export type FillDirection = 'center-out' | 'edge-in' | 'left-right' | 'top-bottom' | 'custom';

/**
 * Options for FluidFill effect
 */
export interface FluidFillOptions {
  /**
   * Fill direction
   * @default 'center-out'
   */
  direction?: FillDirection;

  /**
   * Custom anchor point (for 'custom' direction)
   * @default { x: 0.5, y: 0.5 } (center)
   */
  anchorPoint?: Vector2;

  /**
   * Fill speed multiplier
   * @default 1.0
   */
  speed?: number;

  /**
   * Fill color (RGBA, 0-255)
   * @default { r: 255, g: 107, b: 53, a: 255 }
   */
  fillColor?: Color;

  /**
   * Alpha threshold for transparency detection
   * @default 0.1
   */
  threshold?: number;

  /**
   * Initial progress value (0-1)
   * @default 0
   */
  progress?: number;
}

/**
 * FluidFill Effect
 *
 * Creates organic fluid fill animations that respect layer transparency.
 *
 * @example
 * ```typescript
 * const fluidFill = new FluidFill({
 *   direction: 'center-out',
 *   fillColor: { r: 255, g: 107, b: 53, a: 255 },
 *   speed: 1.0
 * });
 *
 * layer.addEffect(fluidFill);
 *
 * // Animate fill progress
 * fluidFill.animate('progress', [
 *   { time: 0, value: 0 },
 *   { time: 2, value: 1, easing: easing.easeInOutCubic }
 * ]);
 * ```
 */
export class FluidFill extends BaseEffect {
  public direction: FillDirection;
  public anchorPoint: Vector2;
  public fillColor: Color;
  public threshold: number;

  constructor(options: FluidFillOptions = {}) {
    super('FluidFill');

    // Set configuration
    this.direction = options.direction ?? 'center-out';
    this.anchorPoint = options.anchorPoint ?? { x: 0.5, y: 0.5 };
    this.fillColor = options.fillColor ?? { r: 255, g: 107, b: 53, a: 255 };
    this.threshold = options.threshold ?? 0.1;

    // Create animatable parameters
    this.parameters = {
      progress: new NumberParameter(options.progress ?? 0, 0, 1),
      speed: new NumberParameter(options.speed ?? 1.0, 0.1, 10),
    };
  }

  /**
   * Apply FluidFill effect to input texture
   *
   * For Phase 1, this implements a basic center-out radial fill
   * with alpha-based masking.
   */
  apply(input: Texture, context: RenderContext): Texture {
    // Get current parameter values
    const progress = this.getParameterValue<number>('progress', context.time);
    const speed = this.getParameterValue<number>('speed', context.time);

    // TODO: Implement WebGL shader-based rendering
    // For now, return input unchanged
    console.log(`FluidFill apply: progress=${progress}, speed=${speed}, direction=${this.direction}`);

    return input;
  }

  /**
   * Set fill color
   */
  setFillColor(color: Color): void {
    this.fillColor = color;
  }

  /**
   * Set fill direction
   */
  setDirection(direction: FillDirection): void {
    this.direction = direction;
  }

  /**
   * Set anchor point (for custom direction)
   */
  setAnchorPoint(point: Vector2): void {
    this.anchorPoint = point;
  }

  /**
   * Generate cache key for expensive SDF computation
   * The SDF only needs to be recomputed if the input texture changes
   */
  getCacheKey(): string {
    // TODO: Generate hash from input texture
    return `fluidfill_${this.direction}_${this.threshold}`;
  }

  /**
   * Cleanup WebGL resources
   */
  dispose(): void {
    // TODO: Clean up framebuffers, textures, etc.
  }
}
