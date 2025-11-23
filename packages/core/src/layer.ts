/**
 * Layer class - represents a visual element in the composition
 */

import type { Vector2, BlendMode, RenderableSource } from './types.js';
import type { Effect } from './effect.js';

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
  public position: Vector2;
  public scale: Vector2;
  public rotation: number;
  public opacity: number;
  public blendMode: BlendMode;
  public effects: Effect[] = [];
  public visible = true;

  // Future: masks support
  // public masks: Mask[] = [];

  constructor(options: LayerOptions = {}) {
    this.name = options.name || `Layer ${Date.now()}`;
    this.source = options.source || null;
    this.position = options.position || { x: 0, y: 0 };
    this.scale = options.scale || { x: 1, y: 1 };
    this.rotation = options.rotation || 0;
    this.opacity = options.opacity !== undefined ? options.opacity : 1;
    this.blendMode = options.blendMode || 'normal';
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
