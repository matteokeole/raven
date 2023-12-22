/**
 * @template T
 * @extends {Array<T>}
 */
export class BucketStack extends Array {
	/**
	 * @type {Number[]}
	 */
	#bucketIndices;

	/**
	 * @type {Number}
	 */
	#lastBucketLength;

	constructor() {
		super();

		this.#bucketIndices = [];
		this.#lastBucketLength = 0;
	}

	sealBucket() {
		this.#bucketIndices.push(this.#lastBucketLength);
		this.#lastBucketLength = this.length;
	}

	/**
	 * @throws {Error} if there are no buckets
	 */
	popBucket() {
		if (this.#bucketIndices.length === 0) {
			throw new Error("Cannot pop bucket: no buckets found.");
		}

		this.#lastBucketLength = this.#bucketIndices.pop();
		this.length = this.#lastBucketLength;
	}
}