/**
 * Shader compilation and management utilities
 */

export interface CompiledShader {
  program: WebGLProgram;
  attributes: Map<string, number>;
  uniforms: Map<string, WebGLUniformLocation>;
}

/**
 * Compile a GLSL shader
 */
export function compileShader(
  gl: WebGL2RenderingContext,
  source: string,
  type: number
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error('Failed to create shader');
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compilation failed: ${info}`);
  }

  return shader;
}

/**
 * Link a shader program from vertex and fragment shaders
 */
export function linkProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram {
  const program = gl.createProgram();
  if (!program) {
    throw new Error('Failed to create shader program');
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Shader program linking failed: ${info}`);
  }

  return program;
}

/**
 * Create a shader program from vertex and fragment source
 */
export function createProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string
): CompiledShader {
  const vertexShader = compileShader(gl, vertexSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);
  const program = linkProgram(gl, vertexShader, fragmentShader);

  // Clean up shaders (no longer needed after linking)
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  // Extract attributes and uniforms
  const attributes = new Map<string, number>();
  const uniforms = new Map<string, WebGLUniformLocation>();

  const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < numAttributes; i++) {
    const info = gl.getActiveAttrib(program, i);
    if (info) {
      const location = gl.getAttribLocation(program, info.name);
      attributes.set(info.name, location);
    }
  }

  const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < numUniforms; i++) {
    const info = gl.getActiveUniform(program, i);
    if (info) {
      const location = gl.getUniformLocation(program, info.name);
      if (location) {
        uniforms.set(info.name, location);
      }
    }
  }

  return {
    program,
    attributes,
    uniforms,
  };
}

/**
 * Built-in shader sources
 */
export const BUILT_IN_SHADERS = {
  basic: {
    vertex: `#version 300 es

in vec2 a_position;
in vec2 a_texCoord;

out vec2 v_texCoord;

uniform mat3 u_matrix;

void main() {
  vec3 position = u_matrix * vec3(a_position, 1.0);
  gl_Position = vec4(position.xy, 0.0, 1.0);
  v_texCoord = a_texCoord;
}`,
    fragment: `#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_texture;
uniform float u_opacity;
uniform vec4 u_tint;

void main() {
  vec4 texColor = texture(u_texture, v_texCoord);
  texColor.a *= u_opacity;
  texColor *= u_tint;
  fragColor = texColor;
}`,
  },
};
