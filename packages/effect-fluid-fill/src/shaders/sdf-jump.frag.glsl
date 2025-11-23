#version 300 es
precision highp float;

// SDF texture from previous pass
uniform sampler2D u_sdfTexture;
uniform float u_stepSize;      // Step size in pixels for this iteration
uniform vec2 u_texelSize;      // Size of one texel (1.0 / textureSize)

// Fragment shader inputs
in vec2 v_texCoord;

// Output: updated seed data
out vec4 fragColor;

/**
 * SDF Jump Flooding Pass (Jump Flooding Algorithm)
 *
 * Iteratively propagates seed information to neighboring pixels.
 * Each iteration reduces step size by half: N/2, N/4, N/8, etc.
 */
void main() {
  // Start with current pixel's seed data
  vec4 closest = texture(u_sdfTexture, v_texCoord);
  float minDist = closest.z;

  // Check 3x3 neighborhood at current step size
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      // Calculate neighbor offset
      vec2 offset = vec2(float(x), float(y)) * u_stepSize * u_texelSize;
      vec2 neighborUV = v_texCoord + offset;

      // Skip if out of bounds
      if (neighborUV.x < 0.0 || neighborUV.x > 1.0 ||
          neighborUV.y < 0.0 || neighborUV.y > 1.0) {
        continue;
      }

      // Sample neighbor's seed data
      vec4 neighbor = texture(u_sdfTexture, neighborUV);

      // Check if neighbor has valid seed (a > 0.5)
      if (neighbor.a > 0.5) {
        // Calculate distance from current pixel to neighbor's seed
        vec2 seedUV = neighbor.xy;
        float dist = distance(v_texCoord, seedUV);

        // Update if this is closer
        if (dist < minDist) {
          minDist = dist;
          closest = vec4(seedUV, dist, 1.0);
        }
      }
    }
  }

  fragColor = closest;
}
