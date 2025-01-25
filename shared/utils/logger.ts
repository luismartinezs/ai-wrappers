/**
 * Flexible logging utility for Node.js applications
 *
 * @example
 * // Basic usage
 * logger('AuthService', 'User logged in', { userId: 123 }, 'info');
 *
 * // Create child logger
 * const serviceLogger = createLogger('AuthService');
 * serviceLogger('User logged out', { userId: 456 }, 'debug');
 *
 * // Configuration
 * configureLogger({
 *   level: 'debug',
 *   environments: ['development', 'staging'],
 *   prettyPrint: true
 * });
 *
 * // Custom transport
 * configureLogger({
 *   transports: [(entry) => {
 *     // Send to external service
 *   }]
 * });
 */


type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type Transport = (entry: LogEntry) => void;

interface LogEntry {
  timestamp: string;
  context: string;
  message: string;
  level: LogLevel;
  data?: unknown;
}

interface LoggerConfig {
  level: LogLevel;
  environments: string[];
  transports: Transport[];
  prettyPrint: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const defaultConfig: LoggerConfig = {
  level: 'info',
  environments: ['development'],
  transports: [consoleTransport],
  prettyPrint: process.env.NODE_ENV === 'development',
};

let config: LoggerConfig = { ...defaultConfig };

function consoleTransport(entry: LogEntry): void {
  const method = entry.level === 'error' ? 'error' :
                 entry.level === 'warn'  ? 'warn' :
                 entry.level === 'info'  ? 'info' :
                 'debug';
  console[method](safeStringify(entry, config.prettyPrint ? 2 : undefined));
}

function safeStringify(obj: unknown, indent?: number): string {
  const seen = new WeakSet();

  const replacer = (key: string, value: unknown) => {
    if (value instanceof Error) {
      return {
        __error__: true,
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    return value;
  };

  try {
    return JSON.stringify(obj, replacer, indent);
  } catch (e) {
    return JSON.stringify({
      error: 'Log serialization failed',
      details: e instanceof Error ? e.message : 'Unknown error',
    });
  }
}

export function configureLogger(overrides: Partial<LoggerConfig>): void {
  config = { ...config, ...overrides };
}

export function createLogger(context: string) {
  return function log(
    message: string,
    data?: unknown,
    level: LogLevel = 'info'
  ): void {
    const currentEnv = process.env.NODE_ENV || 'development';
    if (!config.environments.includes(currentEnv)) return;
    if (LOG_LEVELS[level] < LOG_LEVELS[config.level]) return;

    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      context,
      message,
      level,
    };

    if (data !== undefined) {
      logEntry.data = data;
    }

    config.transports.forEach(transport => transport(logEntry));
  };
}

// Utility for quick logging without creating child logger
export function logger(context: string, message: string, data?: unknown, level: LogLevel = 'info') {
  const log = createLogger(context);
  log(message, data, level);
}