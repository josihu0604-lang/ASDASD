import { z } from 'zod';
import { db } from './db';
import { apiError } from '../http/errors';

/**
 * Idempotency store result
 */
interface IdempotentResult {
  status: number;
  body: any;
}

/**
 * Idempotency wrapper for state-changing operations
 * 
 * Usage:
 *   return withIdempotency(req, async () => {
 *     // Your business logic here
 *     return { status: 201, body: { id: '...' } };
 *   });
 * 
 * @param req - Request object
 * @param fn - Async function that returns { status, body }
 * @returns Response with cached or new result
 */
export async function withIdempotency(
  req: Request,
  fn: () => Promise<IdempotentResult>
): Promise<Response> {
  // 1. Validate Idempotency-Key header
  const key = req.headers.get('idempotency-key');
  
  if (!key) {
    throw apiError('missing_idempotency_key', 'Idempotency-Key header is required', 400);
  }

  // Validate UUID format
  if (!z.string().uuid().safeParse(key).success) {
    throw apiError('invalid_param', 'Idempotency-Key must be a valid UUID', 400);
  }

  // 2. Check for cached response (24h TTL)
  const cached = await db.idempotency.findUnique({
    where: { key },
  });

  if (cached && cached.expiresAt > new Date()) {
    // Return cached response
    return Response.json(cached.response, {
      status: cached.status,
      headers: {
        'X-Idempotency': 'hit',
        'Content-Type': 'application/json',
      },
    });
  }

  // 3. Execute business logic
  const result = await fn();

  // 4. Save response for 24 hours
  await db.idempotency.upsert({
    where: { key },
    update: {
      status: result.status,
      response: result.body,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    create: {
      key,
      status: result.status,
      response: result.body,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  // 5. Return fresh response
  return Response.json(result.body, {
    status: result.status,
    headers: {
      'X-Idempotency': 'miss',
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Clean up expired idempotency records
 * Should be called periodically (e.g., via cron job)
 */
export async function cleanupExpiredIdempotency(): Promise<number> {
  const result = await db.idempotency.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return result.count;
}
