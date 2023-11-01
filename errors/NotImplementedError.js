/**
 * Represents an error where a class method is yet to be implemented.
 * This can act as an exception based TODO tag.
 */
export function NotImplementedError() {
	const instance = Error("This feature is not implemented yet.");

	Object.setPrototypeOf(instance, this);

	return instance;
}

NotImplementedError.prototype = new Error;
NotImplementedError.prototype.name = "NotImplementedError";