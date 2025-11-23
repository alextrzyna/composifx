#version 300 es

// Basic vertex shader for rendering textured quads
in vec2 a_position;
in vec2 a_texCoord;

out vec2 v_texCoord;

uniform mat3 u_matrix;

void main() {
  // Apply transformation matrix
  vec3 position = u_matrix * vec3(a_position, 1.0);
  gl_Position = vec4(position.xy, 0.0, 1.0);

  v_texCoord = a_texCoord;
}
