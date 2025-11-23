/**
 * Animatable parameter with keyframe support
 */

import type { Keyframe } from './types.js';
import { easing } from './easing.js';

export class Parameter<T = number> {
  public keyframes: Keyframe<T>[] = [];

  constructor(
    public defaultValue: T,
    public min?: T,
    public max?: T,
  ) {}

  /**
   * Add a keyframe to this parameter
   */
  addKeyframe(keyframe: Keyframe<T>): void {
    this.keyframes.push(keyframe);
    // Keep keyframes sorted by time
    this.keyframes.sort((a, b) => a.time - b.time);
  }

  /**
   * Remove all keyframes
   */
  clearKeyframes(): void {
    this.keyframes = [];
  }

  /**
   * Get the interpolated value at a specific time
   */
  valueAt(time: number): T {
    if (this.keyframes.length === 0) {
      return this.defaultValue;
    }

    // Before first keyframe
    if (this.keyframes[0] && time <= this.keyframes[0].time) {
      return this.keyframes[0].value;
    }

    // After last keyframe
    const lastKeyframe = this.keyframes[this.keyframes.length - 1];
    if (lastKeyframe && time >= lastKeyframe.time) {
      return lastKeyframe.value;
    }

    // Find surrounding keyframes
    for (let i = 0; i < this.keyframes.length - 1; i++) {
      const kf1 = this.keyframes[i];
      const kf2 = this.keyframes[i + 1];

      if (kf1 && kf2 && time >= kf1.time && time <= kf2.time) {
        return this.interpolate(kf1, kf2, time);
      }
    }

    return this.defaultValue;
  }

  /**
   * Interpolate between two keyframes
   */
  private interpolate(kf1: Keyframe<T>, kf2: Keyframe<T>, time: number): T {
    const duration = kf2.time - kf1.time;
    const progress = (time - kf1.time) / duration;

    // Apply easing function
    const easingFn = kf2.easing || easing.linear;
    const easedProgress = easingFn(progress);

    // Interpolate based on type
    return this.lerp(kf1.value, kf2.value, easedProgress);
  }

  /**
   * Linear interpolation - override for complex types
   */
  protected lerp(a: T, b: T, t: number): T {
    if (typeof a === 'number' && typeof b === 'number') {
      return (a + (b - a) * t) as T;
    }

    // For non-numeric types, just return the first value
    // Subclasses should override this for Vector2, Color, etc.
    return t < 0.5 ? a : b;
  }

  /**
   * Clamp value to min/max if defined
   */
  clamp(value: T): T {
    if (typeof value !== 'number' || this.min === undefined || this.max === undefined) {
      return value;
    }

    return Math.max(this.min as number, Math.min(this.max as number, value as number)) as T;
  }
}
