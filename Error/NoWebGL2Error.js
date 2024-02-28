export class NoWebGL2Error extends Error {
	constructor() {
		super("WebGL2 is not supported");
	}
}