export class NotImplementedError extends Error {
	constructor() {
		super("An implementation is missing");
	}
}