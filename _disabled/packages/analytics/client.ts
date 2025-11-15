/**
 * Analytics Client with Batching and Privacy Protection
 * Implements batching (50 events / 10s / 100KB) with guardrails
 */

import { type AnalyticsEvent, validateEvent } from './schema';

interface BatchConfig {
  maxSize: number;        // Maximum events per batch (default: 50)
  maxWaitMs: number;      // Maximum wait time (default: 10000ms)
  maxBytesKB: number;     // Maximum batch size in KB (default: 100)
  endpoint: string;       // Analytics endpoint
  retryAttempts: number;  // Number of retry attempts (default: 3)
}

class AnalyticsClient {
  private queue: AnalyticsEvent[] = [];
  private timer: NodeJS.Timeout | null = null;
  private config: BatchConfig;
  private sending = false;

  constructor(config: Partial<BatchConfig> = {}) {
    this.config = {
      maxSize: 50,
      maxWaitMs: 10000,
      maxBytesKB: 100,
      endpoint: '/api/analytics',
      retryAttempts: 3,
      ...config,
    };
  }

  /**
   * Track an event with validation and geo-privacy protection
   */
  track(event: Omit<AnalyticsEvent, 'timestamp' | 'request_id'>): void {
    try {
      // Add timestamp and request ID
      const fullEvent = {
        ...event,
        timestamp: Date.now(),
        request_id: this.generateRequestId(),
      };

      // Validate event schema (will throw if invalid)
      const validatedEvent = validateEvent(fullEvent);

      // Check for raw coordinates (additional runtime protection)
      this.checkForRawCoordinates(validatedEvent);

      // Add to queue
      this.queue.push(validatedEvent);

      // Check if we should flush
      if (this.shouldFlush()) {
        this.flush();
      } else if (!this.timer) {
        // Set timer for auto-flush
        this.timer = setTimeout(() => this.flush(), this.config.maxWaitMs);
      }
    } catch (error) {
      console.error('[Analytics] Event validation failed:', error);
    }
  }

  /**
   * Check if batch should be flushed
   */
  private shouldFlush(): boolean {
    if (this.queue.length >= this.config.maxSize) {
      return true;
    }

    const batchSize = new Blob([JSON.stringify(this.queue)]).size;
    if (batchSize >= this.config.maxBytesKB * 1024) {
      return true;
    }

    return false;
  }

  /**
   * Flush the current batch
   */
  async flush(): Promise<void> {
    if (this.sending || this.queue.length === 0) {
      return;
    }

    // Clear timer
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // Get current batch and clear queue
    const batch = [...this.queue];
    this.queue = [];
    this.sending = true;

    try {
      await this.sendBatch(batch);
    } catch (error) {
      console.error('[Analytics] Batch send failed:', error);
      // Re-queue failed events (with limit)
      if (this.queue.length < this.config.maxSize * 2) {
        this.queue.unshift(...batch);
      }
    } finally {
      this.sending = false;
    }
  }

  /**
   * Send batch with retry logic
   */
  private async sendBatch(batch: AnalyticsEvent[]): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      try {
        const response = await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Analytics-Batch': 'true',
            'X-Idempotency-Key': this.generateRequestId(),
          },
          body: JSON.stringify({
            events: batch,
            batch_metadata: {
              size: batch.length,
              timestamp: Date.now(),
              client_version: '1.0.0',
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Success - check for partial failures in response
        const result = await response.json();
        if (result.failed_events?.length > 0) {
          console.warn(`[Analytics] ${result.failed_events.length} events failed processing`);
        }

        return; // Success
      } catch (error) {
        lastError = error as Error;
        // Exponential backoff
        if (attempt < this.config.retryAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Failed to send batch');
  }

  /**
   * Runtime check for raw coordinates (additional safety)
   */
  private checkForRawCoordinates(event: any): void {
    const forbidden = ['lat', 'lng', 'latitude', 'longitude', 'coords', 'coordinates'];
    const eventStr = JSON.stringify(event).toLowerCase();
    
    for (const term of forbidden) {
      if (eventStr.includes(term)) {
        throw new Error(`Forbidden coordinate field detected: ${term}. Use geohash5 instead.`);
      }
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup on unmount
   */
  destroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    // Try to flush remaining events
    this.flush().catch(() => {});
  }
}

// Singleton instance
let instance: AnalyticsClient | null = null;

export function getAnalytics(config?: Partial<BatchConfig>): AnalyticsClient {
  if (!instance) {
    instance = new AnalyticsClient(config);
  }
  return instance;
}

export { AnalyticsClient };