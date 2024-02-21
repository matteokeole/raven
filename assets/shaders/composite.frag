#version 300 es

precision mediump float;

in vec2 v_uv;

uniform sampler2D u_sampler;

out vec4 FragColor;

void main() {
	FragColor = texture(u_sampler, v_uv);
}