import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { createRequestId, logRequest } from '@/lib/server/logger';
import { checkRateLimit } from '@/lib/server/rate-limit';

const prisma = new PrismaClient();

const MagicLinkBodySchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요'),
  redirectTo: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  const requestId = createRequestId();
  const startTime = Date.now();

  try {
    // Rate limiting: 5 requests per minute per email
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `magic-link:${clientIp}`;
    
    if (!checkRateLimit(rateLimitKey, 5, 60000)) {
      logRequest({
        route: '/api/auth/magic-link',
        method: 'POST',
        status: 429,
        took_ms: Date.now() - startTime,
        request_id: requestId,
        error_code: 'RATE_LIMIT_EXCEEDED',
      });

      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Date.now() + 60000),
          }
        }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const { email, redirectTo } = MagicLinkBodySchema.parse(body);

    // Generate magic link token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          nickname: email.split('@')[0], // Default nickname
          role: 'CREATOR',
        },
      });
    }

    // Create magic link record
    await prisma.magicLink.create({
      data: {
        userId: user.id,
        email,
        token,
        expiresAt,
      },
    });

    // TODO: Send email via Supabase Auth or Resend
    // For now, just log (in real implementation, send actual email)
    const magicLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify?token=${token}&redirect=${redirectTo || '/pass'}`;
    
    console.log(`[Magic Link] ${email}: ${magicLinkUrl}`);

    logRequest({
      route: '/api/auth/magic-link',
      method: 'POST',
      status: 200,
      took_ms: Date.now() - startTime,
      request_id: requestId,
      user_id: user.id,
    });

    return NextResponse.json({
      message: '로그인 링크를 이메일로 전송했습니다. 이메일을 확인해주세요.',
      // In dev mode, return the link
      ...(process.env.NODE_ENV === 'development' && { devLink: magicLinkUrl }),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logRequest({
        route: '/api/auth/magic-link',
        method: 'POST',
        status: 400,
        took_ms: Date.now() - startTime,
        request_id: requestId,
        error_code: 'VALIDATION_ERROR',
      });

      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    logRequest({
      route: '/api/auth/magic-link',
      method: 'POST',
      status: 500,
      took_ms: Date.now() - startTime,
      request_id: requestId,
      error_code: 'INTERNAL_ERROR',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateToken(): string {
  // Generate a secure random token
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const length = 32;
  
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return token;
}
