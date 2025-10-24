/**
 * Production-ready logger utility
 * Replaces console.log statements with structured logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;
    
    if (this.isDevelopment) {
      // Simple format for development
      const contextStr = context ? ` ${JSON.stringify(context)}` : '';
      const errorStr = error ? ` Error: ${error.message}` : '';
      return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}${errorStr}`;
    }
    
    // Structured JSON for production
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...(context && { context }),
      ...(error && { 
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      })
    });
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error
    };

    const formattedLog = this.formatLog(entry);

    // In production, use appropriate console methods
    // In development, always use console.log for simplicity
    if (this.isProduction) {
      switch (level) {
        case 'error':
          console.error(formattedLog);
          break;
        case 'warn':
          console.warn(formattedLog);
          break;
        case 'info':
          console.info(formattedLog);
          break;
        case 'debug':
          console.debug(formattedLog);
          break;
      }
    } else {
      console.log(formattedLog);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    if (!this.isProduction) {
      this.log('debug', message, context);
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log('error', message, context, error);
  }

  // Convenience methods for common use cases
  auth(message: string, context?: Record<string, any>) {
    this.info(`[AUTH] ${message}`, context);
  }

  database(message: string, context?: Record<string, any>) {
    this.info(`[DATABASE] ${message}`, context);
  }

  api(message: string, context?: Record<string, any>) {
    this.info(`[API] ${message}`, context);
  }

  socket(message: string, context?: Record<string, any>) {
    this.info(`[SOCKET] ${message}`, context);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for backward compatibility and easy migration
export default logger;
