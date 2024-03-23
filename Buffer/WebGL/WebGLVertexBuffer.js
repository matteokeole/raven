import {VertexBuffer} from "../VertexBuffer.js";

export class WebGLVertexBuffer extends VertexBuffer {
	/**
	 * @override
	 * @type {WebGL2RenderingContext}
	 */
	_context = null;

	/**
	 * @param {WebGL2RenderingContext} context
	 * @param {ArrayBuffer} vertices
	 */
	constructor(context, vertices) {
		super();

		this._context = context;
		this._buffer = this._context.createBuffer();

		this.bind();

		this._context.bufferData(this._context.ARRAY_BUFFER, vertices, this._context.STATIC_DRAW);
	}

	bind() {
		this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffer);
	}

	unbind() {
		this._context.bindBuffer(this._context.ARRAY_BUFFER, null);
	}
}