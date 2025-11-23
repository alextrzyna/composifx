#version 300 es
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
 *
 * Note: WebGL texture coordinates have v=0 at bottom, v=1 at top
 * So vertical fills need to be inverted for correct top-to-bottom behavior
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
}
