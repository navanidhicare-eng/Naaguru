import { NextRequest, NextResponse } from 'next/server';
import { logger } from '../logger';
import { handleApiError } from '../errors/errorHandler';
import crypto from 'crypto';

export type RouteContext = {
  requestId: string;
};

type RouteHandler = (
  req: NextRequest,
  context: RouteContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => Promise<NextResponse> | NextResponse;

/**
 * A simple wrapper for Next.js Route Handlers to provide foundational capabilities:
 * 1. Generates or extracts a requestId.
 * 2. Logs incoming requests.
 * 3. Safely catches and formats all errors (eliminates try/catch boilerplate).
 * 4. Logs response status and duration.
 * 5. Injects the requestId into the response headers.
 */
export function withRouteContext(handler: RouteHandler) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const startMs = Date.now();
    const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
    const routeContext: RouteContext = { requestId };

    // Log incoming request
    logger.info(`[REQ] ${req.method} ${req.nextUrl.pathname}`, { requestId });

    let response: NextResponse;
    try {
      // Execute the business logic
      response = await handler(req, routeContext, ...args);
    } catch (error) {
      // Handle all expected and unexpected errors
      response = handleApiError(error, requestId);
    }

    // Attach request ID to response so clients can reference it
    response.headers.set('x-request-id', requestId);

    // Log outgoing response
    const durationMs = Date.now() - startMs;
    const status = response.status;
    const logLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    
    logger[logLevel](`[RES] ${req.method} ${req.nextUrl.pathname}`, {
      requestId,
      status,
      durationMs,
    });

    return response;
  };
}
