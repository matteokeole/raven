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

	popBucket() {
		/**
		 * If this instance is more recent than others, the numbers of buckets may not match.
		 * This prevents crashing if no bucket indices are found.
		 */
		if (this.#bucketIndices.length === 0) {
			return;
		}

		this.#lastBucketLength = this.#bucketIndices.pop();
		this.length = this.#lastBucketLength;
	}
}