import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from './index';

describe('Logger', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('masks sensitive data automatically', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    logger.info('Test login', {
      user: 'prasad',
      password: 'mySecretPassword',
      token: 'jwt-1234',
      otp: '123456',
      nested: {
        accessToken: 'abc-def',
        safeKey: 'hello'
      }
    });

    expect(consoleSpy).toHaveBeenCalled();
    const logCall = consoleSpy.mock.calls[0][0];
    const parsedLog = JSON.parse(logCall);

    expect(parsedLog.password).toBe('[REDACTED]');
    expect(parsedLog.token).toBe('[REDACTED]');
    expect(parsedLog.otp).toBe('[REDACTED]');
    expect(parsedLog.nested.accessToken).toBe('[REDACTED]');
    
    // Non-sensitive data remains
    expect(parsedLog.user).toBe('prasad');
    expect(parsedLog.nested.safeKey).toBe('hello');
  });

  it('safely serializes error objects', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const err = new Error('Database connection failed');
    
    logger.error('Failed to connect', {
      requestId: 'req-1',
      error: err
    });

    const logCall = consoleSpy.mock.calls[0][0];
    const parsedLog = JSON.parse(logCall);

    expect(parsedLog.requestId).toBe('req-1');
    expect(parsedLog.errorDetails).toBeDefined();
    expect(parsedLog.errorDetails.message).toBe('Database connection failed');
    expect(parsedLog.errorDetails.stack).toBeDefined();
    // The original `error` key should be replaced by `errorDetails` to prevent logging failures
    expect(parsedLog.error).toBeUndefined();
  });
});
