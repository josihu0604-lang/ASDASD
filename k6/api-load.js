/**
 * k6 Load Test - 100 VUs for 60 seconds (simulating 100 QPS)
 * Validates performance under sustained load
 * 
 * Run: k6 run k6/api-load.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const requestCount = new Counter('requests');
const offersDuration = new Trend('offers_duration');
const walletDuration = new Trend('wallet_duration');
const qrDuration = new Trend('qr_duration');
const searchDuration = new Trend('search_duration');
const placesDuration = new Trend('places_duration');

export const options = {
  stages: [
    { duration: '10s', target: 20 },  // Ramp up to 20 VUs
    { duration: '30s', target: 100 }, // Ramp up to 100 VUs
    { duration: '60s', target: 100 }, // Stay at 100 VUs
    { duration: '10s', target: 0 },   // Ramp down
  ],
  thresholds: {
    errors: ['rate<0.005'], // Error rate < 0.5%
    http_req_failed: ['rate<0.005'],
    http_req_duration: ['p(95)<120'], // Overall p95 < 120ms
    offers_duration: ['p(95)<150', 'p(99)<300'],
    wallet_duration: ['p(95)<100', 'p(99)<200'],
    qr_duration: ['p(95)<800', 'p(99)<1500'],
    search_duration: ['p(95)<80', 'p(99)<150'], // Strictest for search
    places_duration: ['p(95)<100', 'p(99)<200'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

// Generate multiple test users for realistic load
function getTestUserId() {
  const userId = Math.floor(Math.random() * 1000) + 1;
  return `00000000-0000-4000-8000-${userId.toString().padStart(12, '0')}`;
}

export default function () {
  const userId = getTestUserId();
  const headers = {
    'x-user-id': userId,
    'Content-Type': 'application/json',
  };

  // Random scenario selection (weighted)
  const scenario = Math.random();

  if (scenario < 0.3) {
    // 30%: Browse offers
    const filter = ['all', 'new', 'expiring'][Math.floor(Math.random() * 3)];
    const res = http.get(
      `${BASE_URL}/api/offers?filter=${filter}&limit=20`,
      { headers }
    );
    
    requestCount.add(1);
    offersDuration.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    
    check(res, { 'offers: status 200': (r) => r.status === 200 });

  } else if (scenario < 0.5) {
    // 20%: Check wallet summary
    const res = http.get(`${BASE_URL}/api/wallet/summary`, { headers });
    
    requestCount.add(1);
    walletDuration.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    
    check(res, { 'wallet: status 200': (r) => r.status === 200 });

  } else if (scenario < 0.65) {
    // 15%: Search places
    const queries = ['cafe', 'restaurant', 'bar', 'activity', '카페', '술집', '강남'];
    const q = queries[Math.floor(Math.random() * queries.length)];
    
    const res = http.get(
      `${BASE_URL}/api/search?q=${encodeURIComponent(q)}&lat=37.5665&lng=126.978&limit=10`,
      { headers }
    );
    
    requestCount.add(1);
    searchDuration.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    
    check(res, { 'search: status 200': (r) => r.status === 200 });

  } else if (scenario < 0.8) {
    // 15%: Get nearby places
    const geohash5 = ['wydm6', 'wydm7', 'wydm5'][Math.floor(Math.random() * 3)];
    const res = http.get(
      `${BASE_URL}/api/places/nearby?geohash5=${geohash5}&radius=500`,
      { headers }
    );
    
    requestCount.add(1);
    placesDuration.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    
    check(res, { 'places: status 200': (r) => r.status === 200 });

  } else {
    // 20%: Verify QR (will mostly fail with invalid token, but tests the endpoint)
    const res = http.post(
      `${BASE_URL}/api/qr/verify`,
      JSON.stringify({ token: `LOAD_TEST_TOKEN_${Date.now()}` }),
      { headers }
    );
    
    requestCount.add(1);
    qrDuration.add(res.timings.duration);
    // Don't count as error if it's a valid "invalid token" response
    errorRate.add(res.status !== 200 && res.status !== 422);
    
    check(res, { 'qr: status 200 or 422': (r) => r.status === 200 || r.status === 422 });
  }

  // Small sleep to simulate think time
  sleep(0.1 + Math.random() * 0.2); // 100-300ms think time
}

export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    test_duration: data.state.testRunDurationMs / 1000,
    total_requests: data.metrics.requests?.values?.count || 0,
    error_rate: data.metrics.errors?.values?.rate || 0,
    http_req_duration_p95: data.metrics.http_req_duration?.values['p(95)'] || 0,
    http_req_duration_p99: data.metrics.http_req_duration?.values['p(99)'] || 0,
    thresholds_passed: Object.keys(data.metrics).every(key => {
      const metric = data.metrics[key];
      return !metric.thresholds || Object.values(metric.thresholds).every(t => !t.ok === false);
    }),
  };

  console.log('\n📊 Load Test Summary:');
  console.log(`   Total Requests: ${summary.total_requests}`);
  console.log(`   Error Rate: ${(summary.error_rate * 100).toFixed(2)}%`);
  console.log(`   p95 Latency: ${summary.http_req_duration_p95.toFixed(2)}ms`);
  console.log(`   p99 Latency: ${summary.http_req_duration_p99.toFixed(2)}ms`);
  console.log(`   Thresholds: ${summary.thresholds_passed ? '✅ PASSED' : '❌ FAILED'}`);

  return {
    'stdout': JSON.stringify(data, null, 2),
    'k6-results-load.json': JSON.stringify({ summary, full_data: data }, null, 2),
  };
}
