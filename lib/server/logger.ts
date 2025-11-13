// ZZIK LIVE - Server-side Logger
// Structured logging with request_id and privacy (geohash5 only)

import { randomUUID } from 'crypto';

export interface LogEntry {
  request_id: string;
  route: string;
  method: string;
  status: number;
  took_ms: number;
  user_id?: string;
  geohash5?: string; // Privacy: NO raw coordinates
  error_code?: string;
  timestamp: string;
}

export function createRequestId(): string {
  return randomUUID();
}

export function logRequest(entry: Omit<LogEntry, 'timestamp'>) {
  const logEntry: LogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('[Request Log]', JSON.stringify(logEntry, null, 2));
  } else {
    // Production: Send to logging service (Datadog, CloudWatch, etc.)
    console.log(JSON.stringify(logEntry));
  }
}

export function logError(error: Error, context: { route: string; request_id: string; user_id?: string }) {
  console.error('[Error]', {
    ...context,
    error_message: error.message,
    error_stack: error.stack,
    timestamp: new Date().toISOString(),
  });
}
