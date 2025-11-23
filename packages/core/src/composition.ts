/**
 * Composition class - main container for layers and timeline
 */

import type { Color, TimelineEvent, EventHandler } from './types.js';
import { Layer } from './layer.js';

export interface CompositionOptions {
  width: number;
  height: number;
  duration: number;
  frameRate?: number;
  backgroundColor?: Color;
}

/**
 * Composition manages layers, timeline, and rendering
 */
export class Composition {
  public width: number;
  public height: number;
  public duration: number;
  public frameRate: number;
  public backgroundColor: Color;
  public layers: Layer[] = [];

  // Timeline state
  public currentTime = 0;
  public playing = false;
  public loop = false;

  private eventHandlers: Map<TimelineEvent, EventHandler[]> = new Map();
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;

  constructor(options: CompositionOptions) {
    this.width = options.width;
    this.height = options.height;
    this.duration = options.duration;
    this.frameRate = options.frameRate || 60;
    this.backgroundColor = options.backgroundColor || { r: 0, g: 0, b: 0, a: 255 };
  }

  /**
   * Add a layer to the composition
   */
  addLayer(layer: Layer): void {
    this.layers.push(layer);
  }

  /**
   * Remove a layer from the composition
   */
  removeLayer(layer: Layer): void {
    const index = this.layers.indexOf(layer);
    if (index !== -1) {
      this.layers.splice(index, 1);
      layer.dispose();
    }
  }

  /**
   * Get layer by name
   */
  getLayer(name: string): Layer | undefined {
    return this.layers.find((layer) => layer.name === name);
  }

  /**
   * Clear all layers
   */
  clearLayers(): void {
    this.layers.forEach((layer) => layer.dispose());
    this.layers = [];
  }

  /**
   * Start playback
   */
  play(): void {
    if (this.playing) return;

    this.playing = true;
    this.lastFrameTime = performance.now();
    this.emit('play');
    this.tick();
  }

  /**
   * Pause playback
   */
  pause(): void {
    if (!this.playing) return;

    this.playing = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.emit('pause');
  }

  /**
   * Seek to a specific time
   */
  seek(time: number): void {
    this.currentTime = Math.max(0, Math.min(time, this.duration));
    this.emit('seek');
  }

  /**
   * Animation loop tick
   */
  private tick = (): void => {
    if (!this.playing) return;

    const now = performance.now();
    const deltaTime = (now - this.lastFrameTime) / 1000; // Convert to seconds
    this.lastFrameTime = now;

    this.currentTime += deltaTime;

    // Handle loop or stop at end
    if (this.currentTime >= this.duration) {
      if (this.loop) {
        this.currentTime = 0;
      } else {
        this.currentTime = this.duration;
        this.pause();
        this.emit('complete');
        return;
      }
    }

    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  /**
   * Register event handler
   */
  on(event: TimelineEvent, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * Unregister event handler
   */
  off(event: TimelineEvent, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (!handlers) return;

    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Emit event
   */
  private emit(event: TimelineEvent): void {
    const handlers = this.eventHandlers.get(event);
    if (!handlers) return;

    handlers.forEach((handler) => handler());
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.pause();
    this.clearLayers();
    this.eventHandlers.clear();
  }
}
