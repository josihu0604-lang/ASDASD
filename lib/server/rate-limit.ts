import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '../http/errors';

// In-memory rate limiter (프로덕션에서는 Redis 사용)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  key: string;      // 'offer-accept', 'qr-verify', 'offers-list' 등
  limit: number;    // 요청 수 (RPM - Requests Per Minute)
  windowSec: number; // 시간 창 (초)
}

/**
 * Rate limiting middleware with sliding window
 * 
 * @param config - Rate limit configuration
 * @returns Middleware function
 */
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
        const resetInSec = Math.ceil((entry.resetAt - now) / 1000);
        return apiError(
          'rate_limited',
          `Too many requests. Limit: ${config.limit}/${config.windowSec}s. Reset in ${resetInSec}s`,
          429
        );
      } else {
        // 카운트 증가
        entry.count++;
      }
      
      return handler(req, context);
    };
  };
}

/**
 * Check rate limit without incrementing (for idempotent operations)
 */
export function checkRateLimit(key: string, limit: number, windowSec: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  
  if (!entry || now > entry.resetAt) {
    return true; // Allow
  }
  
  return entry.count < limit;
}

/**
 * Increment rate limit counter manually
 */
export function incrementRateLimit(key: string, windowSec: number): void {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + windowSec * 1000,
    });
  } else {
    entry.count++;
  }
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
