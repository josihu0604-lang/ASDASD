// ZZIK LIVE - Vouchers API
// User vouchers with expiry sorting
// Performance Target: p95 ≤ 100ms

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status'); // ACTIVE, REDEEMED, EXPIRED
    const limit = parseInt(searchParams.get('limit') || '20', 10);
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

    // Fetch vouchers
    // Sort: Expiring soon first (for ACTIVE), then by created date
    const [vouchers, total] = await Promise.all([
      prisma.voucher.findMany({
        where,
        orderBy: [
          { expiresAt: 'asc' }, // Expiring soon first
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
        select: {
          id: true,
          title: true,
          description: true,
          value: true,
          imageUrl: true,
          status: true,
          expiresAt: true,
          redeemedAt: true,
          createdAt: true,
        },
      }),
      prisma.voucher.count({ where }),
    ]);

    // Add expiry warning flag (≤7 days)
    const now = new Date();
    const vouchersWithWarning = vouchers.map(v => ({
      ...v,
      expiringWarn: v.status === 'ACTIVE' && 
                    new Date(v.expiresAt).getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000,
    }));

    const duration = Date.now() - startTime;

    return NextResponse.json({
      data: vouchersWithWarning,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + vouchers.length < total,
        duration_ms: duration,
      },
    });
  } catch (error) {
    console.error('Vouchers API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch vouchers', 
        code: 'VOUCHERS_FETCH_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Redeem voucher (idempotent)
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { voucherId, userId } = body;

    if (!voucherId || !userId) {
      return NextResponse.json(
        { error: 'voucherId and userId are required', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    // Find voucher
    const voucher = await prisma.voucher.findUnique({
      where: { id: voucherId },
    });

    if (!voucher) {
      return NextResponse.json(
        { error: 'Voucher not found', code: 'VOUCHER_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (voucher.userId !== userId) {
      return NextResponse.json(
        { error: 'Voucher belongs to different user', code: 'UNAUTHORIZED' },
        { status: 403 }
      );
    }

    if (voucher.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Voucher is not active', code: 'VOUCHER_NOT_ACTIVE', status: voucher.status },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date(voucher.expiresAt) < new Date()) {
      // Mark as expired
      await prisma.voucher.update({
        where: { id: voucherId },
        data: { status: 'EXPIRED' },
      });

      return NextResponse.json(
        { error: 'Voucher has expired', code: 'VOUCHER_EXPIRED' },
        { status: 400 }
      );
    }

    // Redeem voucher (transaction)
    await prisma.$transaction(async (tx) => {
      // Mark voucher as redeemed
      await tx.voucher.update({
        where: { id: voucherId },
        data: {
          status: 'REDEEMED',
          redeemedAt: new Date(),
        },
      });

      // Deduct from wallet
      const latestEntry = await tx.walletEntry.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { balanceAfter: true },
      });

      const currentBalance = latestEntry?.balanceAfter ?? 0;
      const newBalance = currentBalance - voucher.value;

      await tx.walletEntry.create({
        data: {
          userId,
          type: 'REDEEM',
          amount: -voucher.value,
          reason: `Redeemed: ${voucher.title}`,
          balanceAfter: newBalance,
        },
      });
    });

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: 'Voucher redeemed successfully',
      voucher: {
        id: voucher.id,
        title: voucher.title,
        value: voucher.value,
      },
      meta: {
        duration_ms: duration,
      },
    });
  } catch (error) {
    console.error('Voucher redeem error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to redeem voucher', 
        code: 'VOUCHER_REDEEM_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
