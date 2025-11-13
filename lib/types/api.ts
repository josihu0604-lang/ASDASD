/**
 * API Type Definitions for ZZIK LIVE v2.0
 * 
 * Shared types for request/response payloads across all API routes
 */

// ============================================================================
// Offer Types
// ============================================================================

export interface OfferCard {
  id: string;
  brand: string;
  title: string;
  benefit: string;
  expire_at: string; // ISO 8601
  badges: string[];  // e.g., ['expiring', 'new']
  distance_m?: number; // Optional distance in meters
}

export interface OffersListResponse {
  items: OfferCard[];
  nextCursor?: string; // UUID for pagination
}

// ============================================================================
// Wallet Types
// ============================================================================

export interface WalletSummary {
  points: number;
  stamps: {
    count: number;
    next_reward_in: number; // stamps needed for next reward
  };
  vouchers: {
    active: number;
    expiring: number; // expiring within 48h
    nearest_expire_at?: string; // ISO 8601
  };
}

export interface VoucherCard {
  id: string;
  offer: {
    brand: string;
    title: string;
    benefit?: string;
  };
  expire_at: string; // ISO 8601
  status: 'active' | 'used' | 'expired';
  used_at?: string; // ISO 8601, only for used status
}

export interface VouchersListResponse {
  items: VoucherCard[];
  nextCursor?: string;
}

export interface LedgerEntry {
  id: string;
  type: 'earn' | 'spend' | 'reward';
  amount: number;
  balance_after: number;
  created_at: string; // ISO 8601
  ref_id?: string; // Reference to related entity (offer_id, voucher_id, etc.)
  description?: string;
}

export interface LedgerListResponse {
  items: LedgerEntry[];
  nextCursor?: string;
}

// ============================================================================
// QR Types
// ============================================================================

export type QrVerifySuccess = {
  result: 'success';
  voucher_id: string;
};

export type QrVerifyAlreadyUsed = {
  result: 'already_used';
  used_at?: string; // ISO 8601
};

export type QrVerifyExpired = {
  result: 'expired';
  expired_at?: string; // ISO 8601
};

export type QrVerifyInvalid = {
  result: 'invalid';
};

export type QrVerifyResponse =
  | QrVerifySuccess
  | QrVerifyAlreadyUsed
  | QrVerifyExpired
  | QrVerifyInvalid;

// ============================================================================
// Place Types
// ============================================================================

export interface PlacePin {
  id: string;
  lat: number;
  lng: number;
  has_offer: boolean;
  name?: string;
  category?: string;
}

export interface PlacesNearbyResponse {
  pins: PlacePin[];
}

// ============================================================================
// Search Types
// ============================================================================

export interface SearchResult {
  id: string;
  type: 'place' | 'offer';
  name: string;
  subtitle?: string;
  score: number;
  distance_m?: number;
  lat?: number;
  lng?: number;
}

export interface SearchResponse {
  items: SearchResult[];
  query: string;
  total: number;
}

// ============================================================================
// Common Types
// ============================================================================

export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

export interface LocationParams {
  lat?: number;
  lng?: number;
  geohash5?: string;
}
