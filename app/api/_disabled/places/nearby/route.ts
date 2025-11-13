// ZZIK LIVE - Places Nearby API
// GPS + PostGIS-based proximity search
// Performance Target: p95 ≤ 100ms

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface NearbyParams {
  lat: number;
  lng: number;
  radius: number; // meters
  limit?: number;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const radius = parseInt(searchParams.get('radius') || '1000', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Validation
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Invalid coordinates', code: 'INVALID_COORDS' },
        { status: 400 }
      );
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Coordinates out of range', code: 'COORDS_OUT_OF_RANGE' },
        { status: 400 }
      );
    }

    if (radius < 100 || radius > 10000) {
      return NextResponse.json(
        { error: 'Radius must be between 100m and 10km', code: 'INVALID_RADIUS' },
        { status: 400 }
      );
    }

    // PostGIS query with ST_DWithin for performance
    // NOTE: Prisma doesn't support PostGIS natively, using raw SQL
    const places = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        id,
        name,
        address,
        category,
        phone,
        business_hour as "businessHour",
        image_url as "imageUrl",
        geohash6,
        ST_Distance(location, ST_GeogFromText('POINT(${lng} ${lat})')) as distance
      FROM places
      WHERE 
        is_active = true
        AND ST_DWithin(
          location,
          ST_GeogFromText('POINT(${lng} ${lat})'),
          ${radius}
        )
      ORDER BY distance ASC
      LIMIT ${limit}
    `);

    const duration = Date.now() - startTime;

    return NextResponse.json({
      data: places,
      meta: {
        count: places.length,
        radius,
        center: { lat, lng },
        duration_ms: duration,
      },
    });
  } catch (error) {
    console.error('Places nearby error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch nearby places', 
        code: 'NEARBY_SEARCH_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
