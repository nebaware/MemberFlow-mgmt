/**
 * Production-safe logging utility
 * Replaces console.log statements with proper logging
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isTest = process.env.NODE_ENV === 'test';
  private seen = new Set<any>();

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (data) {
      try {
        if (typeof data === 'object' && data !== null) {
          // Handle standard Error serialization
          if (data instanceof Error) {
            return `${prefix} ${message} ${data.stack || data.message}`;
          }
          return `${prefix} ${message} ${JSON.stringify(data, (key, value) => {
            if (typeof value === 'object' && value !== null) {
              if (this.seen.has(value)) return '[Circular]';
              this.seen.add(value);
            }
            return value;
          }, 2)}`;
        }
        return `${prefix} ${message} ${data}`;
      } catch (e) {
        return `${prefix} ${message} [Serialization Error: ${e instanceof Error ? e.message : 'Circular reference'}]`;
      } finally {
        this.seen.clear();
      }
    }
    return `${prefix} ${message}`;
  }

  /**
   * Log informational messages (only in development)
   */
  info(message: string, data?: any) {
    if (this.isDevelopment) {
      console.log(this.formatMessage('info', message, data));
    }
  }

  /**
   * Log warnings (development and production)
   */
  warn(message: string, data?: any) {
    if (this.isDevelopment || !this.isTest) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  /**
   * Log errors (always logged, but sanitized in production)
   */
  error(message: string, error?: any) {
    const sanitizedError = this.isDevelopment
      ? error
      : { message: error?.message || 'An error occurred' };

    console.error(this.formatMessage('error', message, sanitizedError));
  }

  /**
   * Debug logs (only in development)
   */
  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, data));
    }
  }

  /**
   * Log payment operations (sanitized)
   */
  payment(operation: string, data: any) {
    const sanitized = {
      operation,
      orderId: data.orderId,
      amount: data.amount,
      method: data.method,
      // Never log sensitive data like card numbers, API keys, etc.
    };
    this.info(`Payment: ${operation}`, sanitized);
  }

  /**
   * Log API requests (sanitized)
   */
  api(method: string, endpoint: string, status?: number) {
    this.info(`API ${method} ${endpoint}`, { status });
  }

  /**
   * Log database operations (sanitized)
   */
  db(operation: string, table?: string, error?: any) {
    if (error) {
      this.error(`DB ${operation} failed`, { table, error: error.message });
    } else {
      this.debug(`DB ${operation}`, { table });
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing
export { Logger };
