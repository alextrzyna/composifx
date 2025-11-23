#version 300 es
precision highp float;

// SDF texture (output from jump flooding)
uniform sampler2D u_sdfTexture;

// Fragment shader inputs
in vec2 v_texCoord;

// Output: flow direction
// r,g: normalized direction vector
// b: distance
// a: 1.0
out vec4 fragColor;

/**
 * SDF to Flow Direction Conversion
 *
 * Converts the distance field to flow direction vectors.
 * These vectors point away from the nearest seed (for center-out fill).
 */
void main() {
  vec4 sdf = texture(u_sdfTexture, v_texCoord);

  // Extract seed position
  vec2 seedUV = sdf.xy;
  float dist = sdf.z;

  // Calculate direction from seed to current pixel
  vec2 direction = v_texCoord - seedUV;

  // Normalize direction (handle zero-length vectors)
  float len = length(direction);
  if (len > 0.001) {
    direction = direction / len;
  } else {
    direction = vec2(0.0);
  }

  // Store direction and distance
  fragColor = vec4(direction, dist, 1.0);
}
