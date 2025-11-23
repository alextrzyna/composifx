#version 300 es
precision highp float;

// Basic fragment shader for rendering textured layers
in vec2 v_texCoord;

out vec4 fragColor;

uniform sampler2D u_texture;
uniform float u_opacity;
uniform vec4 u_tint;

void main() {
  vec4 texColor = texture(u_texture, v_texCoord);

  // Apply opacity
  texColor.a *= u_opacity;

  // Apply tint (optional, default is white = no tint)
  texColor *= u_tint;

  fragColor = texColor;
}
