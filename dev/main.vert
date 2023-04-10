#version 300 es

layout(location = 0) in vec2 a_vertex;
layout(location = 1) in uint a_texture_index;
layout(location = 2) in vec2 a_uv;

out uint v_texture_index;
out vec3 v_uv;

void main() {
	gl_Position = vec4(a_vertex, 0, 1);

	v_texture_index = a_texture_index;
	v_uv = a_uv;
}