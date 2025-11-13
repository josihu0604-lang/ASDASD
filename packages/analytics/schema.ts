/**
 * Analytics Event Schema with Geo-Privacy Protection
 * CRITICAL: Never include raw lat/lng coordinates in events
 * Always use geohash5 for location data (approx 4.9km x 4.9km precision)
 */

import { z } from 'zod';

// Geo-safe location type - ONLY geohash5 allowed
export type GeoSafe = {
  geohash5: string; // 5-character geohash (e.g., "u4pru")
  // DO NOT ADD: lat, lng, latitude, longitude fields
};

// Base event properties
const BaseEventSchema = z.object({
  timestamp: z.number(),
  session_id: z.string(),
  user_id: z.string().optional(),
  request_id: z.string(),
  environment: z.enum(['development', 'staging', 'production']),
});

// Geo-safe schema validation
const GeoSafeSchema = z.object({
  geohash5: z.string().length(5),
});

// Page view event
export const PageViewSchema = BaseEventSchema.extend({
  event_type: z.literal('page_view'),
  pathname: z.string(),
  referrer: z.string().optional(),
  took_ms: z.number(),
  ...GeoSafeSchema.shape,
});

// Map interaction event
export const MapInteractionSchema = BaseEventSchema.extend({
  event_type: z.literal('map_interaction'),
  action: z.enum(['pan', 'zoom', 'click', 'search', 'marker_click']),
  zoom_level: z.number().min(0).max(22),
  ...GeoSafeSchema.shape,
});

// QR code scan event
export const QRScanSchema = BaseEventSchema.extend({
  event_type: z.literal('qr_scan'),
  scan_result: z.enum(['success', 'invalid', 'error']),
  vendor_id: z.string().optional(),
  ...GeoSafeSchema.shape,
});

// Receipt validation event
export const ReceiptValidationSchema = BaseEventSchema.extend({
  event_type: z.literal('receipt_validation'),
  validation_result: z.enum(['valid', 'invalid', 'pending']),
  vendor_id: z.string().optional(),
  ...GeoSafeSchema.shape,
});

// Performance metric event
export const PerformanceMetricSchema = BaseEventSchema.extend({
  event_type: z.literal('performance'),
  metric_name: z.string(),
  value: z.number(),
  unit: z.string(),
  ...GeoSafeSchema.shape,
});

// Union type for all events
export const AnalyticsEventSchema = z.discriminatedUnion('event_type', [
  PageViewSchema,
  MapInteractionSchema,
  QRScanSchema,
  ReceiptValidationSchema,
  PerformanceMetricSchema,
]);

export type PageView = z.infer<typeof PageViewSchema>;
export type MapInteraction = z.infer<typeof MapInteractionSchema>;
export type QRScan = z.infer<typeof QRScanSchema>;
export type ReceiptValidation = z.infer<typeof ReceiptValidationSchema>;
export type PerformanceMetric = z.infer<typeof PerformanceMetricSchema>;
export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

// Validation helper
export function validateEvent(event: unknown): AnalyticsEvent {
  return AnalyticsEventSchema.parse(event);
}

// Geohash utilities
export function isValidGeohash5(hash: string): boolean {
  return /^[0-9bcdefghjkmnpqrstuvwxyz]{5}$/i.test(hash);
}

// WARNING: This function is for reference only
// In production, geohash encoding should happen server-side
export function coordinatesToGeohash5Warning(lat: number, lng: number): string {
  console.warn('WARNING: Processing raw coordinates. This should only happen server-side.');
  // Implementation would go here, but we're intentionally not including it
  // to prevent misuse in client code
  throw new Error('Coordinate conversion must happen server-side for privacy');
}