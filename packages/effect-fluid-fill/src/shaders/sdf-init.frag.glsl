#version 300 es
precision highp float;

// Input texture
uniform sampler2D u_texture;
uniform float u_threshold;  // Alpha threshold for seeds

// Fragment shader inputs
in vec2 v_texCoord;

// Output: seed data
// r,g: seed UV coordinates
// b: distance (initialized to large value for non-seeds)
// a: 1.0 if valid seed, 0.0 otherwise
out vec4 fragColor;

/**
 * SDF Initialization Pass (Jump Flooding Algorithm - Phase 1)
 *
 * Seeds the distance field from opaque pixels (alpha > threshold).
 * Each seed pixel stores its own UV coordinates.
 */
void main() {
  vec4 texColor = texture(u_texture, v_texCoord);

  // Check if this pixel is opaque enough to be a seed
  if (texColor.a > u_threshold) {
    // This is a seed - store its coordinates
    fragColor = vec4(v_texCoord, 0.0, 1.0);
  } else {
    // Not a seed - initialize with invalid data
    fragColor = vec4(-1.0, -1.0, 999999.0, 0.0);
  }
}
