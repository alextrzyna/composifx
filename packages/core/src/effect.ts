/**
 * Base Effect interface and implementation
 */

import type { Texture, RenderContext } from './types.js';
import { Parameter } from './parameter.js';

/**
 * Base interface for all effects
 */
export interface Effect {
  /**
   * Effect name for identification
   */
  name: string;

  /**
   * Whether this effect is enabled
   */
  enabled: boolean;

  /**
   * Animatable parameters
   */
  parameters: Record<string, Parameter>;

  /**
   * Apply effect to input texture and return output texture
   * @param input - Input texture to process
   * @param context - Rendering context with time, dimensions, etc.
   * @returns Processed output texture
   */
  apply(input: Texture, context: RenderContext): Texture;

  /**
   * Optional cache key for expensive effects
   * Return the same key for the same inputs to enable caching
   */
  getCacheKey?(): string;

  /**
   * Optional cleanup when effect is removed
   */
  dispose?(): void;
}

/**
 * Base effect class with common functionality
 */
export abstract class BaseEffect implements Effect {
  public enabled = true;
  public parameters: Record<string, Parameter> = {};

  constructor(public name: string) {}

  abstract apply(input: Texture, context: RenderContext): Texture;

  /**
   * Get parameter value at current time
   */
  protected getParameterValue<T>(name: string, time: number): T {
    const param = this.parameters[name];
    if (!param) {
      throw new Error(`Parameter '${name}' not found on effect '${this.name}'`);
    }
    return param.valueAt(time) as T;
  }

  /**
   * Animate a parameter with keyframes
   */
  animate(parameterName: string, keyframes: Array<{ time: number; value: any }>): void {
    const param = this.parameters[parameterName];
    if (!param) {
      throw new Error(`Parameter '${parameterName}' not found on effect '${this.name}'`);
    }

    param.clearKeyframes();
    keyframes.forEach((kf) => param.addKeyframe(kf));
  }

  dispose(): void {
    // Override if cleanup needed
  }
}
