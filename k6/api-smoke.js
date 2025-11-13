/**
 * k6 Smoke Test - 10 VUs for 1 minute
 * Validates basic functionality and error rates
 * 
 * Run: k6 run k6/api-smoke.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const offersDuration = new Trend('offers_duration');
const walletDuration = new Trend('wallet_duration');
const searchDuration = new Trend('search_duration');

export const options = {
  vus: 10,
  duration: '1m',
  thresholds: {
    errors: ['rate<0.01'], // Error rate < 1%
    http_req_failed: ['rate<0.01'], // Failed requests < 1%
    http_req_duration: ['p(95)<500'], // 95% under 500ms
    offers_duration: ['p(95)<150'], // Offers p95 < 150ms
    wallet_duration: ['p(95)<100'], // Wallet p95 < 100ms
    search_duration: ['p(95)<120'], // Search p95 < 120ms
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const TEST_USER_ID = '00000000-0000-4000-8000-000000000001';

export default function () {
  const headers = {
    'x-user-id': TEST_USER_ID,
    'Content-Type': 'application/json',
  };

  // Test 1: GET /api/offers
  {
    const res = http.get(`${BASE_URL}/api/offers?filter=all&limit=10`, { headers });
    const success = check(res, {
      'offers: status is 200': (r) => r.status === 200,
      'offers: has items array': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body.items);
        } catch (e) {
          return false;
        }
      },
    });
    
    errorRate.add(!success);
    offersDuration.add(res.timings.duration);
  }

  sleep(0.5);

  // Test 2: GET /api/wallet/summary
  {
    const res = http.get(`${BASE_URL}/api/wallet/summary`, { headers });
    const success = check(res, {
      'wallet: status is 200': (r) => r.status === 200,
      'wallet: has points': (r) => {
        try {
          const body = JSON.parse(r.body);
          return typeof body.points === 'number';
        } catch (e) {
          return false;
        }
      },
      'wallet: has vouchers': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.vouchers && typeof body.vouchers.active === 'number';
        } catch (e) {
          return false;
        }
      },
    });
    
    errorRate.add(!success);
    walletDuration.add(res.timings.duration);
  }

  sleep(0.5);

  // Test 3: GET /api/search
  {
    const queries = ['cafe', 'restaurant', 'bar', '강남', '홍대'];
    const q = queries[Math.floor(Math.random() * queries.length)];
    
    const res = http.get(
      `${BASE_URL}/api/search?q=${encodeURIComponent(q)}&lat=37.5665&lng=126.978`,
      { headers }
    );
    
    const success = check(res, {
      'search: status is 200': (r) => r.status === 200,
      'search: has items': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body.items);
        } catch (e) {
          return false;
        }
      },
    });
    
    errorRate.add(!success);
    searchDuration.add(res.timings.duration);
  }

  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify(data, null, 2),
    'k6-results-smoke.json': JSON.stringify(data),
  };
}
