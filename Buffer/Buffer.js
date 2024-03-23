/**
 * @abstract
 */
export class Buffer {
	/**
	 * @type {Object}
	 */
	_context;

	/**
	 * @type {Object}
	 */
	_buffer;

	/**
	 * @abstract
	 */
	bind() {}

	/**
	 * @abstract
	 */
	unbind() {}
}