/**
 * Standard API Error Codes
 * Used across all API routes for consistent error handling
 */
export type ApiErrorCode =
  | 'invalid_param'
  | 'missing_idempotency_key'
  | 'rate_limited'
  | 'not_found'
  | 'expired'
  | 'already_accepted'
  | 'already_used'
  | 'invalid_token'
  | 'conflict'
  | 'server_error';

/**
 * Standard error response structure
 */
export interface ApiErrorResponse {
  error: {
    code: ApiErrorCode;
    message: string;
    request_id: string;
  };
}

/**
 * Create a standard API error response
 * 
 * @param code - Error code from ApiErrorCode enum
 * @param message - Human-readable error message
 * @param status - HTTP status code (default: 400)
 * @returns Response object with JSON error body
 */
export function apiError(
  code: ApiErrorCode,
  message: string,
  status = 400
): Response {
  const requestId = crypto.randomUUID();
  
  const body: ApiErrorResponse = {
    error: {
      code,
      message,
      request_id: requestId,
    },
  };

  return Response.json(body, { status });
}

/**
 * Standard error status code mapping
 */
export const ERROR_STATUS_MAP: Record<ApiErrorCode, number> = {
  invalid_param: 400,
  missing_idempotency_key: 400,
  rate_limited: 429,
  not_found: 404,
  expired: 410,
  already_accepted: 409,
  already_used: 409,
  invalid_token: 422,
  conflict: 409,
  server_error: 500,
};

/**
 * Get appropriate status code for error code
 */
export function getErrorStatus(code: ApiErrorCode): number {
  return ERROR_STATUS_MAP[code] || 400;
}
