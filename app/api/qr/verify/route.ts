import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { withRateLimit } from '@/lib/server/rate-limit';
import { parseJson } from '@/lib/http/validate';
import { apiError } from '@/lib/http/errors';
import { QRVerifyBodySchema } from '@/lib/schemas/api';
import type { QrVerifyResponse } from '@/lib/types/api';
import { createHash } from 'crypto';

/**
 * POST /api/qr/verify
 * 
 * Verify QR code and mark voucher as used
 * 
 * Body:
 *   { token: string }
 * 
 * Rate limit: 30 RPM per user
 * 
 * Response:
 *   200: { result: 'success', voucher_id: string }
 *   200: { result: 'already_used', used_at?: string }
 *   200: { result: 'expired', expired_at?: string }
 *   200: { result: 'invalid' }
 *   400: Invalid request body
 *   429: Rate limit exceeded
 *   500: Server error
 * 
 * Note: This endpoint is naturally idempotent - same token always returns same result
 */
export const POST = withRateLimit({ key: 'qr-verify', limit: 30, windowSec: 60 })(
  async (req: NextRequest) => {
    try {
      // 1. Parse and validate request body
      const body = await parseJson(QRVerifyBodySchema, req);

      // 2. Hash the token for lookup
      const tokenHash = createHash('sha256').update(body.token).digest('hex');

      // 3. Find QR token and execute verification in transaction
      const result = await db.$transaction(async (tx) => {
        // 3.1 Find QR token
        const qrToken = await tx.qrToken.findUnique({
          where: { codeHash: tokenHash },
          include: {
            voucher: true,
          },
        });

        // 3.2 Check if token exists
        if (!qrToken) {
          return { result: 'invalid' as const };
        }

        // 3.3 Check TTL expiration
        const now = new Date();
        const tokenAge = Math.floor((now.getTime() - qrToken.createdAt.getTime()) / 1000);
        
        if (tokenAge > qrToken.ttlSec) {
          // Token expired
          await tx.qrToken.update({
            where: { id: qrToken.id },
            data: { status: 'expired' },
          });
          
          return {
            result: 'expired' as const,
            expired_at: new Date(qrToken.createdAt.getTime() + qrToken.ttlSec * 1000).toISOString(),
          };
        }

        // 3.4 Check if already used
        if (qrToken.status === 'used') {
          return {
            result: 'already_used' as const,
            used_at: qrToken.voucher.usedAt?.toISOString(),
          };
        }

        // 3.5 Check voucher status
        if (qrToken.voucher.status !== 'active') {
          if (qrToken.voucher.status === 'used') {
            return {
              result: 'already_used' as const,
              used_at: qrToken.voucher.usedAt?.toISOString(),
            };
          }
          if (qrToken.voucher.status === 'expired') {
            return {
              result: 'expired' as const,
              expired_at: qrToken.voucher.expireAt.toISOString(),
            };
          }
        }

        // 3.6 Check voucher expiration
        if (qrToken.voucher.expireAt < now) {
          // Update voucher status to expired
          await tx.voucher.update({
            where: { id: qrToken.voucherId },
            data: { status: 'expired' },
          });
          
          return {
            result: 'expired' as const,
            expired_at: qrToken.voucher.expireAt.toISOString(),
          };
        }

        // 3.7 SUCCESS: Mark voucher as used (with row lock)
        await tx.voucher.update({
          where: { id: qrToken.voucherId },
          data: {
            status: 'used',
            usedAt: now,
          },
        });

        // 3.8 Mark QR token as used
        await tx.qrToken.update({
          where: { id: qrToken.id },
          data: { status: 'used' },
        });

        // 3.9 Optional: Create ledger entry for points/stamps earned
        // This depends on the offer's reward configuration
        // For now, we'll skip this as schema doesn't define reward rules

        return {
          result: 'success' as const,
          voucher_id: qrToken.voucherId,
        };
      });

      // 4. Return result
      const response: QrVerifyResponse = result as any;

      return Response.json(response, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });

    } catch (error: any) {
      // Handle known errors
      if (error instanceof Response) {
        return error;
      }

      console.error('[POST /api/qr/verify] Error:', error);
      return apiError('server_error', 'Failed to verify QR code', 500);
    }
  }
);
