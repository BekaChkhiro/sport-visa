import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

import { logger } from './logger';
import {
  generateRequestId,
  getRequestId,
  REQUEST_ID_HEADER,
  runWithRequestContext,
} from './request-context';

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION'
  | 'RATE_LIMITED'
  | 'INTERNAL';

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION: 422,
  RATE_LIMITED: 429,
  INTERNAL: 500,
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(
    code: ApiErrorCode,
    message: string,
    options?: { details?: unknown; cause?: unknown },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = 'ApiError';
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.details = options?.details;
  }
}

export type ApiErrorBody = {
  error: {
    code: ApiErrorCode;
    message: string;
    requestId: string;
    details?: unknown;
  };
};

export function errorResponse(error: ApiError, requestId?: string): NextResponse<ApiErrorBody> {
  const rid = requestId ?? getRequestId() ?? generateRequestId();
  const body: ApiErrorBody = {
    error: {
      code: error.code,
      message: error.message,
      requestId: rid,
      ...(error.details !== undefined ? { details: error.details } : {}),
    },
  };
  const res = NextResponse.json(body, { status: error.status });
  res.headers.set(REQUEST_ID_HEADER, rid);
  return res;
}

type HandlerArgs = [Request, ...unknown[]];
type RouteHandler = (...args: HandlerArgs) => Promise<Response> | Response;

/**
 * Wraps a Route Handler so that:
 *   1. The incoming `x-request-id` (set by middleware) is bound to
 *      AsyncLocalStorage — every logger.* call inside the handler emits it.
 *   2. Thrown ApiErrors become the documented JSON shape (see errorResponse).
 *   3. Anything else is logged at `error`, sent to Sentry, and returned as a
 *      500 with code `INTERNAL` — no stack traces leak to the client.
 */
export function apiHandler(handler: RouteHandler): RouteHandler {
  return async (...args) => {
    const [request] = args;
    const requestId = request.headers.get(REQUEST_ID_HEADER) ?? generateRequestId();

    return runWithRequestContext({ requestId }, async () => {
      try {
        return await handler(...args);
      } catch (err) {
        if (err instanceof ApiError) {
          logger.warn({ code: err.code, status: err.status, msg: err.message }, 'api_error');
          return errorResponse(err, requestId);
        }

        logger.error({ err }, 'unhandled_route_error');
        Sentry.captureException(err);

        const fallback = new ApiError('INTERNAL', 'Internal server error');
        return errorResponse(fallback, requestId);
      }
    });
  };
}
