import {WebGLRenderer} from "../index.js";
import {Matrix3, Vector2} from "../math/index.js";
import {extend} from "../utils/index.js";

export function GUIRenderer() {
	WebGLRenderer.call(this, {offscreen: true});

	const _build = this.build;

	/**
	 * @param {String} shaderPath Instance shader path
	 * @param {Matrix3} projection
	 */
	this.build = async function(shaderPath, projection) {
		_build();

		const program = await this.loadProgram(shaderPath, "subcomponent.vert", "subcomponent.frag");

		this.linkProgram(program);

		const gl = this.getContext();

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.useProgram(program.getProgram());

		const attributes = this.getAttributes();
		const uniforms = this.getUniforms();
		const buffers = this.getBuffers();

		attributes.vertex = 0;
		attributes.world = 1;
		attributes.textureIndex = 4;
		attributes.texture = 5;
		attributes.colorMask = 8;
		uniforms.projection = gl.getUniformLocation(program.getProgram(), "u_projection");
		buffers.vertex = gl.createBuffer();
		buffers.world = gl.createBuffer();
		buffers.textureIndex = gl.createBuffer();
		buffers.texture = gl.createBuffer();
		buffers.colorMask = gl.createBuffer();

	 	gl.uniformMatrix3fv(uniforms.projection, false, projection);

		gl.enableVertexAttribArray(attributes.vertex);
		gl.enableVertexAttribArray(attributes.world);
		gl.enableVertexAttribArray(attributes.textureIndex);
		gl.enableVertexAttribArray(attributes.texture);
		gl.enableVertexAttribArray(attributes.colorMask);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
		gl.vertexAttribPointer(attributes.vertex, 2, gl.FLOAT, false, 0, 0);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 1, 0, 1, 0, 0, 1, 0]), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureIndex);
		gl.vertexAttribIPointer(attributes.textureIndex, 1, gl.UNSIGNED_BYTE, false, 0, 0);
		gl.vertexAttribDivisor(attributes.textureIndex, 1);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorMask);
		gl.vertexAttribPointer(attributes.colorMask, 4, gl.UNSIGNED_BYTE, true, 0, 0);
		gl.vertexAttribDivisor(attributes.colorMask, 1);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.world);

		let i;
		for (i = attributes.world + 2; i >= attributes.world; i--) {
			gl.enableVertexAttribArray(i);
			gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 36, (i - 1) * 12);
			gl.vertexAttribDivisor(i, 1);
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texture);

		for (i = attributes.texture + 2; i >= attributes.texture; i--) {
			gl.enableVertexAttribArray(i);
			gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 36, (i - 5) * 12);
			gl.vertexAttribDivisor(i, 1);
		}
	};

	/**
	 * @override
	 * @param {Number} subcomponentCount
	 */
	this.render = function(scene, subcomponentCount) {
		const
			gl = this.getContext(),
			buffers = this.getBuffers(),
			worlds = new Float32Array(subcomponentCount * 9),
			textureIndices = new Uint8Array(subcomponentCount),
			textures = new Float32Array(subcomponentCount * 9),
			colorMasks = new Uint8Array(subcomponentCount * 4);

		for (let i = 0, j, k = 0, cl = scene.length, component, position, textureIndex = new Uint8Array(1), subcomponents, sl, subcomponent, size, world, texture; i < cl; i++) {
			component = scene[i];
			position = component.getPosition();

			subcomponents = component.getSubcomponents();
			textureIndex[0] = component.getTexture().getIndex();
			sl = subcomponents.length;
			j = 0;

			for (; j < sl; j++, k++) {
				subcomponent = subcomponents[j];
				size = subcomponent.getSize();
				world = Matrix3
					.translation(position.clone().add(subcomponent.getOffset()))
					.multiply(Matrix3.scale(size));
				texture = Matrix3
					.translation(subcomponent.getUV().clone().divide(WebGLRenderer.MAX_TEXTURE_SIZE))
					.multiply(Matrix3.scale(size.clone().divide(WebGLRenderer.MAX_TEXTURE_SIZE)));

				worlds.set(world, k * 9);
				textureIndices.set(textureIndex, k);
				textures.set(texture, k * 9);
				colorMasks.set(new Uint8Array(subcomponent.getColorMask()), k * 4);
			}
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.world);
		gl.bufferData(gl.ARRAY_BUFFER, worlds, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureIndex);
		gl.bufferData(gl.ARRAY_BUFFER, textureIndices, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texture);
		gl.bufferData(gl.ARRAY_BUFFER, textures, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorMask);
		gl.bufferData(gl.ARRAY_BUFFER, colorMasks, gl.STATIC_DRAW);

		gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0, 4, subcomponentCount);
	};

	/**
	 * @param {Vector2} viewport
	 * @param {Matrix3} projection
	 */
	this.resize = function(viewport, projection) {
		this.setViewport(viewport);
	 	this.getContext().uniformMatrix3fv(this.getUniforms().projection, false, projection);
	};
}

extend(GUIRenderer, WebGLRenderer);