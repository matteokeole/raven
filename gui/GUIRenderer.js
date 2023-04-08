import {WebGLRenderer} from "../index.js";
import {StructuralComponent} from "./index.js";
import {Matrix3, Vector2} from "../math/index.js";
import {extend} from "../utils/index.js";
import {Texture} from "../wrappers/index.js";

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

		{
			let i, loc;

			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.world);

			for (i = 0, loc = attributes.world; i < 3; i++, loc++) {
				gl.enableVertexAttribArray(loc);
				gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 36, i * 12);
				gl.vertexAttribDivisor(loc, 1);
			}

			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texture);

			for (i = 0, loc = attributes.texture; i < 3; i++, loc++) {
				gl.enableVertexAttribArray(loc);
				gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 36, i * 12);
				gl.vertexAttribDivisor(loc, 1);
			}
		}
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
	 * @todo Optimal render queue: only components with subcomponents
	 * 
	 * @override
	 * @param {Number} subcomponentCount
	 */
	this.render = function(scene, subcomponentCount) {
		const
			gl = this.getContext(),
			worlds = new Float32Array(subcomponentCount * 9),
			textureIndices = new Uint8Array(subcomponentCount),
			textures = new Float32Array(subcomponentCount * 9),
			colorMasks = new Float32Array(subcomponentCount * 3),
			colorMaskWeights = new Float32Array(subcomponentCount);

		for (let i = 0, j, k = 0, cl = scene.length, component, position, textureIndex = new Uint8Array(1), subcomponents, sl, subcomponent, size, world, texture; i < cl; i++) {
			component = scene[i];
			position = component.getPosition();

			if (component instanceof StructuralComponent) continue;

			subcomponents = component.getSubcomponents();
			textureIndex[0] = component.getTexture().getIndex();
			sl = subcomponents.length;
			j = 0;

			for (; j < sl; j++, k++) {
				subcomponent = subcomponents[j];
				size = subcomponent.getSize();
				world = Matrix3
					.translate(position.add(subcomponent.getOffset()))
					.scale(size);
				texture = Matrix3
					.translate(subcomponent.getUV().divide(WebGLRenderer.MAX_TEXTURE_SIZE))
					.scale(size.divide(WebGLRenderer.MAX_TEXTURE_SIZE));

				worlds.set(world, k * 9);
				textureIndices.set(textureIndex, k);
				textures.set(texture, k * 9);
				colorMasks.set(subcomponent.getColorMask().toArray(), k * 3);
				colorMaskWeights.set([subcomponent.getColorMaskWeight()], k);
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

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorMaskWeight);
		gl.bufferData(gl.ARRAY_BUFFER, colorMaskWeights, gl.STATIC_DRAW);

		gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0, 4, subcomponentCount);
	};

	/**
	 * @param {Vector2} viewport
	 * @param {Matrix3} projection
	 */
	this.resize = function(viewport, projection) {
		this.setViewport(viewport);
	 	this.getContext().uniformMatrix3fv(uniforms.projection, false, projection);
	};
}

extend(GUIRenderer, WebGLRenderer);