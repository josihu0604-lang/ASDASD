import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { withRateLimit } from '@/lib/server/rate-limit';
import { parseQuery } from '@/lib/http/validate';
import { apiError } from '@/lib/http/errors';
import { WalletVouchersQuerySchema } from '@/lib/schemas/api';
import type { VouchersListResponse, VoucherCard } from '@/lib/types/api';

/**
 * GET /api/wallet/vouchers
 * 
 * Fetch user's vouchers with status filtering and pagination
 * 
 * Query params:
 *   - status: 'active' | 'used' | 'expired' (optional, shows all if not specified)
 *   - cursor: UUID for pagination (optional)
 *   - limit: 1-50 (default: 20)
 * 
 * Rate limit: 30 RPM per user
 * 
 * Sorting:
 *   - active: expire_at ASC (임박순 - most urgent first)
 *   - used/expired: created_at DESC (최근순 - most recent first)
 * 
 * Response:
 *   200: { items: VoucherCard[], nextCursor?: string }
 *   400: Invalid parameters
 *   429: Rate limit exceeded
 */
export const GET = withRateLimit({ key: 'wallet-vouchers', limit: 30, windowSec: 60 })(
  async (req: NextRequest) => {
    try {
      // 1. Parse and validate query params
      const url = new URL(req.url);
      const query = parseQuery(WalletVouchersQuerySchema, url);

      // 2. Get user ID (from session/auth in production)
      const userId = req.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001';

      // 3. Build filter conditions
      const whereConditions: any = {
        userId,
      };

      // Apply status filter if provided
      if (query.status) {
        whereConditions.status = query.status;
      }

      // Apply cursor for pagination
      if (query.cursor) {
        whereConditions.id = {
          lt: query.cursor, // Keyset pagination
        };
      }

      // 4. Determine sort order based on status
      let orderBy: any;
      
      if (query.status === 'active' || !query.status) {
        // Active vouchers: sort by expiration (urgent first)
        orderBy = [
          { status: 'asc' }, // active first if no status filter
          { expireAt: 'asc' },
          { id: 'desc' }, // Tie-breaker for consistent pagination
        ];
      } else {
        // Used/expired: sort by most recent
        orderBy = [
          { createdAt: 'desc' },
          { id: 'desc' },
        ];
      }

      // 5. Fetch vouchers
      const vouchers = await db.voucher.findMany({
        where: whereConditions,
        include: {
          offer: {
            include: {
              place: true,
            },
          },
        },
        orderBy,
        take: query.limit + 1, // Fetch one extra to determine next cursor
      });

      // 6. Determine pagination
      const hasMore = vouchers.length > query.limit;
      const items = hasMore ? vouchers.slice(0, query.limit) : vouchers;
      const nextCursor = hasMore ? items[items.length - 1].id : undefined;

      // 7. Transform to response format
      const voucherCards: VoucherCard[] = items.map(voucher => ({
        id: voucher.id,
        offer: {
          brand: voucher.offer.place.name,
          title: voucher.offer.title,
          benefit: voucher.offer.benefit || undefined,
        },
        expire_at: voucher.expireAt.toISOString(),
        status: voucher.status as 'active' | 'used' | 'expired',
        ...(voucher.usedAt && { used_at: voucher.usedAt.toISOString() }),
      }));

      // 8. Build response
      const response: VouchersListResponse = {
        items: voucherCards,
        ...(nextCursor && { nextCursor }),
      };

      return Response.json(response, {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=10', // Short cache for real-time wallet updates
        },
      });

    } catch (error: any) {
      // Handle known errors
      if (error instanceof Response) {
        return error;
      }

      console.error('[GET /api/wallet/vouchers] Error:', error);
      return apiError('server_error', 'Failed to fetch vouchers', 500);
    }
  }
);
