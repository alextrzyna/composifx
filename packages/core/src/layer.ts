/**
 * Layer class - represents a visual element in the composition
 */

import type { Vector2, BlendMode, RenderableSource } from './types.js';
import type { Effect } from './effect.js';
import { Vector2Parameter, NumberParameter } from './animatable.js';

export interface LayerOptions {
  name?: string;
  source?: RenderableSource | null;
  position?: Vector2;
  scale?: Vector2;
  rotation?: number;
  opacity?: number;
  blendMode?: BlendMode;
}

/**
 * Layer represents a visual element with transform, effects, and masks
 */
export class Layer {
  public name: string;
  public source: RenderableSource | null;
  public position: Vector2Parameter;
  public scale: Vector2Parameter;
  public rotation: NumberParameter;
  public opacity: NumberParameter;
  public blendMode: BlendMode;
  public effects: Effect[] = [];
  public visible = true;

  // Current time for evaluating animated properties
  private _currentTime = 0;

  // Future: masks support
  // public masks: Mask[] = [];

  constructor(options: LayerOptions = {}) {
    this.name = options.name || `Layer ${Date.now()}`;
    this.source = options.source || null;
    this.position = new Vector2Parameter(options.position || { x: 0, y: 0 });
    this.scale = new Vector2Parameter(options.scale || { x: 1, y: 1 });
    this.rotation = new NumberParameter(options.rotation || 0);
    this.opacity = new NumberParameter(options.opacity !== undefined ? options.opacity : 1, 0, 1);
    this.blendMode = options.blendMode || 'normal';
  }

  /**
   * Update layer to a specific time (evaluates animated properties)
   */
  updateTime(time: number): void {
    this._currentTime = time;
  }

  /**
   * Get the current evaluated position at the current time
   */
  getPosition(): Vector2 {
    return this.position.valueAt(this._currentTime);
  }

  /**
   * Get the current evaluated scale at the current time
   */
  getScale(): Vector2 {
    return this.scale.valueAt(this._currentTime);
  }

  /**
   * Get the current evaluated rotation at the current time
   */
  getRotation(): number {
    return this.rotation.valueAt(this._currentTime);
  }

  /**
   * Get the current evaluated opacity at the current time
   */
  getOpacity(): number {
    return this.opacity.valueAt(this._currentTime);
  }

  /**
   * Add an effect to this layer's effect stack
   */
  addEffect(effect: Effect): void {
    this.effects.push(effect);
  }

  /**
   * Remove an effect from this layer
   */
  removeEffect(effect: Effect): void {
    const index = this.effects.indexOf(effect);
    if (index !== -1) {
      this.effects.splice(index, 1);
      effect.dispose?.();
    }
  }

  /**
   * Clear all effects
   */
  clearEffects(): void {
    this.effects.forEach((effect) => effect.dispose?.());
    this.effects = [];
  }

  /**
   * Get effect by name
   */
  getEffect(name: string): Effect | undefined {
    return this.effects.find((effect) => effect.name === name);
  }

  /**
   * Set layer source (image, video, canvas)
   */
  setSource(source: RenderableSource | null): void {
    this.source = source;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.clearEffects();
    this.source = null;
  }
}
