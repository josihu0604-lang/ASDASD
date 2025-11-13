import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { withRateLimit } from '@/lib/server/rate-limit';
import { apiError } from '@/lib/http/errors';
import type { WalletSummary } from '@/lib/types/api';

/**
 * GET /api/wallet/summary
 * 
 * Fetch wallet summary with points, stamps, and voucher counts
 * 
 * Rate limit: 30 RPM per user
 * 
 * Response:
 *   200: WalletSummary
 *   429: Rate limit exceeded
 *   500: Server error
 */
export const GET = withRateLimit({ key: 'wallet-summary', limit: 30, windowSec: 60 })(
  async (req: NextRequest) => {
    try {
      // 1. Get user ID (from session/auth in production)
      const userId = req.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001';

      // 2. Aggregate all data in a single optimized query
      const now = new Date();
      const expiringThreshold = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48h from now

      // Execute parallel queries for better performance
      const [voucherStats, latestLedger, stampCount] = await Promise.all([
        // Voucher statistics
        db.voucher.groupBy({
          by: ['status'],
          where: {
            userId,
          },
          _count: {
            status: true,
          },
        }),
        
        // Latest ledger entry for balance
        db.ledger.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          select: { balanceAfter: true },
        }),
        
        // Stamp count (assuming stamps are tracked in ledger or separate table)
        // For now, we'll calculate from ledger entries with type 'stamp'
        db.ledger.count({
          where: {
            userId,
            type: 'stamp',
          },
        }),
      ]);

      // 3. Find nearest expiring voucher
      const nearestExpiringVoucher = await db.voucher.findFirst({
        where: {
          userId,
          status: 'active',
          expireAt: {
            gte: now,
            lte: expiringThreshold,
          },
        },
        orderBy: {
          expireAt: 'asc',
        },
        select: {
          expireAt: true,
        },
      });

      // 4. Calculate active and expiring voucher counts
      const activeCount = voucherStats.find(s => s.status === 'active')?._count.status || 0;
      
      const expiringCount = await db.voucher.count({
        where: {
          userId,
          status: 'active',
          expireAt: {
            gte: now,
            lte: expiringThreshold,
          },
        },
      });

      // 5. Build summary response
      const summary: WalletSummary = {
        points: latestLedger?.balanceAfter || 0,
        stamps: {
          count: stampCount,
          next_reward_in: Math.max(0, 10 - (stampCount % 10)), // Assuming 10 stamps per reward
        },
        vouchers: {
          active: activeCount,
          expiring: expiringCount,
          ...(nearestExpiringVoucher && {
            nearest_expire_at: nearestExpiringVoucher.expireAt.toISOString(),
          }),
        },
      };

      return Response.json(summary, {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=30', // 30s cache (SWR friendly)
        },
      });

    } catch (error: any) {
      // Handle known errors
      if (error instanceof Response) {
        return error;
      }

      console.error('[GET /api/wallet/summary] Error:', error);
      return apiError('server_error', 'Failed to fetch wallet summary', 500);
    }
  }
);
