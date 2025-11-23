/**
 * Effect rendering pipeline for WebGL2
 * Handles applying effects to textures using shaders
 */

import type { Effect, RenderContext } from '@composifx/core';
import { GLTexture } from './webgl-texture.js';
import { createProgram, type CompiledShader } from './shader-loader.js';

/**
 * Manages effect rendering with WebGL2
 */
export class EffectRenderer {
  private gl: WebGL2RenderingContext;
  private quadVAO: WebGLVertexArrayObject | null = null;
  private quadBuffer: WebGLBuffer | null = null;
  private effectShaders = new Map<string, CompiledShader>();

  // Texture pool for render targets
  private texturePool: GLTexture[] = [];

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.initialize();
  }

  /**
   * Initialize effect renderer resources
   */
  private initialize(): void {
    const { gl } = this;

    // Create quad geometry for full-screen effects
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

    // Position attribute (location 0)
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 4 * 4, 0);

    // TexCoord attribute (location 1)
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 4 * 4, 2 * 4);

    gl.bindVertexArray(null);
  }

  /**
   * Apply an effect to an input texture
   */
  applyEffect(effect: Effect, input: GLTexture, context: RenderContext): GLTexture {
    // For now, we'll handle FluidFill specifically
    // In the future, this will be more generic
    if (effect.name === 'FluidFill') {
      return this.applyFluidFill(effect, input, context);
    }

    // For unknown effects, return input unchanged
    console.warn(`Effect '${effect.name}' not yet implemented in WebGL renderer`);
    return input;
  }

  /**
   * Apply FluidFill effect using radial fill shader
   */
  private applyFluidFill(effect: Effect, input: GLTexture, context: RenderContext): GLTexture {
    const { gl } = this;

    // Get or compile the radial fill shader
    const shader = this.getOrCompileShader('radial-fill', RADIAL_FILL_VERTEX, RADIAL_FILL_FRAGMENT);

    // Get a render target from the pool
    const output = this.getRenderTarget(input.width, input.height);

    // Render to the output texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, output.framebuffer);
    gl.viewport(0, 0, output.width, output.height);

    // Use shader
    gl.useProgram(shader.program);

    // Bind input texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, input.texture);

    // Set uniforms
    const textureLoc = shader.uniforms.get('u_texture');
    if (textureLoc) {
      gl.uniform1i(textureLoc, 0);
    }

    // Get effect parameters
    const progress = effect.parameters['progress']?.valueAt(context.time) ?? 0;
    const progressLoc = shader.uniforms.get('u_progress');
    if (progressLoc) {
      gl.uniform1f(progressLoc, progress as number);
    }

    // Get fill color from effect
    const fillColor = (effect as any).fillColor || { r: 255, g: 107, b: 53, a: 255 };
    const fillColorLoc = shader.uniforms.get('u_fillColor');
    if (fillColorLoc) {
      gl.uniform4f(
        fillColorLoc,
        fillColor.r / 255,
        fillColor.g / 255,
        fillColor.b / 255,
        fillColor.a / 255
      );
    }

    // Get anchor point
    const anchorPoint = (effect as any).anchorPoint || { x: 0.5, y: 0.5 };
    const anchorPointLoc = shader.uniforms.get('u_anchorPoint');
    if (anchorPointLoc) {
      gl.uniform2f(anchorPointLoc, anchorPoint.x, anchorPoint.y);
    }

    // Get threshold
    const threshold = (effect as any).threshold ?? 0.1;
    const thresholdLoc = shader.uniforms.get('u_threshold');
    if (thresholdLoc) {
      gl.uniform1f(thresholdLoc, threshold);
    }

    // Get direction and convert to int
    const direction = (effect as any).direction || 'center-out';
    const directionMap: Record<string, number> = {
      'center-out': 0,
      'edge-in': 1,
      'left-right': 2,
      'top-bottom': 3,
    };
    const directionValue = directionMap[direction] ?? 0;
    const directionLoc = shader.uniforms.get('u_direction');
    if (directionLoc) {
      gl.uniform1i(directionLoc, directionValue);
    }

    // Draw quad
    gl.bindVertexArray(this.quadVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);

    // Unbind framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return output;
  }

  /**
   * Get or compile a shader program
   */
  private getOrCompileShader(name: string, vertexSource: string, fragmentSource: string): CompiledShader {
    let shader = this.effectShaders.get(name);
    if (!shader) {
      shader = createProgram(this.gl, vertexSource, fragmentSource);
      this.effectShaders.set(name, shader);
    }
    return shader;
  }

  /**
   * Get a render target texture from the pool or create a new one
   */
  private getRenderTarget(width: number, height: number): GLTexture {
    // Try to find an existing texture of the right size
    const index = this.texturePool.findIndex((t) => t.width === width && t.height === height);
    if (index !== -1) {
      return this.texturePool.splice(index, 1)[0];
    }

    // Create a new render target
    return GLTexture.createRenderTarget(this.gl, width, height);
  }

  /**
   * Return a texture to the pool for reuse
   */
  releaseTexture(texture: GLTexture): void {
    this.texturePool.push(texture);
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    const { gl } = this;

    // Delete shaders
    for (const shader of this.effectShaders.values()) {
      gl.deleteProgram(shader.program);
    }
    this.effectShaders.clear();

    // Delete geometry
    if (this.quadBuffer) {
      gl.deleteBuffer(this.quadBuffer);
      this.quadBuffer = null;
    }

    if (this.quadVAO) {
      gl.deleteVertexArray(this.quadVAO);
      this.quadVAO = null;
    }

    // Clear texture pool
    for (const texture of this.texturePool) {
      texture.dispose();
    }
    this.texturePool = [];
  }
}

