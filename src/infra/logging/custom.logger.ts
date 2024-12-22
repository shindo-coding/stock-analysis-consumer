import { ConsoleLogger, LogLevel } from '@nestjs/common';

export class CustomLogger extends ConsoleLogger {
  protected printMessages(
    messages: unknown[],
    context = '',
    logLevel: LogLevel = 'log',
    outStream?: 'stdout' | 'stderr',
  ) {
    if (context === 'InstanceLoader' && logLevel === 'log') {
      return;
    }
    super.printMessages(messages, context, logLevel, outStream);
  }

  protected formatPid() {
    return '[Nest] ';
  }

  protected getTimestamp() {
    return '';
  }
}


/**
 * Log message in JSON format with Datadog tracing.
 */
export function logMessage(level: LogLevel, content: object) {
  const time = new Date().toISOString();
  const message = JSON.stringify(content);
  const record = { time, level, message };

  console[level](JSON.stringify(record));
}
