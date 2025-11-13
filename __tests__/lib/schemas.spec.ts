import { describe, it, expect } from 'vitest';
import {
  OffersQuerySchema,
  WalletVouchersQuerySchema,
  WalletLedgerQuerySchema,
  QRVerifyBodySchema,
  PlacesNearbyQuerySchema,
  SearchQuerySchema,
} from '@/lib/schemas/api';

describe('API Schema Validation', () => {
  describe('OffersQuerySchema', () => {
    it('should accept valid filter values', () => {
      expect(() => OffersQuerySchema.parse({ filter: 'all' })).not.toThrow();
      expect(() => OffersQuerySchema.parse({ filter: 'new' })).not.toThrow();
      expect(() => OffersQuerySchema.parse({ filter: 'expiring' })).not.toThrow();
    });

    it('should reject invalid filter values', () => {
      expect(() => OffersQuerySchema.parse({ filter: 'invalid' })).toThrow();
    });

    it('should enforce limit boundaries', () => {
      expect(() => OffersQuerySchema.parse({ limit: 0 })).toThrow();
      expect(() => OffersQuerySchema.parse({ limit: 51 })).toThrow();
      expect(() => OffersQuerySchema.parse({ limit: 25 })).not.toThrow();
    });

    it('should accept valid lat/lng coordinates', () => {
      const result = OffersQuerySchema.parse({ lat: 37.5665, lng: 126.978 });
      expect(result.lat).toBe(37.5665);
      expect(result.lng).toBe(126.978);
    });

    it('should reject out-of-range coordinates', () => {
      expect(() => OffersQuerySchema.parse({ lat: 91, lng: 0 })).toThrow();
      expect(() => OffersQuerySchema.parse({ lat: 0, lng: 181 })).toThrow();
    });

    it('should apply default values', () => {
      const result = OffersQuerySchema.parse({});
      expect(result.filter).toBe('all');
      expect(result.limit).toBe(20);
    });
  });

  describe('QRVerifyBodySchema', () => {
    it('should accept token with valid length', () => {
      const token = 'a'.repeat(24);
      expect(() => QRVerifyBodySchema.parse({ token })).not.toThrow();
    });

    it('should reject token that is too short', () => {
      const token = 'a'.repeat(23);
      expect(() => QRVerifyBodySchema.parse({ token })).toThrow();
    });

    it('should reject token that is too long', () => {
      const token = 'a'.repeat(257);
      expect(() => QRVerifyBodySchema.parse({ token })).toThrow();
    });

    it('should reject empty token', () => {
      expect(() => QRVerifyBodySchema.parse({ token: '' })).toThrow();
    });
  });

  describe('WalletVouchersQuerySchema', () => {
    it('should accept valid status values', () => {
      expect(() => WalletVouchersQuerySchema.parse({ status: 'active' })).not.toThrow();
      expect(() => WalletVouchersQuerySchema.parse({ status: 'used' })).not.toThrow();
      expect(() => WalletVouchersQuerySchema.parse({ status: 'expired' })).not.toThrow();
    });

    it('should reject invalid status', () => {
      expect(() => WalletVouchersQuerySchema.parse({ status: 'pending' })).toThrow();
    });

    it('should make status optional', () => {
      const result = WalletVouchersQuerySchema.parse({});
      expect(result.status).toBeUndefined();
    });
  });

  describe('PlacesNearbyQuerySchema', () => {
    it('should accept valid geohash5', () => {
      const result = PlacesNearbyQuerySchema.parse({ geohash5: 'wydm6' });
      expect(result.geohash5).toBe('wydm6');
    });

    it('should reject geohash with wrong length', () => {
      expect(() => PlacesNearbyQuerySchema.parse({ geohash5: 'wyd' })).toThrow();
      expect(() => PlacesNearbyQuerySchema.parse({ geohash5: 'wydm6v' })).toThrow();
    });

    it('should enforce radius boundaries', () => {
      expect(() => PlacesNearbyQuerySchema.parse({ geohash5: 'wydm6', radius: 50 })).toThrow();
      expect(() => PlacesNearbyQuerySchema.parse({ geohash5: 'wydm6', radius: 6000 })).toThrow();
      expect(() => PlacesNearbyQuerySchema.parse({ geohash5: 'wydm6', radius: 500 })).not.toThrow();
    });

    it('should apply default radius', () => {
      const result = PlacesNearbyQuerySchema.parse({ geohash5: 'wydm6' });
      expect(result.radius).toBe(500);
    });
  });

  describe('SearchQuerySchema', () => {
    it('should accept valid search query', () => {
      const result = SearchQuerySchema.parse({ q: 'cafe' });
      expect(result.q).toBe('cafe');
    });

    it('should reject empty query', () => {
      expect(() => SearchQuerySchema.parse({ q: '' })).toThrow();
    });

    it('should reject query that is too long', () => {
      const longQuery = 'a'.repeat(101);
      expect(() => SearchQuerySchema.parse({ q: longQuery })).toThrow();
    });

    it('should accept optional lat/lng', () => {
      const result = SearchQuerySchema.parse({ q: 'cafe', lat: 37.5, lng: 126.9 });
      expect(result.lat).toBe(37.5);
      expect(result.lng).toBe(126.9);
    });

    it('should enforce radius boundaries', () => {
      expect(() => SearchQuerySchema.parse({ q: 'cafe', radius: 50 })).toThrow();
      expect(() => SearchQuerySchema.parse({ q: 'cafe', radius: 11000 })).toThrow();
    });
  });

  describe('WalletLedgerQuerySchema', () => {
    it('should accept cursor and limit', () => {
      const cursor = '123e4567-e89b-12d3-a456-426614174000';
      const result = WalletLedgerQuerySchema.parse({ cursor, limit: 10 });
      expect(result.cursor).toBe(cursor);
      expect(result.limit).toBe(10);
    });

    it('should apply default limit', () => {
      const result = WalletLedgerQuerySchema.parse({});
      expect(result.limit).toBe(20);
    });
  });
});
