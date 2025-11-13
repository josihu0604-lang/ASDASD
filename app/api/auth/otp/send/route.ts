import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { createRequestId, logRequest } from '@/lib/server/logger';
import { checkRateLimit } from '@/lib/server/rate-limit';

const prisma = new PrismaClient();

const OTPSendBodySchema = z.object({
  phone: z.string().regex(/^[0-9]{10,11}$/, '유효한 휴대폰 번호를 입력해주세요 (숫자만)'),
});

export async function POST(request: NextRequest) {
  const requestId = createRequestId();
  const startTime = Date.now();

  try {
    // Rate limiting: 3 requests per minute per phone
    const body = await request.json();
    const { phone } = OTPSendBodySchema.parse(body);
    const rateLimitKey = `otp-send:${phone}`;
    
    if (!checkRateLimit(rateLimitKey, 3, 60000)) {
      logRequest({
        route: '/api/auth/otp/send',
        method: 'POST',
        status: 429,
        took_ms: Date.now() - startTime,
        request_id: requestId,
        error_code: 'RATE_LIMIT_EXCEEDED',
      });

      return NextResponse.json(
        { error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Find or create user
    let user = await prisma.user.findUnique({ where: { phone } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          nickname: `사용자${phone.slice(-4)}`,
          role: 'CREATOR',
        },
      });
    }

    // Create OTP record
    await prisma.otpCode.create({
      data: {
        userId: user.id,
        phone,
        code,
        expiresAt,
      },
    });

    // TODO: Send SMS via SENS or Twilio
    console.log(`[OTP] ${phone}: ${code}`);

    logRequest({
      route: '/api/auth/otp/send',
      method: 'POST',
      status: 200,
      took_ms: Date.now() - startTime,
      request_id: requestId,
      user_id: user.id,
    });

    return NextResponse.json({
      message: '인증 코드를 전송했습니다.',
      ...(process.env.NODE_ENV === 'development' && { devCode: code }),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 입력입니다', details: error.errors },
        { status: 400 }
      );
    }

    logRequest({
      route: '/api/auth/otp/send',
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
