import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const successRate = new Rate('success');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 10 },   // Stay at 10 users
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(95)<100'], // 95% of requests must complete below 100ms
    'http_req_duration': ['p(99)<200'], // 99% of requests must complete below 200ms
    'errors': ['rate<0.03'],             // Error rate must be below 3%
    'success': ['rate>0.97'],            // Success rate must be above 97%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Helper function to generate geohash5
function generateGeohash5() {
  const chars = '0123456789bcdefghjkmnpqrstuvwxyz';
  let geohash = '';
  for (let i = 0; i < 5; i++) {
    geohash += chars[Math.floor(Math.random() * chars.length)];
  }
  return geohash;
}

export default function () {
  // Test 1: Homepage
  let res = http.get(`${BASE_URL}/`);
  check(res, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage has security headers': (r) => {
      return r.headers['X-Frame-Options'] && 
             r.headers['X-Content-Type-Options'] &&
             r.headers['Strict-Transport-Security'];
    },
  });
  errorRate.add(res.status !== 200);
  successRate.add(res.status === 200);

  sleep(1);

  // Test 2: Map Search API
  const searchParams = {
    q: 'coffee',
    geohash5: generateGeohash5(),
  };
  
  res = http.get(`${BASE_URL}/api/map/search?${new URLSearchParams(searchParams)}`);
  check(res, {
    'search status is 200': (r) => r.status === 200,
    'search response time < 80ms': (r) => r.timings.duration < 80,
    'search has rate limit headers': (r) => {
      return r.headers['X-RateLimit-Limit'] && 
             r.headers['X-RateLimit-Remaining'];
    },
  });
  errorRate.add(res.status !== 200);
  successRate.add(res.status === 200);

  sleep(1);

  // Test 3: Analytics Ingestion
  const analyticsPayload = JSON.stringify({
    events: [
      {
        event_type: 'page_view',
        pathname: '/test',
        geohash5: generateGeohash5(),
        timestamp: Date.now(),
        session_id: 'test-session',
        request_id: `test-${Date.now()}`,
        environment: 'test',
        took_ms: Math.floor(Math.random() * 100),
      },
    ],
    batch_metadata: {
      size: 1,
      timestamp: Date.now(),
      client_version: '1.0.0',
    },
  });

  const headers = {
    'Content-Type': 'application/json',
    'X-Analytics-Batch': 'true',
    'X-Idempotency-Key': `test-${Date.now()}-${Math.random()}`,
  };

  res = http.post(`${BASE_URL}/api/analytics`, analyticsPayload, { headers });
  check(res, {
    'analytics status is 200 or 202': (r) => r.status === 200 || r.status === 202,
    'analytics ingestion < 60s': (r) => r.timings.duration < 60000,
  });
  errorRate.add(res.status !== 200 && res.status !== 202);
  successRate.add(res.status === 200 || res.status === 202);

  sleep(1);

  // Test 4: QR Validation (mock)
  const qrPayload = JSON.stringify({
    code: 'TEST-QR-CODE',
    geohash5: generateGeohash5(),
  });

  res = http.post(`${BASE_URL}/api/qr/validate`, qrPayload, { headers });
  check(res, {
    'QR validation status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    'QR validation < 50ms': (r) => r.timings.duration < 50,
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data),
  };
}

function textSummary(data, options) {
  const { metrics } = data;
  let summary = '\n=== ZZIK LIVE Load Test Results ===\n\n';
  
  // Key metrics
  summary += 'Performance Metrics:\n';
  summary += `  • Success Rate: ${(metrics.success.values.rate * 100).toFixed(2)}% (Target: ≥97%)\n`;
  summary += `  • Error Rate: ${(metrics.errors.values.rate * 100).toFixed(2)}% (Target: ≤0.3%)\n`;
  summary += `  • p95 Response Time: ${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms (Target: ≤100ms)\n`;
  summary += `  • p99 Response Time: ${metrics.http_req_duration.values['p(99)'].toFixed(2)}ms (Target: ≤200ms)\n`;
  
  // SLO validation
  summary += '\nSLO Validation:\n';
  const slosPassed = 
    metrics.success.values.rate >= 0.97 &&
    metrics.errors.values.rate <= 0.003 &&
    metrics.http_req_duration.values['p(95)'] <= 100;
  
  summary += slosPassed ? '  ✅ All SLOs PASSED\n' : '  ❌ Some SLOs FAILED\n';
  
  return summary;
}