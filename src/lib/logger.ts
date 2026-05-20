import pino, { type Logger, type LoggerOptions } from 'pino';

import { env } from './env';
import { getRequestId } from './request-context';

const defaultLevel = env.NODE_ENV === 'production' ? 'info' : 'debug';

const baseOptions: LoggerOptions = {
  level: env.LOG_LEVEL ?? defaultLevel,
  base: {
    service: 'sport-visa',
    env: env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token', '*.secret'],
    censor: '[redacted]',
  },
  // Inject the current request ID from AsyncLocalStorage into every log line.
  mixin() {
    const requestId = getRequestId();
    return requestId ? { requestId } : {};
  },
};

// Pretty-print only when running locally outside production. In production we
// emit raw JSON so log aggregators (Railway, Logflare) can parse cleanly.
const transport =
  env.NODE_ENV === 'development'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss.l',
          ignore: 'pid,hostname,service,env',
        },
      }
    : undefined;

export const logger: Logger = transport ? pino({ ...baseOptions, transport }) : pino(baseOptions);

export function childLogger(bindings: Record<string, unknown>): Logger {
  return logger.child(bindings);
}
