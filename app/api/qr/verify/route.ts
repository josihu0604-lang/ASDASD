// ZZIK LIVE - QR Verification API
// Triple verification: GPS + QR + Receipt
// Performance Target: p95 ≤ 800ms (including GPS check)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 4-state QR scan results
enum QrScanResult {
  SUCCESS = 'SUCCESS',
  ALREADY_USED = 'ALREADY_USED',
  EXPIRED = 'EXPIRED',
  INVALID = 'INVALID',
}

interface VerifyRequest {
  code: string;
  userId: string;
  lat: number;
  lng: number;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: VerifyRequest = await request.json();
    const { code, userId, lat, lng } = body;

    // Validation
    if (!code || !userId || isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Missing required fields', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    // Find QR code
    const qrCode = await prisma.qrCode.findUnique({
      where: { code },
      include: {
        place: true,
      },
    });

    if (!qrCode) {
      await logScan(userId, null, QrScanResult.INVALID, lat, lng);
      
      return NextResponse.json({
        result: QrScanResult.INVALID,
        message: 'QR code not found',
        duration_ms: Date.now() - startTime,
      });
    }

    // Check if expired
    if (qrCode.expiresAt && new Date(qrCode.expiresAt) < new Date()) {
      await logScan(userId, qrCode.id, QrScanResult.EXPIRED, lat, lng);
      
      return NextResponse.json({
        result: QrScanResult.EXPIRED,
        message: 'QR code has expired',
        duration_ms: Date.now() - startTime,
      });
    }

    // Check if already used by this user
    const existingScan = await prisma.qrScan.findFirst({
      where: {
        qrCodeId: qrCode.id,
        userId,
        result: QrScanResult.SUCCESS,
      },
    });

    if (existingScan) {
      await logScan(userId, qrCode.id, QrScanResult.ALREADY_USED, lat, lng);
      
      return NextResponse.json({
        result: QrScanResult.ALREADY_USED,
        message: 'QR code already scanned by this user',
        duration_ms: Date.now() - startTime,
      });
    }

    // GPS proximity check (≤50m)
    const distance = await checkProximity(qrCode.place.id, lat, lng);
    
    if (distance === null || distance > 50) {
      return NextResponse.json({
        result: QrScanResult.INVALID,
        message: 'Not within required proximity (≤50m)',
        distance_m: distance,
        duration_ms: Date.now() - startTime,
      }, { status: 403 });
    }

    // SUCCESS - Log scan
    await logScan(userId, qrCode.id, QrScanResult.SUCCESS, lat, lng, distance);

    // Update offer status to IN_PROGRESS
    await prisma.offer.updateMany({
      where: {
        placeId: qrCode.placeId,
        userId,
        status: 'PENDING',
      },
      data: {
        status: 'IN_PROGRESS',
        qrScannedAt: new Date(),
      },
    });

    return NextResponse.json({
      result: QrScanResult.SUCCESS,
      message: 'QR code verified successfully',
      place: {
        id: qrCode.place.id,
        name: qrCode.place.name,
      },
      distance_m: distance,
      duration_ms: Date.now() - startTime,
    });
  } catch (error) {
    console.error('QR verify error:', error);
    
    return NextResponse.json(
      { 
        error: 'QR verification failed', 
        code: 'QR_VERIFY_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper: Check GPS proximity using PostGIS
async function checkProximity(placeId: string, lat: number, lng: number): Promise<number | null> {
  try {
    const result = await prisma.$queryRawUnsafe<any[]>(`
      SELECT ST_Distance(
        location,
        ST_GeogFromText('POINT(${lng} ${lat})')
      ) as distance
      FROM places
      WHERE id = '${placeId}'
    `);

    return result[0]?.distance ?? null;
  } catch (error) {
    console.error('Proximity check error:', error);
    return null;
  }
}

// Helper: Log QR scan result
async function logScan(
  userId: string,
  qrCodeId: string | null,
  result: QrScanResult,
  lat: number,
  lng: number,
  distance?: number
) {
  try {
    // Convert to geohash5 for privacy
    const geohash5 = 'wydm6'; // TODO: Implement geohash encoding

    if (!qrCodeId) {
      // Invalid QR - just log in analytics
      return;
    }

    await prisma.qrScan.create({
      data: {
        qrCodeId,
        userId,
        result,
        distance: distance ? Math.round(distance) : null,
        geohash5,
      },
    });
  } catch (error) {
    console.error('Log scan error:', error);
  }
}
