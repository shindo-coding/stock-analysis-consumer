export function validateBodyFields(body: any, allowedFields: string[]): void {
	const bodyFields = Object.keys(body);
	for (const field of bodyFields) {
		if (!allowedFields.includes(field)) {
			throw new Error(`Invalid field: ${field}`);
		}
	}
}

export async function retryRequest<T>(
	requestFn: () => Promise<T>,
	retries = 3,
	delay = 1000,
): Promise<T> {
	try {
		return await requestFn();
	} catch (error) {
		if (retries === 0 || !isRetryableError(error)) {
			throw error;
		}

		this.logger.warn(
			`Request failed, retrying in ${delay}ms... (${retries} attempts left)`,
		);
		await new Promise((resolve) => setTimeout(resolve, delay));
		return retryRequest(requestFn, retries - 1, delay * 2);
	}
}

export function isRetryableError(error: any): boolean {
	// Add conditions for errors that should be retried
	return (
		error?.message === 'socket hang up' ||
		error?.code === 'ECONNRESET' ||
		error?.code === 'ETIMEDOUT'
	);
}
