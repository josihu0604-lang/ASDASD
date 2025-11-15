import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { createRequestId, logRequest } from '@/lib/server/logger';

const prisma = new PrismaClient();

const OTPVerifyBodySchema = z.object({
  phone: z.string().regex(/^[0-9]{10,11}$/),
  code: z.string().regex(/^[0-9]{6}$/, '6자리 인증 코드를 입력해주세요'),
});

export async function POST(request: NextRequest) {
  const requestId = createRequestId();
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { phone, code } = OTPVerifyBodySchema.parse(body);

    // Find the latest unused OTP for this phone
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        phone,
        code,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });

    if (!otpRecord) {
      logRequest({
        route: '/api/auth/otp/verify',
        method: 'POST',
        status: 400,
        took_ms: Date.now() - startTime,
        request_id: requestId,
        error_code: 'INVALID_OTP',
      });

      return NextResponse.json(
        { error: '잘못된 인증 코드이거나 만료되었습니다' },
        { status: 400 }
      );
    }

    // Check attempts limit
    if (otpRecord.attempts >= 5) {
      return NextResponse.json(
        { error: '인증 시도 횟수를 초과했습니다. 새로운 코드를 요청해주세요.' },
        { status: 429 }
      );
    }

    // Mark OTP as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { usedAt: new Date() },
    });

    // Create session token
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.session.create({
      data: {
        userId: otpRecord.userId!,
        token,
        expiresAt,
      },
    });

    logRequest({
      route: '/api/auth/otp/verify',
      method: 'POST',
      status: 200,
      took_ms: Date.now() - startTime,
      request_id: requestId,
      user_id: otpRecord.userId!,
    });

    return NextResponse.json({
      token,
      user: {
        id: otpRecord.user?.id,
        nickname: otpRecord.user?.nickname,
        phone: otpRecord.user?.phone,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 입력입니다', details: error.errors },
        { status: 400 }
      );
    }

    logRequest({
      route: '/api/auth/otp/verify',
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

function generateSessionToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
