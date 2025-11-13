import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit, incrementRateLimit } from '@/lib/server/rate-limit';

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear rate limit map before each test
    // Note: In real implementation, we'd need to expose a clear method
    vi.useFakeTimers();
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const key = 'test-key-1';
      
      expect(checkRateLimit(key, 10, 60)).toBe(true);
      incrementRateLimit(key, 60);
      
      expect(checkRateLimit(key, 10, 60)).toBe(true);
      incrementRateLimit(key, 60);
      
      expect(checkRateLimit(key, 10, 60)).toBe(true);
    });

    it('should block requests after limit exceeded', () => {
      const key = 'test-key-2';
      const limit = 3;
      
      // Use up the limit
      for (let i = 0; i < limit; i++) {
        incrementRateLimit(key, 60);
      }
      
      // Should be blocked now
      expect(checkRateLimit(key, limit, 60)).toBe(false);
    });

    it('should reset after window expires', () => {
      const key = 'test-key-3';
      const windowSec = 60;
      
      // Use up the limit
      incrementRateLimit(key, windowSec);
      incrementRateLimit(key, windowSec);
      incrementRateLimit(key, windowSec);
      
      expect(checkRateLimit(key, 3, windowSec)).toBe(false);
      
      // Fast-forward time past the window
      vi.advanceTimersByTime((windowSec + 1) * 1000);
      
      // Should be allowed again
      expect(checkRateLimit(key, 3, windowSec)).toBe(true);
    });
  });

  describe('incrementRateLimit', () => {
    it('should create new entry for first request', () => {
      const key = 'test-key-4';
      
      expect(() => incrementRateLimit(key, 60)).not.toThrow();
      expect(checkRateLimit(key, 10, 60)).toBe(true);
    });

    it('should increment counter for subsequent requests', () => {
      const key = 'test-key-5';
      const limit = 5;
      
      for (let i = 0; i < limit; i++) {
        incrementRateLimit(key, 60);
        if (i < limit - 1) {
          expect(checkRateLimit(key, limit, 60)).toBe(true);
        }
      }
      
      // After limit reached
      expect(checkRateLimit(key, limit, 60)).toBe(false);
    });
  });

  describe('User-scoped rate limiting', () => {
    it('should isolate limits per user', () => {
      const user1Key = 'offers:user1';
      const user2Key = 'offers:user2';
      const limit = 3;
      
      // User 1 uses up their limit
      for (let i = 0; i < limit; i++) {
        incrementRateLimit(user1Key, 60);
      }
      
      expect(checkRateLimit(user1Key, limit, 60)).toBe(false);
      
      // User 2 should still have full limit
      expect(checkRateLimit(user2Key, limit, 60)).toBe(true);
    });
  });

  describe('Different rate limit configs', () => {
    it('should respect different limits per endpoint', () => {
      const userId = 'user-123';
      
      // Offers: 60 RPM
      const offersKey = `offers:${userId}`;
      for (let i = 0; i < 60; i++) {
        incrementRateLimit(offersKey, 60);
      }
      expect(checkRateLimit(offersKey, 60, 60)).toBe(false);
      
      // QR Verify: 30 RPM (independent limit)
      const qrKey = `qr-verify:${userId}`;
      expect(checkRateLimit(qrKey, 30, 60)).toBe(true);
    });
  });
});
