import { describe, it, expect, vi } from 'vitest';
import { handleApiError } from './errorHandler';
import { AppError } from './index';
import { z } from 'zod';
import { NextResponse } from 'next/server';

// Mock NextResponse since we are not running in a Next.js server context
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

describe('handleApiError', () => {
  it('formats AppError correctly with correct status', () => {
    const error = new AppError('Profile not found', 404, 'NOT_FOUND');
    const response = handleApiError(error, 'req-123') as any;

    expect(response.status).toBe(404);
    expect(response.body.error).toEqual({
      code: 'NOT_FOUND',
      message: 'Profile not found',
      requestId: 'req-123',
    });
  });

  it('formats Zod validation errors correctly with 422 status', () => {
    const schema = z.object({ name: z.string().min(5) });
    const result = schema.safeParse({ name: 'abc' });
    
    if (!result.success) {
      const response = handleApiError(result.error, 'req-456') as any;

      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('Invalid request data');
      expect(response.body.error.requestId).toBe('req-456');
      expect(response.body.error.details).toBeDefined();
    }
  });

  it('formats unexpected errors safely without leaking internal details', () => {
    const error = new Error('Database connection failed (secret: xyz)');
    const response = handleApiError(error, 'req-789') as any;

    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(response.body.error.message).toBe('An unexpected error occurred. Please try again later.');
    expect(response.body.error.requestId).toBe('req-789');
    
    // Crucial: The error message should NOT contain the original DB error or stack trace
    expect(response.body.error.message).not.toContain('Database');
    expect(response.body.error.stack).toBeUndefined();
  });
});
