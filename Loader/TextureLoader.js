import {Loader} from "./Loader.js";
import {Vector2} from "../math/index.js";

/**
 * @typedef Image
 * @property {String} name
 * @property {Uint8Array|HTMLImageElement} image
 * @property {Vector2} viewport
 */

/**
 * @typedef Color
 * @property {String} name
 * @property {Uint8Array} value Color value in the 0-255 range
 */

export class TextureLoader extends Loader {
	/**
	 * Loads and returns a list of textures from a source file.
	 * Continues to the next image if a source cannot be decoded.
	 * 
	 * @param {String} path
	 * @returns {Promise.<Image[]>}
	 * @throws {Error} if the request fails
	 */
	async load(path) {
		const response = await fetch(`${this._basePath}${path}`);

		if (!response.ok) {
			throw new Error(`Could not fetch the source file: request failed with status ${response.status}.`);
		}

		/**
		 * @type {String[]}
		 */
		const json = await response.json();

		/**
		 * @type {Promise.<Image>[]}
		 */
		const texturePromises = [];

		/**
		 * @type {Image[]}
		 */
		const textures = [];

		for (let i = 0; i < json.length; i++) {
			const path = json[i];
			const image = new Image();

			image.src = `${this._basePath}${path}`;

			const texturePromise = new Promise(async function(resolve, reject) {
				try {
					await image.decode();

					resolve({
						name: path,
						image,
						viewport: new Vector2(image.width, image.height),
					});
				} catch {
					reject("Could not decode the image source.");
				}
			});

			texturePromises.push(texturePromise);
		}

		const settledTexturePromises = await Promise.allSettled(texturePromises);

		for (let i = 0; i < settledTexturePromises.length; i++) {
			const settledTexturePromise = settledTexturePromises[i];

			if (settledTexturePromise.status === "rejected") {
				continue;
			}

			textures.push(settledTexturePromise.value);
		}

		return textures;
	}

	/**
	 * Loads and returns a list of 1x1 color textures from a value array.
	 * Continues to the next image if a source cannot be decoded.
	 * 
	 * @param {Color[]} json
	 * @param {Vector2} viewport Final texture size
	 * @returns {Image[]}
	 */
	loadColors(json, viewport) {
		const textures = [];

		for (let i = 0, length = json.length, color, image; i < length; i++) {
			color = json[i];

			const pixels = viewport[0] * viewport[1];
			const image = new Uint8Array(pixels * 4);

			for (let i = 0; i < pixels; i++) {
				image[i * 4 + 0] = color.value[0];
				image[i * 4 + 1] = color.value[1];
				image[i * 4 + 2] = color.value[2];
				image[i * 4 + 3] = color.value[3];
			}

			textures.push({
				name: color.name,
				image,
				viewport,
			});
		}

		return textures;
	}
}