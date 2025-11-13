import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { withRateLimit } from '@/lib/server/rate-limit';
import { parseQuery } from '@/lib/http/validate';
import { apiError } from '@/lib/http/errors';
import { PlacesNearbyQuerySchema } from '@/lib/schemas/api';
import type { PlacesNearbyResponse, PlacePin } from '@/lib/types/api';
import geohash from 'ngeohash';

/**
 * GET /api/places/nearby
 * 
 * Fetch nearby places within radius using PostGIS spatial query
 * 
 * Query params:
 *   - geohash5: 5-character geohash (required)
 *   - radius: meters (100-5000, default: 500)
 *   - limit: 1-50 (default: 20)
 * 
 * Rate limit: 60 RPM per user
 * 
 * Response:
 *   200: { pins: PlacePin[] }
 *   400: Invalid parameters
 *   429: Rate limit exceeded
 */
export const GET = withRateLimit({ key: 'places-nearby', limit: 60, windowSec: 60 })(
  async (req: NextRequest) => {
    try {
      // 1. Parse and validate query params
      const url = new URL(req.url);
      const query = parseQuery(PlacesNearbyQuerySchema, url);

      // 2. Decode geohash5 to center point
      const { latitude, longitude } = geohash.decode(query.geohash5);

      // 3. Query places using PostGIS ST_DWithin
      // Note: geography type automatically uses meters
      const places = await db.$queryRaw<
        Array<{
          id: string;
          name: string;
          category: string;
          lat: number;
          lng: number;
          has_offer: boolean;
          distance_m: number;
        }>
      >`
        SELECT 
          p.id,
          p.name,
          p.category,
          ST_Y(p.geom::geometry) as lat,
          ST_X(p.geom::geometry) as lng,
          EXISTS(
            SELECT 1 FROM offer o 
            WHERE o.place_id = p.id 
              AND o.end_at > NOW()
          ) as has_offer,
          ST_Distance(
            p.geom::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
          ) as distance_m
        FROM place p
        WHERE ST_DWithin(
          p.geom::geography,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
          ${query.radius}
        )
        ORDER BY distance_m ASC
        LIMIT ${Math.min(query.limit, 200)}
      `;

      // 4. Transform to response format
      const pins: PlacePin[] = places.map(place => ({
        id: place.id,
        lat: Number(place.lat),
        lng: Number(place.lng),
        has_offer: Boolean(place.has_offer),
        name: place.name,
        category: place.category,
      }));

      // 5. Build response
      const response: PlacesNearbyResponse = {
        pins,
      };

      return Response.json(response, {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=60', // 1min cache - places don't change frequently
        },
      });

    } catch (error: any) {
      // Handle known errors
      if (error instanceof Response) {
        return error;
      }

      console.error('[GET /api/places/nearby] Error:', error);
      return apiError('server_error', 'Failed to fetch nearby places', 500);
    }
  }
);
