/**
 * @abstract
 */
export class Scene {
	/**
	 * @type {Array}
	 */
	_queue;

	constructor() {
		this._queue = [];
	}

	getQueue() {
		return this._queue;
	}

	/**
	 * @returns {Boolean}
	 */
	isEmpty() {
		return this._queue.length === 0;
	}

	clear() {
		this._queue.length = 0;
	}
}