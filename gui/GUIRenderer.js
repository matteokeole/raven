import {Matrix3, Vector2} from "../math/index.js";
import {extend} from "../utils/index.js";
import {Texture} from "../wrappers/index.js";
import {WebGLRenderer} from "../WebGLRenderer.js";

export function GUIRenderer() {
	WebGLRenderer.call(this, {
		offscreen: true,
		generateMipmaps: false,
	});

	/** @type {Object<String, Number>} */
	let attributes;

	/** @type {Object<String, WebGLUniformLocation>} */
	let uniforms;

	/** @type {Object<String, WebGLBuffer>} */
	let buffers;

	/** @type {Object<String, WebGLVertexArrayObject>} */
	let vaos;

	/**
	 * @todo Rework parameters
	 * 
	 * @param {String} shaderPath Instance shader path
	 * @param {Matrix3} projectionMatrix
	 */
	this.init = async function(shaderPath, projectionMatrix) {
		const gl = this.getContext();

		/**
		 * Load component program
		 * 
		 * @type {Program}
		 */
		const program = await this.loadProgram(
			"subcomponent.vert",
			"subcomponent.frag",
			shaderPath,
		);

		this.linkProgram(program);
		gl.useProgram(program.getProgram());
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		attributes = {
			position: 0,
			world: 1,
			textureIndex: 4,
			texture: 5,
			colorMask: 8,
			colorMaskWeight: 9,
		};
		uniforms = {
			projection: gl.getUniformLocation(program.getProgram(), "u_projection"),
		};
		buffers = {
			position: gl.createBuffer(),
			world: gl.createBuffer(),
			textureIndex: gl.createBuffer(),
			texture: gl.createBuffer(),
			colorMask: gl.createBuffer(),
			colorMaskWeight: gl.createBuffer(),
		};
		vaos = {
			main: gl.createVertexArray(),
		};

		gl.bindVertexArray(vaos.main);

	 	gl.uniformMatrix3fv(uniforms.projection, false, new Float32Array(projectionMatrix));

		// Enable attributes
		gl.enableVertexAttribArray(attributes.position);
		gl.enableVertexAttribArray(attributes.world);
		gl.enableVertexAttribArray(attributes.textureIndex);
		gl.enableVertexAttribArray(attributes.texture);
		gl.enableVertexAttribArray(attributes.colorMask);
		gl.enableVertexAttribArray(attributes.colorMaskWeight);

		// Setup quad vertex positions
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
		gl.vertexAttribPointer(attributes.position, 2, gl.FLOAT, false, 0, 0);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			0, 0,
			1, 0,
			1, 1,
			0, 1,
		]), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureIndex);
		gl.vertexAttribIPointer(attributes.textureIndex, 1, gl.UNSIGNED_BYTE, false, 0, 0);
		gl.vertexAttribDivisor(attributes.textureIndex, 1);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorMask);
		gl.vertexAttribPointer(attributes.colorMask, 3, gl.FLOAT, false, 0, 0);
		gl.vertexAttribDivisor(attributes.colorMask, 1);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorMaskWeight);
		gl.vertexAttribPointer(attributes.colorMaskWeight, 1, gl.FLOAT, false, 0, 0);
		gl.vertexAttribDivisor(attributes.colorMaskWeight, 1);
	};

	this.loadTestTextures = async function() {
		const gl = this.getContext();
		const textures = this.getTextures();
		const textureLength = Object.keys(textures).length;
		const dimension = 256;
		const imageReplacement = {
			width: dimension,
			height: dimension,
		};
		const canvas = new OffscreenCanvas(dimension, dimension);
		const ctx = canvas.getContext("2d");
		const colors = {
			darkgrey: "#2b2b2b",
			grey: "#6f6f6f",
			overlay: "#000a",
		};
		const colorKeys = Object.keys(colors);

		for (let i = 0, l = colorKeys.length, color; i < l; i++) {
			color = colors[colorKeys[i]];

			ctx.clearRect(0, 0, dimension, dimension);
			ctx.fillStyle = color;
			ctx.fillRect(0, 0, dimension, dimension);

			gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, textureLength + i, dimension, dimension, 1, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

			textures[colorKeys[i]] = new Texture(imageReplacement, textureLength + i);
		}
	};

	/**
	 * @todo Optimize subcomponent rendering
	 * @todo Move matrix attribute divisor setup in `init`
	 * @todo Make use of the `camera` param
	 * 
	 * @override
	 */
	this.render = function(scene, camera) {
		const
			gl = this.getContext(),
			componentCount = scene.length;
		let i = 0, loc;

		const subcomponentWorldMatrices = [];
		const subcomponentTextureMatrices = [];
		const subcomponentTextureIndices = [];
		const subcomponentColorMasks = [];
		const subcomponentColorMaskWeights = [];
		let subcomponentCount = 0;

		for (let component; i < componentCount; i++) {
			component = scene[i];

			const subcomponents = component.getSubcomponents();
			const l = subcomponents.length;

			if (l === 0) continue;

			subcomponentCount += l;

			for (let j = 0, subcomponent; j < l; j++) {
				subcomponent = subcomponents[j];

				const position = component.getPosition()
					.clone()
					.add(subcomponent.getOffset());
				const size = subcomponent.getSize();
				const colorMask = subcomponent.getColorMask();

				// World matrix
				subcomponentWorldMatrices.push(
					...Matrix3
						.translate(position)
						.scale(size)
				);

				// Texture matrix
				subcomponentTextureMatrices.push(
					...Matrix3
						.translate(subcomponent.getUV().divide(WebGLRenderer.MAX_TEXTURE_SIZE))
						.scale(size.clone().divide(WebGLRenderer.MAX_TEXTURE_SIZE))
				);

				subcomponentTextureIndices.push(component.getTexture().getIndex());

				subcomponentColorMasks.push(colorMask.x, colorMask.y, colorMask.z);
				subcomponentColorMaskWeights.push(subcomponent.getColorMaskWeight());
			}
		}

		/* for (let j = 0, component; i < componentCount; i++, j += 9) {
			component = scene[i];

			worldMatrices.set(component.getWorldMatrix(), j);
			textureMatrices.set(component.getTextureMatrix(), j);
			textureIndices[i] = component.getTexture().getIndex();
		} */

		// Register world matrices
		{
			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.world);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(subcomponentWorldMatrices), gl.STATIC_DRAW);

			for (i = 0; i < 3; i++) {
				gl.enableVertexAttribArray(loc = attributes.world + i);
				gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 36, i * 12);
				gl.vertexAttribDivisor(loc, 1);
			}
		}

		// Register texture matrices
		{
			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texture);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(subcomponentTextureMatrices), gl.STATIC_DRAW);

			for (i = 0; i < 3; i++) {
				gl.enableVertexAttribArray(loc = attributes.texture + i);
				gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 36, i * 12);
				gl.vertexAttribDivisor(loc, 1);
			}
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureIndex);
		gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(subcomponentTextureIndices), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorMask);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(subcomponentColorMasks), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorMaskWeight);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(subcomponentColorMaskWeights), gl.STATIC_DRAW);

		gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0, 4, subcomponentCount);
	};

	/**
	 * Resizes the renderer viewport and updates the projection matrix uniform.
	 * 
	 * @param {Vector2} viewport
	 * @param {Matrix3} projectionMatrix
	 */
	this.resize = function(viewport, projectionMatrix) {
		this.setViewport(viewport);
	 	this.getContext().uniformMatrix3fv(uniforms.projection, false, new Float32Array(projectionMatrix));
	};
}

extend(GUIRenderer, WebGLRenderer);