/**
 * Texture management for WebGL2 renderer
 * Handles texture creation, caching, and pooling
 */

import type { ImageSource, VideoSource } from '@composifx/core';

export interface ManagedTexture {
  texture: WebGLTexture;
  width: number;
  height: number;
  source?: ImageSource | VideoSource;
}

export class TextureManager {
  private gl: WebGL2RenderingContext;
  private textureCache = new Map<string, ManagedTexture>();
  private texturePool: WebGLTexture[] = [];

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
  }

  /**
   * Create a texture from an image source
   */
  createTexture(
    source: ImageSource | VideoSource,
    options?: {
      minFilter?: number;
      magFilter?: number;
      wrapS?: number;
      wrapT?: number;
    }
  ): ManagedTexture {
    const { gl } = this;

    // Check cache
    const cacheKey = this.getCacheKey(source);
    const cached = this.textureCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Create new texture
    let texture = this.texturePool.pop();
    if (!texture) {
      const newTexture = gl.createTexture();
      if (!newTexture) {
        throw new Error('Failed to create WebGL texture');
      }
      texture = newTexture;
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Upload texture data
    gl.texImage2D(
      gl.TEXTURE_2D,
      0, // level
      gl.RGBA, // internal format
      gl.RGBA, // format
      gl.UNSIGNED_BYTE, // type
      source as TexImageSource
    );

    // Set texture parameters
    const minFilter = options?.minFilter ?? gl.LINEAR;
    const magFilter = options?.magFilter ?? gl.LINEAR;
    const wrapS = options?.wrapS ?? gl.CLAMP_TO_EDGE;
    const wrapT = options?.wrapT ?? gl.CLAMP_TO_EDGE;

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);

    // Generate mipmaps if using mipmap filter
    if (
      minFilter === gl.NEAREST_MIPMAP_NEAREST ||
      minFilter === gl.LINEAR_MIPMAP_NEAREST ||
      minFilter === gl.NEAREST_MIPMAP_LINEAR ||
      minFilter === gl.LINEAR_MIPMAP_LINEAR
    ) {
      gl.generateMipmap(gl.TEXTURE_2D);
    }

    const managedTexture: ManagedTexture = {
      texture,
      width: (source as HTMLImageElement).width || (source as HTMLCanvasElement).width,
      height: (source as HTMLImageElement).height || (source as HTMLCanvasElement).height,
      source,
    };

    // Cache the texture
    this.textureCache.set(cacheKey, managedTexture);

    return managedTexture;
  }

  /**
   * Create an empty texture for render targets
   */
  createEmptyTexture(width: number, height: number): ManagedTexture {
    const { gl } = this;

    let texture = this.texturePool.pop();
    if (!texture) {
      const newTexture = gl.createTexture();
      if (!newTexture) {
        throw new Error('Failed to create WebGL texture');
      }
      texture = newTexture;
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return {
      texture,
      width,
      height,
    };
  }

  /**
   * Update an existing texture with new source data
   */
  updateTexture(managedTexture: ManagedTexture, source: ImageSource | VideoSource): void {
    const { gl } = this;

    gl.bindTexture(gl.TEXTURE_2D, managedTexture.texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      source as TexImageSource
    );

    managedTexture.source = source;
    managedTexture.width = (source as HTMLImageElement).width || (source as HTMLCanvasElement).width;
    managedTexture.height = (source as HTMLImageElement).height || (source as HTMLCanvasElement).height;
  }

  /**
   * Delete a texture and return it to the pool
   */
  deleteTexture(managedTexture: ManagedTexture): void {
    // Remove from cache if present
    if (managedTexture.source) {
      const cacheKey = this.getCacheKey(managedTexture.source);
      this.textureCache.delete(cacheKey);
    }

    // Return to pool for reuse
    this.texturePool.push(managedTexture.texture);
  }

  /**
   * Clear all cached textures
   */
  clearCache(): void {
    this.textureCache.clear();
  }

  /**
   * Dispose of all textures and clean up resources
   */
  dispose(): void {
    const { gl } = this;

    // Delete cached textures
    for (const managed of this.textureCache.values()) {
      gl.deleteTexture(managed.texture);
    }
    this.textureCache.clear();

    // Delete pooled textures
    for (const texture of this.texturePool) {
      gl.deleteTexture(texture);
    }
    this.texturePool = [];
  }

  /**
   * Generate a cache key for a source
   */
  private getCacheKey(source: ImageSource | VideoSource): string {
    // For now, use object identity
    // In a real implementation, might use src URL or other identifier
    return `texture_${(source as any).src || Math.random()}`;
  }
}
