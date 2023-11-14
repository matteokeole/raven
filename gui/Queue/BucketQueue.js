/**
 * @template T
 * @extends {Array<T>}
 */
export class BucketQueue extends Array {
	/**
	 * @type {Number[]}
	 */
	#bucketIndices;

	constructor() {
		super();

		this.#bucketIndices = [];
	}

	sealBucket() {
		this.#bucketIndices.push(this.length);
	}

	/**
	 * @throws {Error} if there are no buckets
	 */
	popBucket() {
		if (this.#bucketIndices.length === 0) {
			throw new Error("Cannot pop bucket: no buckets found.");
		}

		this.length = this.#bucketIndices.pop();
	}
}