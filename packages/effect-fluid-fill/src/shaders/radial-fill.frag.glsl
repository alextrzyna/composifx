#version 300 es
precision highp float;

// Input texture
uniform sampler2D u_texture;

// Auto Fill parameters
uniform float u_progress;      // Fill progress 0-1
uniform vec2 u_anchorPoint;    // Center point for radial fill (0-1 normalized)
uniform vec4 u_fillColor;      // Fill color (RGBA normalized 0-1)
uniform float u_threshold;     // Alpha threshold for transparency

// Fragment shader inputs
in vec2 v_texCoord;

// Output color
out vec4 fragColor;

/**
 * Basic radial fill shader (Phase 1)
 *
 * Creates a simple center-out circular fill effect.
 * The fill respects the layer's alpha channel.
 */
void main() {
  // Sample the input texture
  vec4 texColor = texture(u_texture, v_texCoord);

  // Calculate distance from anchor point
  vec2 toPoint = v_texCoord - u_anchorPoint;
  float dist = length(toPoint);

  // Normalize distance (assumes max distance is sqrt(2) for corners)
  float maxDist = sqrt(2.0);
  float normalizedDist = dist / maxDist;

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
