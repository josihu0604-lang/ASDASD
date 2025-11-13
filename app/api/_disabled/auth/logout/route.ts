import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createRequestId, logRequest } from '@/lib/server/logger';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const requestId = createRequestId();
  const startTime = Date.now();

  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: '인증 토큰이 필요합니다' },
        { status: 401 }
      );
    }

    // Find and delete session
    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (session) {
      await prisma.session.delete({
        where: { id: session.id },
      });

      logRequest({
        route: '/api/auth/logout',
        method: 'POST',
        status: 200,
        took_ms: Date.now() - startTime,
        request_id: requestId,
        user_id: session.userId,
      });
    }

    return NextResponse.json({
      message: '로그아웃되었습니다',
    });

  } catch (error) {
    logRequest({
      route: '/api/auth/logout',
      method: 'POST',
      status: 500,
      took_ms: Date.now() - startTime,
      request_id: requestId,
      error_code: 'INTERNAL_ERROR',
    });

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
