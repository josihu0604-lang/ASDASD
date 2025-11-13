import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { withRateLimit } from '@/lib/server/rate-limit';
import { parseQuery } from '@/lib/http/validate';
import { apiError } from '@/lib/http/errors';
import { OffersQuerySchema } from '@/lib/schemas/api';
import type { OffersListResponse, OfferCard } from '@/lib/types/api';

/**
 * GET /api/offers
 * 
 * Fetch offer list from user's inbox with filtering and pagination
 * 
 * Query params:
 *   - filter: 'all' | 'new' | 'expiring' (default: 'all')
 *   - cursor: UUID for pagination (optional)
 *   - limit: 1-50 (default: 20)
 *   - lat: latitude for distance calculation (optional)
 *   - lng: longitude for distance calculation (optional)
 * 
 * Rate limit: 60 RPM per user
 * 
 * Response:
 *   200: { items: OfferCard[], nextCursor?: string }
 *   400: Invalid parameters
 *   429: Rate limit exceeded
 */
export const GET = withRateLimit({ key: 'offers-list', limit: 60, windowSec: 60 })(
  async (req: NextRequest) => {
    try {
      // 1. Parse and validate query params
      const url = new URL(req.url);
      const query = parseQuery(OffersQuerySchema, url);

      // 2. Get user ID (from session/auth in production)
      const userId = req.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001';

      // 3. Build filter conditions
      const now = new Date();
      const expiringThreshold = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48h from now

      // Base query conditions
      const whereConditions: any = {
        userId,
        offer: {
          endAt: {
            gte: now, // Exclude expired offers
          },
        },
      };

      // Apply filter
      if (query.filter === 'new') {
        whereConditions.status = 'new';
      } else if (query.filter === 'expiring') {
        whereConditions.offer = {
          ...whereConditions.offer,
          endAt: {
            gte: now,
            lte: expiringThreshold,
          },
        };
      }

      // Apply cursor for pagination
      if (query.cursor) {
        whereConditions.offerId = {
          lt: query.cursor, // Keyset pagination using UUID
        };
      }

      // 4. Fetch offers from inbox
      const inboxItems = await db.offerInbox.findMany({
        where: whereConditions,
        include: {
          offer: {
            include: {
              place: true,
            },
          },
        },
        orderBy: [
          { status: 'asc' }, // 'new' first, then 'dismissed'
          { createdAt: 'desc' }, // Recent first within same status
        ],
        take: query.limit + 1, // Fetch one extra to determine next cursor
      });

      // 5. Calculate distance if lat/lng provided
      let itemsWithDistance = inboxItems;
      
      if (query.lat !== undefined && query.lng !== undefined) {
        // Use PostGIS for distance calculation
        const itemsWithDistanceRaw = await db.$queryRaw<Array<{ offer_id: string; distance_m: number }>>`
          SELECT 
            o.id as offer_id,
            ST_Distance(
              p.geom::geography,
              ST_SetSRID(ST_MakePoint(${query.lng}, ${query.lat}), 4326)::geography
            ) as distance_m
          FROM offer o
          INNER JOIN place p ON o.place_id = p.id
          WHERE o.id = ANY(${inboxItems.map(i => i.offerId)})
        `;

        // Create distance map
        const distanceMap = new Map(
          itemsWithDistanceRaw.map(d => [d.offer_id, Math.round(d.distance_m)])
        );

        // Merge distance into items
        itemsWithDistance = inboxItems.map(item => ({
          ...item,
          distance_m: distanceMap.get(item.offerId),
        }));
      }

      // 6. Determine pagination
      const hasMore = itemsWithDistance.length > query.limit;
      const items = hasMore ? itemsWithDistance.slice(0, query.limit) : itemsWithDistance;
      const nextCursor = hasMore ? items[items.length - 1].offerId : undefined;

      // 7. Transform to response format
      const offerCards: OfferCard[] = items.map(item => {
        const badges: string[] = [];
        
        // Add 'new' badge
        if (item.status === 'new') {
          badges.push('new');
        }
        
        // Add 'expiring' badge if within 48h
        if (item.offer.endAt <= expiringThreshold) {
          badges.push('expiring');
        }

        return {
          id: item.offerId,
          brand: item.offer.place.name,
          title: item.offer.title,
          benefit: item.offer.benefit || '',
          expire_at: item.offer.endAt.toISOString(),
          badges,
          distance_m: (item as any).distance_m,
        };
      });

      // 8. Build response
      const response: OffersListResponse = {
        items: offerCards,
        ...(nextCursor && { nextCursor }),
      };

      return Response.json(response, {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=30', // 30s cache
        },
      });

    } catch (error: any) {
      // Handle known errors
      if (error instanceof Response) {
        return error;
      }

      console.error('[GET /api/offers] Error:', error);
      return apiError('server_error', 'Failed to fetch offers', 500);
    }
  }
);
