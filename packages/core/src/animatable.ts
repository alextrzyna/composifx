/**
 * Specialized animatable parameter classes
 */

import { Parameter } from './parameter.js';
import type { Keyframe, Vector2 } from './types.js';

/**
 * Number parameter with animation support
 */
export class NumberParameter extends Parameter<number> {
  protected lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /**
   * Add keyframes for animation
   */
  animate(keyframes: Keyframe<number>[]): void {
    this.clearKeyframes();
    keyframes.forEach((kf) => this.addKeyframe(kf));
  }

  /**
   * Get current value or animated value at time
   */
  get value(): number {
    return this.defaultValue;
  }

  set value(val: number) {
    this.defaultValue = val;
  }

  /**
   * Get value at specific time (for animation)
   */
  at(time: number): number {
    return this.valueAt(time);
  }
}

/**
 * Vector2 parameter with animation support
 */
export class Vector2Parameter extends Parameter<Vector2> {
  protected lerp(a: Vector2, b: Vector2, t: number): Vector2 {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    };
  }

  /**
   * Add keyframes for animation
   */
  animate(keyframes: Keyframe<Vector2>[]): void {
    this.clearKeyframes();
    keyframes.forEach((kf) => this.addKeyframe(kf));
  }

  /**
   * Get current value or animated value at time
   */
  get value(): Vector2 {
    return this.defaultValue;
  }

  set value(val: Vector2) {
    this.defaultValue = val;
  }

  /**
   * Convenience getters for x and y
   */
  get x(): number {
    return this.defaultValue.x;
  }

  set x(val: number) {
    this.defaultValue.x = val;
  }

  get y(): number {
    return this.defaultValue.y;
  }

  set y(val: number) {
    this.defaultValue.y = val;
  }

  /**
   * Get value at specific time (for animation)
   */
  at(time: number): Vector2 {
    return this.valueAt(time);
  }
}
