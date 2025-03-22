import { Logger } from '@nestjs/common';

export abstract class BaseClass {
	protected logger: Logger;

	constructor(private serviceName: string) {
		this.logger = new Logger(serviceName, { timestamp: true });
	}
}
