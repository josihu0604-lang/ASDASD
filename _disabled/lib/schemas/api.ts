import { z } from 'zod';

// Common
export const UUIDSchema = z.string().uuid();
export const CursorSchema = z.string().optional();

// Offers
export const OffersQuerySchema = z.object({
  filter: z.enum(['all', 'new', 'expiring']).default('all'),
  cursor: CursorSchema,
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const OfferAcceptParamsSchema = z.object({
  id: UUIDSchema,
});

// Wallet
export const WalletVouchersQuerySchema = z.object({
  status: z.enum(['active', 'used', 'expired']).optional(),
  cursor: CursorSchema,
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const WalletLedgerQuerySchema = z.object({
  cursor: CursorSchema,
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// QR
export const QRVerifyBodySchema = z.object({
  token: z.string().min(1),
});

// Places
export const PlacesNearbyQuerySchema = z.object({
  geohash5: z.string().length(5),
  radius: z.coerce.number().int().min(100).max(5000).default(500),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// Search
export const SearchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().int().min(100).max(10000).default(1000).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

// Error Response
export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    request_id: z.string().optional(),
  }),
});

export type OffersQuery = z.infer<typeof OffersQuerySchema>;
export type OfferAcceptParams = z.infer<typeof OfferAcceptParamsSchema>;
export type WalletVouchersQuery = z.infer<typeof WalletVouchersQuerySchema>;
export type WalletLedgerQuery = z.infer<typeof WalletLedgerQuerySchema>;
export type QRVerifyBody = z.infer<typeof QRVerifyBodySchema>;
export type PlacesNearbyQuery = z.infer<typeof PlacesNearbyQuerySchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
