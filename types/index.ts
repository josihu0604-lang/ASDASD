// Core Types for ZZIK LIVE Platform

export type TabName = 'pass' | 'offers' | 'scan' | 'wallet';

// Pass/Voucher Types
export interface Pass {
  id: string;
  placeId: string;
  title: string;
  benefit: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  coverUrl: string;
  mediaUrls: string[];
  validUntil: Date;
  remainingCount: number;
  category: 'cafe' | 'bar' | 'activity' | 'other';
  terms: string[];
}

export interface Voucher {
  id: string;
  passId: string;
  pass: Pass;
  status: 'active' | 'reserved' | 'expiring_soon' | 'expired' | 'used';
  purchasedAt: Date;
  expiresAt: Date;
  qrCode?: string;
}

// Place/Location Types
export interface Place {
  id: string;
  name: string;
  category: 'cafe' | 'bar' | 'activity' | 'other';
  lat: number;
  lng: number;
  address: string;
  distance?: number;
  rating?: number;
  isOpen?: boolean;
  businessHours?: string;
  phone?: string;
}

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  count?: number;
  category?: Place['category'];
}

// Reel Types
export interface Reel {
  id: string;
  placeId: string;
  place?: Place;
  coverUrl: string;
  videoUrl: string;
  duration: number;
  viewCount?: number;
  likeCount?: number;
}

// Offer Types
export interface Offer {
  id: string;
  brandName: string;
  brandLogo: string;
  title: string;
  benefit: string;
  conditions: string[];
  validFrom: Date;
  validUntil: Date;
  distance?: number;
  isNew?: boolean;
  status: 'new' | 'expiring_soon' | 'normal';
  places: Place[];
}

// Filter Types
export interface Filter {
  id: string;
  label: string;
  selected: boolean;
}

// QR Scanner Types
export type ScanResultKind = 'voucher' | 'checkin' | 'membership' | 'unknown';

export interface ScanResult {
  kind: ScanResultKind;
  payload: string;
  voucherId?: string;
  placeId?: string;
  timestamp: Date;
}

export type ScanError = 'not_found' | 'timeout' | 'denied' | 'unavailable' | 'unknown';

// Wallet Types
export interface WalletSummary {
  points: number;
  stamps: number;
  activeVouchers: number;
  expiringVouchers: number;
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'use' | 'refund' | 'earn';
  amount: number;
  title: string;
  description?: string;
  timestamp: Date;
  voucherId?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'simple';
  brand: string;
  last4: string;
  isDefault: boolean;
  expiryMonth?: number;
  expiryYear?: number;
}

// Sheet Types
export type SheetState = 'peek' | 'half' | 'full';

// Analytics Types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}
