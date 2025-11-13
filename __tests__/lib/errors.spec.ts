import { describe, it, expect } from 'vitest';
import { apiError, getErrorStatus, ERROR_STATUS_MAP } from '@/lib/http/errors';

describe('Error Handling', () => {
  describe('apiError', () => {
    it('should create error response with correct structure', async () => {
      const error = apiError('invalid_param', 'Test error message', 400);
      const json = await error.json();

      expect(error.status).toBe(400);
      expect(json.error.code).toBe('invalid_param');
      expect(json.error.message).toBe('Test error message');
      expect(json.error.request_id).toBeDefined();
      expect(typeof json.error.request_id).toBe('string');
    });

    it('should use default status 400 if not provided', async () => {
      const error = apiError('invalid_param', 'Test message');
      expect(error.status).toBe(400);
    });

    it('should generate unique request IDs', async () => {
      const error1 = apiError('invalid_param', 'Test 1');
      const error2 = apiError('invalid_param', 'Test 2');
      
      const json1 = await error1.json();
      const json2 = await error2.json();

      expect(json1.error.request_id).not.toBe(json2.error.request_id);
    });
  });

  describe('getErrorStatus', () => {
    it('should return correct status for each error code', () => {
      expect(getErrorStatus('invalid_param')).toBe(400);
      expect(getErrorStatus('rate_limited')).toBe(429);
      expect(getErrorStatus('not_found')).toBe(404);
      expect(getErrorStatus('expired')).toBe(410);
      expect(getErrorStatus('already_accepted')).toBe(409);
      expect(getErrorStatus('already_used')).toBe(409);
      expect(getErrorStatus('invalid_token')).toBe(422);
      expect(getErrorStatus('conflict')).toBe(409);
      expect(getErrorStatus('server_error')).toBe(500);
    });

    it('should return 400 for unknown error codes', () => {
      expect(getErrorStatus('unknown_error' as any)).toBe(400);
    });
  });

  describe('ERROR_STATUS_MAP', () => {
    it('should have entries for all error codes', () => {
      const errorCodes = [
        'invalid_param',
        'missing_idempotency_key',
        'rate_limited',
        'not_found',
        'expired',
        'already_accepted',
        'already_used',
        'invalid_token',
        'conflict',
        'server_error',
      ];

      errorCodes.forEach(code => {
        expect(ERROR_STATUS_MAP).toHaveProperty(code);
        expect(typeof ERROR_STATUS_MAP[code as keyof typeof ERROR_STATUS_MAP]).toBe('number');
      });
    });
  });
});
