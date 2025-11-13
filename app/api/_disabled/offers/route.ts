// ZZIK LIVE - Offers API
// User-specific offers with status filtering
// Performance Target: p95 ≤ 150ms

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status'); // PENDING, IN_PROGRESS, COMPLETED, etc.
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {
      userId,
    };

    if (status) {
      where.status = status;
    }

    // Fetch offers with place info
    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        include: {
          place: {
            select: {
              id: true,
              name: true,
              address: true,
              category: true,
              imageUrl: true,
              geohash6: true,
            },
          },
        },
        orderBy: [
          { expiresAt: 'asc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.offer.count({ where }),
    ]);

    const duration = Date.now() - startTime;

    return NextResponse.json({
      data: offers,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + offers.length < total,
        duration_ms: duration,
      },
    });
  } catch (error) {
    console.error('Offers API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch offers', 
        code: 'OFFERS_FETCH_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
