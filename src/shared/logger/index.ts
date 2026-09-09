const SENSITIVE_KEYS = new Set([
  'password',
  'otp',
  'token',
  'jwt',
  'authorization',
  'cookie',
  'refresh_token',
  'accesstoken',
  'secret'
]);

/**
 * Recursively masks sensitive data in an object before logging.
 */
function maskSensitiveData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(maskSensitiveData);
  }

  const masked = { ...data };
  for (const key in masked) {
    if (Object.prototype.hasOwnProperty.call(masked, key)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        masked[key] = '[REDACTED]';
      } else {
        masked[key] = maskSensitiveData(masked[key]);
      }
    }
  }
  return masked;
}

/**
 * Safely serializes an Error object for logging.
 */
function serializeError(error: unknown): Record<string, any> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error as any)
    };
  }
  return { message: String(error) };
}

type LogContext = Record<string, any>;

/**
 * A simple, structured logger that wraps console methods.
 */
export const logger = {
  info(message: string, context?: LogContext) {
    const safeContext = context ? maskSensitiveData(context) : undefined;
    console.log(JSON.stringify({ level: 'INFO', message, ...safeContext }));
  },

  warn(message: string, context?: LogContext) {
    const safeContext = context ? maskSensitiveData(context) : undefined;
    console.warn(JSON.stringify({ level: 'WARN', message, ...safeContext }));
  },

  error(message: string, context?: LogContext & { error?: unknown }) {
    const ctxToMask = context ? { ...context } : {};
    
    if (ctxToMask.error) {
      ctxToMask.errorDetails = serializeError(ctxToMask.error);
      delete ctxToMask.error;
    }

    const safeContext = maskSensitiveData(ctxToMask);
    console.error(JSON.stringify({ level: 'ERROR', message, ...(safeContext as any) }));
  }
};
