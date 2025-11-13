import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  vus: 5, // 5 virtual users
  duration: '30s', // Run for 30 seconds
  thresholds: {
    http_req_duration: ['p(95)<150'], // 95% of requests must complete below 150ms
    errors: ['rate<0.01'], // Error rate must be below 1%
    http_req_failed: ['rate<0.05'], // HTTP failure rate must be below 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test scenarios
const endpoints = [
  { path: '/api/health', method: 'GET', expectedStatus: 200 },
  { path: '/api/offers', method: 'GET', expectedStatus: 200 },
  { path: '/api/offers/nearby?geohash=u4pru', method: 'GET', expectedStatus: 200 },
  { path: '/api/wallet/balance', method: 'GET', expectedStatus: 401 }, // Expected 401 without auth
  { path: '/api/qr/verify', method: 'POST', expectedStatus: 400 }, // Expected 400 without body
  { path: '/api/places/search?q=tokyo', method: 'GET', expectedStatus: 200 },
  { path: '/api/analytics/event', method: 'POST', expectedStatus: 401 },
];

export default function () {
  // Test each endpoint
  endpoints.forEach((endpoint) => {
    const url = `${BASE_URL}${endpoint.path}`;
    
    let response;
    if (endpoint.method === 'POST') {
      response = http.post(url, JSON.stringify({}), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      response = http.get(url);
    }
    
    // Check response
    const success = check(response, {
      [`${endpoint.path} status is ${endpoint.expectedStatus}`]: (r) => r.status === endpoint.expectedStatus,
      [`${endpoint.path} response time < 150ms`]: (r) => r.timings.duration < 150,
    });
    
    // Track errors
    errorRate.add(!success);
    
    // Check security headers
    if (response.status === 200) {
      check(response, {
        'has CSP header': (r) => r.headers['Content-Security-Policy'] !== undefined,
        'has HSTS header': (r) => r.headers['Strict-Transport-Security'] !== undefined,
        'has X-Content-Type-Options': (r) => r.headers['X-Content-Type-Options'] === 'nosniff',
        'has rate limit headers': (r) => r.headers['X-Ratelimit-Limit'] !== undefined,
      });
    }
  });
  
  // Small delay between iterations
  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'k6-results.json': JSON.stringify(data),
  };
}

// Helper function for text summary
function textSummary(data, options) {
  const { metrics } = data;
  let summary = '\n=== SMOKE TEST RESULTS ===\n\n';
  
  // Check thresholds
  let allPassed = true;
  Object.keys(metrics).forEach((metric) => {
    const m = metrics[metric];
    if (m.thresholds) {
      Object.keys(m.thresholds).forEach((threshold) => {
        const passed = m.thresholds[threshold].ok;
        allPassed = allPassed && passed;
        summary += `${passed ? '✅' : '❌'} ${metric} ${threshold}\n`;
      });
    }
  });
  
  // Overall result
  summary += `\n${allPassed ? '✅ All smoke tests passed!' : '❌ Some smoke tests failed!'}\n`;
  
  return summary;
}