#version 300 es

precision mediump float;
precision mediump sampler2DArray;

in uint v_texture_index;
in vec2 v_uv;

uniform sampler2DArray u_sampler;

out vec4 FragColor;

void main() {
	FragColor = texture(u_sampler, vec3(v_uv, v_texture_index));
}