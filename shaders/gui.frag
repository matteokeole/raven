#version 300 es

precision mediump float;
precision mediump sampler2DArray;

flat in uint v_texture_index;
in vec2 v_uv;
in vec4 v_color_mask;

uniform sampler2DArray u_sampler;

out vec4 FragColor;

void main() {
	vec4 texture = texture(u_sampler, vec3(v_uv, v_texture_index));

	FragColor = texture * v_color_mask;
}