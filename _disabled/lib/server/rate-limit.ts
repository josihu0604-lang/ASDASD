import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiter (프로덕션에서는 Redis 사용)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  key: string;      // 'offer-accept', 'qr-verify' 등
  limit: number;    // 요청 수
  windowSec: number; // 시간 창 (초)
}

export function withRateLimit(config: RateLimitConfig) {
  return (handler: Function) => {
    return async (req: NextRequest, context: any) => {
      // 사용자 식별 (실제로는 세션/토큰에서)
      const userId = req.headers.get('x-user-id') || 'anonymous';
      const key = `${config.key}:${userId}`;
      
      const now = Date.now();
      const entry = rateLimitMap.get(key);
      
      if (!entry || now > entry.resetAt) {
        // 새 윈도우 시작
        rateLimitMap.set(key, {
          count: 1,
          resetAt: now + config.windowSec * 1000,
        });
      } else if (entry.count >= config.limit) {
        // Rate limit 초과
        return NextResponse.json(
          {
            error: {
              code: 'rate_limit_exceeded',
              message: `Too many requests. Limit: ${config.limit}/${config.windowSec}s`,
            },
          },
          { status: 429 }
        );
      } else {
        // 카운트 증가
        entry.count++;
      }
      
      return handler(req, context);
    };
  };
}

// Cleanup 주기적 실행 (메모리 누수 방지)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, 60000); // 1분마다
}
