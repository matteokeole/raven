export class ProgramLinkingError extends Error {
	/**
	 * @param {String} log Program info log
	 */
	constructor(log) {
		super(`PROGRAM LINKING ERROR: ${log}`);
	}
}