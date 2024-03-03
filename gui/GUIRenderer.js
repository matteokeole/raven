import {WebGLRenderer} from "../index.js";
import {ShaderLoader} from "../Loader/index.js";
import {Matrix3, Vector4} from "../math/index.js";
import {GUIScene} from "../Scene/index.js";

export class GUIRenderer extends WebGLRenderer {
	/**
	 * @type {?OffscreenCanvas}
	 */
	_canvas;

	/**
	 * @type {Matrix3}
	 */
	#projection;

	constructor() {
		super();

		this._canvas = null;
		this.#projection = Matrix3.identity();
	}

	getCanvas() {
		return this._canvas;
	}

	/**
	 * @param {Matrix3} projection
	 */
	setProjection(projection) {
		this.#projection = projection;
	}

	async build() {
		super.build();

		this._canvas = new OffscreenCanvas(0, 0);
		this._context = this._canvas.getContext("webgl2");

		this._context.enable(this._context.BLEND);
		this._context.blendFunc(this._context.SRC_ALPHA, this._context.ONE_MINUS_SRC_ALPHA);

		const loader = new ShaderLoader("../shaders/");
		const vertexShaderSource = await loader.load("gui.vert");
		const fragmentShaderSource = await loader.load("gui.frag");

		const program = this._createProgram(vertexShaderSource, fragmentShaderSource);

		this._context.useProgram(program);

		this._programs.push(program);
		this._attributes.vertex = 0;
		this._attributes.world = 1;
		this._attributes.textureIndex = 4;
		this._attributes.texture = 5;
		this._attributes.colorMask = 8;
		this._uniforms.projection = this._context.getUniformLocation(program, "u_projection");
		this._buffers.vertex = this._context.createBuffer();
		this._buffers.world = this._context.createBuffer();
		this._buffers.textureIndex = this._context.createBuffer();
		this._buffers.texture = this._context.createBuffer();
		this._buffers.colorMask = this._context.createBuffer();

	 	this._context.uniformMatrix3fv(this._uniforms.projection, false, this.#projection);

		this._context.enableVertexAttribArray(this._attributes.vertex);
		this._context.enableVertexAttribArray(this._attributes.world);
		this._context.enableVertexAttribArray(this._attributes.textureIndex);
		this._context.enableVertexAttribArray(this._attributes.texture);
		this._context.enableVertexAttribArray(this._attributes.colorMask);

		this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.vertex);
		this._context.vertexAttribPointer(this._attributes.vertex, 2, this._context.FLOAT, false, 0, 0);
		this._context.bufferData(this._context.ARRAY_BUFFER, new Float32Array([
			1, 1,
			0, 1,
			0, 0,
			1, 0,
		]), this._context.STATIC_DRAW);

		this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.textureIndex);
		this._context.vertexAttribIPointer(this._attributes.textureIndex, 1, this._context.UNSIGNED_BYTE, 0, 0);
		this._context.vertexAttribDivisor(this._attributes.textureIndex, 1);

		this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.colorMask);
		this._context.vertexAttribPointer(this._attributes.colorMask, 4, this._context.UNSIGNED_BYTE, true, 0, 0);
		this._context.vertexAttribDivisor(this._attributes.colorMask, 1);

		this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.world);

		let i;

		for (i = this._attributes.world + 2; i >= this._attributes.world; i--) {
			this._context.enableVertexAttribArray(i);
			this._context.vertexAttribPointer(i, 3, this._context.FLOAT, false, 36, (i - 1) * 12);
			this._context.vertexAttribDivisor(i, 1);
		}

		this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.texture);

		for (i = this._attributes.texture + 2; i >= this._attributes.texture; i--) {
			this._context.enableVertexAttribArray(i);
			this._context.vertexAttribPointer(i, 3, this._context.FLOAT, false, 36, (i - 5) * 12);
			this._context.vertexAttribDivisor(i, 1);
		}
	}

	/**
	 * @todo Create typed arrays with .of() instead of new?
	 * 
	 * @param {GUIScene} scene
	 */
	render(scene) {
		const queue = scene.getQueue();
		const subcomponentCount = scene.getSubcomponentCount();
		const worlds = new Float32Array(subcomponentCount * 9);
		const textureIndices = new Uint8Array(subcomponentCount);
		const textures = new Float32Array(subcomponentCount * 9);
		const colorMasks = new Uint8Array(subcomponentCount * 4);

		for (let i = 0, j, k = 0, cl = queue.length, component, position, textureIndex = new Uint8Array(1), subcomponents, sl, subcomponent, size, world, texture; i < cl; i++) {
			component = queue[i];
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
					.multiply(Matrix3.scale(size.clone().multiply(subcomponent.getScale())));
				texture = Matrix3
					.translation(subcomponent.getUV().clone().divide(WebGLRenderer.MAX_TEXTURE_SIZE))
					.multiply(Matrix3.scale(size.clone().divide(WebGLRenderer.MAX_TEXTURE_SIZE)));

				worlds.set(world, k * 9);
				textureIndices.set(textureIndex, k);
				textures.set(texture, k * 9);
				colorMasks.set(new Uint8Array(subcomponent.getColorMask()), k * 4);
			}
		}

		this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.world);
		this._context.bufferData(this._context.ARRAY_BUFFER, worlds, this._context.STATIC_DRAW);

		this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.textureIndex);
		this._context.bufferData(this._context.ARRAY_BUFFER, textureIndices, this._context.STATIC_DRAW);

		this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.texture);
		this._context.bufferData(this._context.ARRAY_BUFFER, textures, this._context.STATIC_DRAW);

		this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.colorMask);
		this._context.bufferData(this._context.ARRAY_BUFFER, colorMasks, this._context.STATIC_DRAW);

		this._context.drawArraysInstanced(this._context.TRIANGLE_FAN, 0, 4, subcomponentCount);
	}

	/**
	 * @todo Put in the base WebGLRenderer class?
	 * 
	 * @param {Vector4} viewport
	 * @param {Matrix3} projection
	 */
	resize(viewport, projection) {
		this.setViewport(viewport);

		this._context.uniformMatrix3fv(this._uniforms.projection, false, projection);
	}
}