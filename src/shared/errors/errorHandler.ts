import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AppError } from './index';
import { logger } from '../logger';

/**
 * Standard API error response shape.
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: any; // e.g. Zod validation issues
  };
}

/**
 * Converts any thrown error into a standardized NextResponse.
 * Logs unexpected errors securely.
 */
export function handleApiError(error: unknown, requestId: string): NextResponse<ApiErrorResponse> {
  // 1. Known App Errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          requestId,
        },
      },
      { status: error.statusCode }
    );
  }

  // 2. Validation Errors (Zod)
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          requestId,
          details: error.issues,
        },
      },
      { status: 422 }
    );
  }

  // 3. Unexpected Server Errors
  logger.error('Unhandled API Error', {
    requestId,
    error,
  });

  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred. Please try again later.',
        requestId,
      },
    },
    { status: 500 }
  );
}
