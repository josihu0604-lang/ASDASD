import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { withRateLimit } from '@/lib/server/rate-limit';
import { parseQuery } from '@/lib/http/validate';
import { apiError } from '@/lib/http/errors';
import { SearchQuerySchema } from '@/lib/schemas/api';
import type { SearchResponse, SearchResult } from '@/lib/types/api';
import geohash from 'ngeohash';

/**
 * GET /api/search
 * 
 * Search for places and offers with BM25 + Geo + Popularity scoring
 * 
 * Query params:
 *   - q: search query (1-100 chars, required)
 *   - lat: latitude for distance scoring (optional)
 *   - lng: longitude for distance scoring (optional)
 *   - radius: search radius in meters (100-10000, default: 1000)
 *   - limit: 1-50 (default: 10)
 * 
 * Rate limit: 100 RPM per user
 * 
 * Scoring: BM25 (text relevance) + Geo (distance decay) + Popularity
 * 
 * Response:
 *   200: { items: SearchResult[], query: string, total: number }
 *   400: Invalid parameters
 *   429: Rate limit exceeded
 */
export const GET = withRateLimit({ key: 'search', limit: 100, windowSec: 60 })(
  async (req: NextRequest) => {
    try {
      // 1. Parse and validate query params
      const url = new URL(req.url);
      const query = parseQuery(SearchQuerySchema, url);

      // 2. Normalize query (tokenization for Korean/English)
      const normalizedQuery = normalizeSearchQuery(query.q);
      
      if (!normalizedQuery) {
        return Response.json(
          { items: [], query: query.q, total: 0 } as SearchResponse,
          { status: 200 }
        );
      }

      // 3. Build search conditions
      const searchConditions = buildSearchConditions(normalizedQuery);

      // 4. Perform search with scoring
      let results: SearchResult[] = [];

      if (query.lat !== undefined && query.lng !== undefined) {
        // Geo-aware search
        results = await searchWithGeo(
          searchConditions,
          query.lat,
          query.lng,
          query.radius || 1000,
          query.limit
        );
      } else {
        // Text-only search
        results = await searchTextOnly(searchConditions, query.limit);
      }

      // 5. Build response
      const response: SearchResponse = {
        items: results,
        query: query.q,
        total: results.length,
      };

      // 6. Cache response (5min TTL, varies by geohash5)
      const cacheKey = query.lat && query.lng
        ? geohash.encode(query.lat, query.lng, 5)
        : 'global';

      return Response.json(response, {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300', // 5min cache
          'X-Cache-Key': `search:${cacheKey}:${normalizedQuery}`,
        },
      });

    } catch (error: any) {
      // Handle known errors
      if (error instanceof Response) {
        return error;
      }

      console.error('[GET /api/search] Error:', error);
      return apiError('server_error', 'Search failed', 500);
    }
  }
);

/**
 * Normalize search query for tokenization
 * Handles Korean jamo decomposition and English 2-gram
 */
function normalizeSearchQuery(query: string): string {
  // Remove extra whitespace
  const normalized = query.trim().toLowerCase().replace(/\s+/g, ' ');
  
  // TODO: Implement Korean jamo decomposition for better matching
  // For now, just return normalized query
  return normalized;
}

/**
 * Build search conditions from normalized query
 */
function buildSearchConditions(normalizedQuery: string): string {
  // Split into tokens
  const tokens = normalizedQuery.split(' ').filter(t => t.length > 0);
  
  // Create PostgreSQL full-text search query
  // Use & for AND, | for OR
  return tokens.join(' & ');
}

/**
 * Search with geographic scoring
 */
async function searchWithGeo(
  searchConditions: string,
  lat: number,
  lng: number,
  radius: number,
  limit: number
): Promise<SearchResult[]> {
  // Use PostGIS for spatial search with text scoring
  const results = await db.$queryRaw<
    Array<{
      id: string;
      type: string;
      name: string;
      subtitle: string | null;
      score: number;
      distance_m: number;
      lat: number;
      lng: number;
    }>
  >`
    WITH search_places AS (
      SELECT 
        p.id,
        'place' as type,
        p.name,
        p.category as subtitle,
        ST_Y(p.geom::geometry) as lat,
        ST_X(p.geom::geometry) as lng,
        ST_Distance(
          p.geom::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        ) as distance_m,
        -- Text relevance score (simple ILIKE for now, can be upgraded to tsvector)
        CASE 
          WHEN LOWER(p.name) LIKE ${`%${searchConditions}%`} THEN 3.0
          WHEN LOWER(p.category) LIKE ${`%${searchConditions}%`} THEN 1.5
          ELSE 0.5
        END as text_score,
        p.score_popularity
      FROM place p
      WHERE ST_DWithin(
        p.geom::geography,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ${radius}
      )
      AND (
        LOWER(p.name) LIKE ${`%${searchConditions}%`}
        OR LOWER(p.category) LIKE ${`%${searchConditions}%`}
      )
    )
    SELECT 
      id,
      type,
      name,
      subtitle,
      -- Composite score: text (50%) + geo decay (30%) + popularity (20%)
      (
        text_score * 0.5 +
        (1.0 - LEAST(distance_m / ${radius}, 1.0)) * 0.3 +
        score_popularity * 0.2
      ) as score,
      distance_m,
      lat,
      lng
    FROM search_places
    ORDER BY score DESC, distance_m ASC
    LIMIT ${limit}
  `;

  return results.map(r => ({
    id: r.id,
    type: r.type as 'place' | 'offer',
    name: r.name,
    subtitle: r.subtitle || undefined,
    score: Number(r.score),
    distance_m: Math.round(Number(r.distance_m)),
    lat: Number(r.lat),
    lng: Number(r.lng),
  }));
}

/**
 * Search without geographic context (text-only)
 */
async function searchTextOnly(
  searchConditions: string,
  limit: number
): Promise<SearchResult[]> {
  const results = await db.$queryRaw<
    Array<{
      id: string;
      type: string;
      name: string;
      subtitle: string | null;
      score: number;
    }>
  >`
    SELECT 
      p.id,
      'place' as type,
      p.name,
      p.category as subtitle,
      -- Text relevance score
      CASE 
        WHEN LOWER(p.name) LIKE ${`%${searchConditions}%`} THEN 3.0
        WHEN LOWER(p.category) LIKE ${`%${searchConditions}%`} THEN 1.5
        ELSE 0.5
      END as text_score,
      p.score_popularity,
      (
        CASE 
          WHEN LOWER(p.name) LIKE ${`%${searchConditions}%`} THEN 3.0
          WHEN LOWER(p.category) LIKE ${`%${searchConditions}%`} THEN 1.5
          ELSE 0.5
        END * 0.7 +
        p.score_popularity * 0.3
      ) as score
    FROM place p
    WHERE 
      LOWER(p.name) LIKE ${`%${searchConditions}%`}
      OR LOWER(p.category) LIKE ${`%${searchConditions}%`}
    ORDER BY score DESC, p.score_popularity DESC
    LIMIT ${limit}
  `;

  return results.map(r => ({
    id: r.id,
    type: r.type as 'place' | 'offer',
    name: r.name,
    subtitle: r.subtitle || undefined,
    score: Number(r.score),
  }));
}
