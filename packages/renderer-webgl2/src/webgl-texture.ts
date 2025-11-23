/**
 * WebGL Texture wrapper that implements the core Texture interface
 */

import type { Texture } from '@composifx/core';

/**
 * WebGL texture wrapper
 * Implements the abstract Texture interface for use with effects
 */
export class GLTexture implements Texture {
  public readonly width: number;
  public readonly height: number;
  public readonly texture: WebGLTexture;
  public readonly gl: WebGL2RenderingContext;

  /**
   * Optional framebuffer if this texture is used as a render target
   */
  public readonly framebuffer: WebGLFramebuffer | null = null;

  constructor(
    gl: WebGL2RenderingContext,
    texture: WebGLTexture,
    width: number,
    height: number,
    framebuffer?: WebGLFramebuffer
  ) {
    this.gl = gl;
    this.texture = texture;
    this.width = width;
    this.height = height;
    this.framebuffer = framebuffer ?? null;
  }

  /**
   * Create a GLTexture from an image source
   */
  static fromImage(
    gl: WebGL2RenderingContext,
    image: HTMLImageElement | HTMLCanvasElement | ImageBitmap
  ): GLTexture {
    const texture = gl.createTexture();
    if (!texture) {
      throw new Error('Failed to create WebGL texture');
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.bindTexture(gl.TEXTURE_2D, null);

    const width = 'width' in image ? image.width : image.videoWidth ?? 0;
    const height = 'height' in image ? image.height : image.videoHeight ?? 0;

    return new GLTexture(gl, texture, width, height);
  }

  /**
   * Create an empty texture for use as a render target
   */
  static createRenderTarget(
    gl: WebGL2RenderingContext,
    width: number,
    height: number
  ): GLTexture {
    const texture = gl.createTexture();
    if (!texture) {
      throw new Error('Failed to create WebGL texture');
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.bindTexture(gl.TEXTURE_2D, null);

    // Create framebuffer
    const framebuffer = gl.createFramebuffer();
    if (!framebuffer) {
      throw new Error('Failed to create framebuffer');
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error(`Framebuffer is not complete: ${status}`);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return new GLTexture(gl, texture, width, height, framebuffer);
  }

  /**
   * Dispose of WebGL resources
   */
  dispose(): void {
    if (this.texture) {
      this.gl.deleteTexture(this.texture);
    }
    if (this.framebuffer) {
      this.gl.deleteFramebuffer(this.framebuffer);
    }
  }
}
