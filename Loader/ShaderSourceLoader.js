import {Loader} from "./Loader.js";

export class ShaderSourceLoader extends Loader {
	/**
	 * Loads and returns shader code from a source file.
	 * 
	 * @inheritdoc
	 * @param {String} path
	 * @returns {Promise.<String>}
	 * @throws {Error} if the request fails
	 */
	async load(path) {
		const response = await fetch(`${this._basePath}${path}`);

		if (!response.ok) {
			throw new Error(`Could not fetch the shader source: request failed with status ${response.status}.`);
		}

		return await response.text();
	}
}