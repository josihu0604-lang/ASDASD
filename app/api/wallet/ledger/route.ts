import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { withRateLimit } from '@/lib/server/rate-limit';
import { parseQuery } from '@/lib/http/validate';
import { apiError } from '@/lib/http/errors';
import { WalletLedgerQuerySchema } from '@/lib/schemas/api';
import type { LedgerListResponse, LedgerEntry } from '@/lib/types/api';

/**
 * GET /api/wallet/ledger
 * 
 * Fetch user's transaction history (ledger)
 * 
 * Query params:
 *   - cursor: UUID for pagination (optional)
 *   - limit: 1-50 (default: 20)
 * 
 * Rate limit: 30 RPM per user
 * 
 * Sorting: created_at DESC (most recent first)
 * 
 * Response:
 *   200: { items: LedgerEntry[], nextCursor?: string }
 *   400: Invalid parameters
 *   429: Rate limit exceeded
 */
export const GET = withRateLimit({ key: 'wallet-ledger', limit: 30, windowSec: 60 })(
  async (req: NextRequest) => {
    try {
      // 1. Parse and validate query params
      const url = new URL(req.url);
      const query = parseQuery(WalletLedgerQuerySchema, url);

      // 2. Get user ID (from session/auth in production)
      const userId = req.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001';

      // 3. Build filter conditions
      const whereConditions: any = {
        userId,
      };

      // Apply cursor for pagination
      if (query.cursor) {
        whereConditions.id = {
          lt: query.cursor, // Keyset pagination
        };
      }

      // 4. Fetch ledger entries
      const entries = await db.ledger.findMany({
        where: whereConditions,
        orderBy: [
          { createdAt: 'desc' },
          { id: 'desc' }, // Tie-breaker for consistent pagination
        ],
        take: query.limit + 1, // Fetch one extra to determine next cursor
      });

      // 5. Determine pagination
      const hasMore = entries.length > query.limit;
      const items = hasMore ? entries.slice(0, query.limit) : entries;
      const nextCursor = hasMore ? items[items.length - 1].id : undefined;

      // 6. Transform to response format
      const ledgerEntries: LedgerEntry[] = items.map(entry => ({
        id: entry.id,
        type: entry.type as 'earn' | 'spend' | 'reward',
        amount: entry.amount,
        balance_after: entry.balanceAfter,
        created_at: entry.createdAt.toISOString(),
        ...(entry.refId && { ref_id: entry.refId }),
        ...(entry.description && { description: entry.description }),
      }));

      // 7. Build response
      const response: LedgerListResponse = {
        items: ledgerEntries,
        ...(nextCursor && { nextCursor }),
      };

      return Response.json(response, {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=10', // Short cache for real-time updates
        },
      });

    } catch (error: any) {
      // Handle known errors
      if (error instanceof Response) {
        return error;
      }

      console.error('[GET /api/wallet/ledger] Error:', error);
      return apiError('server_error', 'Failed to fetch ledger', 500);
    }
  }
);
