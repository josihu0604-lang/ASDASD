// Analytics/Tracking System for ZZIK LIVE
// Implements event tracking with proper typing and batching

import { AnalyticsEvent } from '@/types';

class Analytics {
  private queue: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.startFlushInterval();
    }
  }

  track(name: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      },
      timestamp: new Date(),
    };

    this.queue.push(event);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', name, properties);
    }

    // Flush if queue is large
    if (this.queue.length >= 10) {
      this.flush();
    }
  }

  // Route tracking
  routeView(path: string) {
    this.track('route_view', { path });
  }

  // Map/Place events
  mapView(geohash5: string, filters?: string[]) {
    this.track('map_view', { geohash5, filters });
  }

  pinTap(placeId: string) {
    this.track('pin_tap', { place_id: placeId });
  }

  placeSheetOpen(stage: 'peek' | 'half' | 'full') {
    this.track('place_sheet_open', { stage });
  }

  // Reel events
  reelViewStart(reelId: string) {
    this.track('reel_view_start', { reel_id: reelId });
  }

  reelViewEnd(reelId: string, dwellMs: number) {
    this.track('reel_view_end', { reel_id: reelId, dwell_ms: dwellMs });
  }

  reelAction(type: 'like' | 'share' | 'save' | 'navigate') {
    this.track('reel_action', { type });
  }

  // Pass events
  passView(passId: string) {
    this.track('pass_view', { pass_id: passId });
  }

  purchaseClick(passId: string) {
    this.track('purchase_click', { pass_id: passId });
  }

  // Offer events
  offersView(tab: 'all' | 'new' | 'expiring') {
    this.track('offers_view', { tab });
  }

  offerView(offerId: string) {
    this.track('offer_view', { offer_id: offerId });
  }

  offerAccept(offerId: string) {
    this.track('offer_accept', { offer_id: offerId });
  }

  offerDismiss(offerId: string) {
    this.track('offer_dismiss', { offer_id: offerId });
  }

  // QR Scan events
  qrScanStart() {
    this.track('qr_scan_start');
  }

  qrScanResult(kind: 'voucher' | 'checkin' | 'membership' | 'unknown') {
    this.track('qr_scan_result', { kind });
  }

  qrError(code: 'not_found' | 'timeout' | 'denied' | 'unavailable' | 'unknown') {
    this.track('qr_error', { code });
  }

  // Wallet events
  walletView() {
    this.track('wallet_view');
  }

  walletSectionOpen(section: 'passes' | 'transactions' | 'payments') {
    this.track('wallet_section_open', { sec: section });
  }

  voucherOpen(voucherId: string) {
    this.track('voucher_open', { voucher_id: voucherId });
  }

  voucherUse(voucherId: string) {
    this.track('voucher_use', { voucher_id: voucherId });
  }

  paymentAdd(type: 'card' | 'simple') {
    this.track('payment_add', { type });
  }

  paymentRemove(paymentId: string) {
    this.track('payment_remove', { payment_id: paymentId });
  }

  private startFlushInterval() {
    this.flushInterval = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, 5000); // Flush every 5 seconds
  }

  private async flush() {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      // Send to analytics endpoint
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.error('[Analytics] Failed to flush events:', error);
      // Re-add failed events to queue
      this.queue.unshift(...events);
    }
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

// Singleton instance
export const analytics = new Analytics();
