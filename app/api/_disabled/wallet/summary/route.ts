// ZZIK LIVE - Wallet Summary API
// User wallet balance and recent transactions
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

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    // Get latest balance
    const latestEntry = await prisma.walletEntry.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { balanceAfter: true },
    });

    const balance = latestEntry?.balanceAfter ?? 0;

    // Get recent transactions
    const recentTransactions = await prisma.walletEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        amount: true,
        reason: true,
        balanceAfter: true,
        createdAt: true,
      },
    });

    // Get stats
    const stats = await prisma.walletEntry.groupBy({
      by: ['type'],
      where: { userId },
      _sum: {
        amount: true,
      },
    });

    const totalEarned = stats.find(s => s.type === 'REWARD')?._sum.amount ?? 0;
    const totalSpent = Math.abs(stats.find(s => s.type === 'REDEEM')?._sum.amount ?? 0);

    const duration = Date.now() - startTime;

    return NextResponse.json({
      data: {
        balance,
        totalEarned,
        totalSpent,
        recentTransactions,
      },
      meta: {
        duration_ms: duration,
      },
    });
  } catch (error) {
    console.error('Wallet summary error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch wallet summary', 
        code: 'WALLET_SUMMARY_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