// Shader sources for effects
const RADIAL_FILL_VERTEX = `#version 300 es

in vec2 a_position;
in vec2 a_texCoord;

out vec2 v_texCoord;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}`;

const RADIAL_FILL_FRAGMENT = `#version 300 es
precision highp float;

// Input texture
uniform sampler2D u_texture;

// Fill parameters
uniform float u_progress;      // Fill progress 0-1
uniform vec2 u_anchorPoint;    // Center point for radial fill (0-1 normalized)
uniform vec4 u_fillColor;      // Fill color (RGBA normalized 0-1)
uniform float u_threshold;     // Alpha threshold for transparency
uniform int u_direction;       // Fill direction: 0=center-out, 1=edge-in, 2=left-right, 3=top-bottom

// Fragment shader inputs
in vec2 v_texCoord;

// Output color
out vec4 fragColor;

/**
 * Multi-directional fill shader
 * Supports center-out, edge-in, left-right, and top-bottom fill animations
 */
void main() {
  // Sample the input texture
  vec4 texColor = texture(u_texture, v_texCoord);

  float normalizedDist = 0.0;

  if (u_direction == 0) {
    // Center-out: radial from anchor point
    vec2 toPoint = v_texCoord - u_anchorPoint;
    float dist = length(toPoint);
    float maxDist = sqrt(2.0);
    normalizedDist = dist / maxDist;
  } else if (u_direction == 1) {
    // Edge-in: inverted radial (fills from edges toward center)
    vec2 toPoint = v_texCoord - u_anchorPoint;
    float dist = length(toPoint);
    float maxDist = sqrt(2.0);
    normalizedDist = 1.0 - (dist / maxDist);
  } else if (u_direction == 2) {
    // Left-right: horizontal fill (left=0, right=1)
    normalizedDist = v_texCoord.x;
  } else if (u_direction == 3) {
    // Top-bottom: vertical fill (inverted because WebGL v=0 is bottom, v=1 is top)
    normalizedDist = 1.0 - v_texCoord.y;
  }

  // Determine if this pixel should be filled based on progress
  // progress=0: no fill, progress=1: full fill
  float fillAmount = 1.0 - step(u_progress, normalizedDist);

  // Only fill where alpha is above threshold (opaque areas)
  float alphaMask = step(u_threshold, texColor.a);

  // Combine fill with alpha mask
  float finalFill = fillAmount * alphaMask;

  // Mix between original color and fill color
  vec4 outputColor = mix(texColor, u_fillColor, finalFill);

  // Preserve original alpha
  outputColor.a = texColor.a;

  fragColor = outputColor;
}`;
