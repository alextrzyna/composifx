/**
 * WebGL2 Renderer for ComposiFX
 * Provides GPU-accelerated rendering of compositions
 */

import type { Composition, Layer } from '@composifx/core';
import { createProgram, type CompiledShader, BUILT_IN_SHADERS } from './shader-loader.js';
import { TextureManager, type ManagedTexture } from './texture-manager.js';

export interface WebGL2RendererOptions {
  /**
   * Enable alpha blending
   */
  alpha?: boolean;

  /**
   * Enable antialiasing
   */
  antialias?: boolean;

  /**
   * Preserve drawing buffer (needed for screenshots)
   */
  preserveDrawingBuffer?: boolean;
}

export class WebGL2Renderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private textureManager: TextureManager;
  private basicShader: CompiledShader | null = null;
  private quadBuffer: WebGLBuffer | null = null;
  private quadVAO: WebGLVertexArrayObject | null = null;

  constructor(canvas: HTMLCanvasElement, options: WebGL2RendererOptions = {}) {
    this.canvas = canvas;

    // Initialize WebGL2 context
    const gl = canvas.getContext('webgl2', {
      alpha: options.alpha ?? true,
      antialias: options.antialias ?? true,
      preserveDrawingBuffer: options.preserveDrawingBuffer ?? false,
      premultipliedAlpha: true,
    });

    if (!gl) {
      throw new Error('WebGL2 is not supported in this browser');
    }

    this.gl = gl;
    this.textureManager = new TextureManager(gl);

    this.initialize();
  }

  /**
   * Initialize renderer resources
   */
  private initialize(): void {
    const { gl } = this;

    // Compile basic shader
    this.basicShader = createProgram(
      gl,
      BUILT_IN_SHADERS.basic.vertex,
      BUILT_IN_SHADERS.basic.fragment
    );

    // Create quad geometry for rendering textured layers
    this.createQuadGeometry();

    // Set up GL state
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  }

  /**
   * Create a unit quad for rendering textured layers
   */
  private createQuadGeometry(): void {
    const { gl } = this;

    // Quad vertices: position (x, y) and texCoord (u, v)
    // prettier-ignore
    const vertices = new Float32Array([
      // Triangle 1
      -1, -1,  0, 1,  // bottom-left
       1, -1,  1, 1,  // bottom-right
      -1,  1,  0, 0,  // top-left
      // Triangle 2
      -1,  1,  0, 0,  // top-left
       1, -1,  1, 1,  // bottom-right
       1,  1,  1, 0,  // top-right
    ]);

    // Create buffer
    this.quadBuffer = gl.createBuffer();
    if (!this.quadBuffer) {
      throw new Error('Failed to create quad buffer');
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Create VAO
    this.quadVAO = gl.createVertexArray();
    if (!this.quadVAO) {
      throw new Error('Failed to create vertex array object');
    }

    gl.bindVertexArray(this.quadVAO);

    if (!this.basicShader) return;

    // Set up attributes
    const positionLoc = this.basicShader.attributes.get('a_position');
    const texCoordLoc = this.basicShader.attributes.get('a_texCoord');

    if (positionLoc !== undefined) {
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(
        positionLoc,
        2, // size: 2 components per vertex (x, y)
        gl.FLOAT,
        false,
        4 * 4, // stride: 4 floats per vertex
        0 // offset
      );
    }

    if (texCoordLoc !== undefined) {
      gl.enableVertexAttribArray(texCoordLoc);
      gl.vertexAttribPointer(
        texCoordLoc,
        2, // size: 2 components per vertex (u, v)
        gl.FLOAT,
        false,
        4 * 4, // stride: 4 floats per vertex
        2 * 4 // offset: skip first 2 floats
      );
    }

    gl.bindVertexArray(null);
  }

  /**
   * Render a composition at the given time
   */
  render(composition: Composition, time: number): void {
    const { gl } = this;

    // Update composition time
    composition.seek(time);

    // Set viewport
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    // Clear with background color
    const bg = composition.backgroundColor;
    gl.clearColor(bg.r / 255, bg.g / 255, bg.b / 255, bg.a / 255);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Render each visible layer
    for (const layer of composition.layers) {
      // Update layer time before checking opacity
      layer.updateTime(composition.currentTime);

      if (!layer.visible || layer.getOpacity() <= 0) continue;

      this.renderLayer(layer, composition);
    }
  }

  /**
   * Render a single layer
   */
  private renderLayer(layer: Layer, composition: Composition): void {
    const { gl } = this;

    if (!this.basicShader || !this.quadVAO) return;

    // For now, skip layers without a source
    // In Phase 2, we'll support solid color layers
    if (!layer.source) return;

    // Create or get texture from layer source
    const managedTexture = this.textureManager.createTexture(layer.source);

    // Use basic shader
    gl.useProgram(this.basicShader.program);

    // Bind texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, managedTexture.texture);

    // Set uniforms
    const matrixLoc = this.basicShader.uniforms.get('u_matrix');
    const opacityLoc = this.basicShader.uniforms.get('u_opacity');
    const tintLoc = this.basicShader.uniforms.get('u_tint');
    const textureLoc = this.basicShader.uniforms.get('u_texture');

    if (textureLoc) {
      gl.uniform1i(textureLoc, 0);
    }

    if (opacityLoc) {
      gl.uniform1f(opacityLoc, layer.getOpacity());
    }

    if (tintLoc) {
      // Default white tint (no color change)
      gl.uniform4f(tintLoc, 1, 1, 1, 1);
    }

    if (matrixLoc) {
      // Calculate transformation matrix
      const matrix = this.calculateLayerMatrix(layer, composition, managedTexture);
      gl.uniformMatrix3fv(matrixLoc, false, matrix);
    }

    // Draw quad
    gl.bindVertexArray(this.quadVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);
  }

  /**
   * Calculate the transformation matrix for a layer
   */
  private calculateLayerMatrix(
    layer: Layer,
    composition: Composition,
    texture: ManagedTexture
  ): Float32Array {
    // Create transformation matrix that maps from clip space (-1 to 1)
    // to layer space with proper transforms applied

    const compWidth = composition.width;
    const compHeight = composition.height;

    // Get animated property values
    const position = layer.getPosition();
    const scale = layer.getScale();
    const rotation = layer.getRotation();

    // Convert layer position from composition space to clip space
    const x = (position.x / compWidth) * 2 - 1;
    const y = -((position.y / compHeight) * 2 - 1); // Flip Y

    // Calculate scale based on texture size and layer scale
    const scaleX = (texture.width * scale.x) / compWidth;
    const scaleY = (texture.height * scale.y) / compHeight;

    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    // Build transformation matrix (column-major order for WebGL)
    // Matrix combines: translation, rotation, and scale
    const matrix = new Float32Array([
      scaleX * cos,
      scaleX * sin,
      0,
      -scaleY * sin,
      scaleY * cos,
      0,
      x,
      y,
      1,
    ]);

    return matrix;
  }

  /**
   * Resize the renderer viewport
   */
  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    const { gl } = this;

    // Delete shader program
    if (this.basicShader) {
      gl.deleteProgram(this.basicShader.program);
      this.basicShader = null;
    }

    // Delete buffers
    if (this.quadBuffer) {
      gl.deleteBuffer(this.quadBuffer);
      this.quadBuffer = null;
    }

    if (this.quadVAO) {
      gl.deleteVertexArray(this.quadVAO);
      this.quadVAO = null;
    }

    // Dispose texture manager
    this.textureManager.dispose();
  }

  /**
   * Get the WebGL2 context
   */
  getContext(): WebGL2RenderingContext {
    return this.gl;
  }

  /**
   * Get the texture manager
   */
  getTextureManager(): TextureManager {
    return this.textureManager;
  }
}
