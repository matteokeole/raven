import {IndexBuffer} from "../IndexBuffer.js";

export class WebGLIndexBuffer extends IndexBuffer {
	/**
	 * @override
	 * @type {WebGL2RenderingContext}
	 */
	_context = null;

	/**
	 * @override
	 * @type {GLenum}
	 */
	_format = null;

	/**
	 * @param {WebGL2RenderingContext} context
	 * @param {ArrayBuffer} indices
	 * @param {GLenum} format
	 */
	constructor(context, indices, format) {
		super();

		this._context = context;
		this._format = format;
		this._buffer = this._context.createBuffer();

		this.bind();

		this._context.bufferData(this._context.ELEMENT_ARRAY_BUFFER, indices, this._context.STATIC_DRAW);
	}

	bind() {
		this._context.bindBuffer(this._context.ELEMENT_ARRAY_BUFFER, this._buffer);
	}

	unbind() {
		this._context.bindBuffer(this._context.ELEMENT_ARRAY_BUFFER, null);
	}
}