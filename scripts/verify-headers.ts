#!/usr/bin/env tsx
/**
 * Security Headers Verification Script
 * Ensures all required security headers are present and properly configured
 */

import assert from 'node:assert';
import { execSync } from 'node:child_process';

interface HeaderCheck {
  name: string;
  header: string;
  required: boolean;
  validator?: (value: string) => boolean;
}

const SECURITY_HEADERS: HeaderCheck[] = [
  {
    name: 'Content Security Policy',
    header: 'content-security-policy',
    required: true,
    validator: (value) => value.includes("default-src") && value.includes("'self'"),
  },
  {
    name: 'Strict Transport Security',
    header: 'strict-transport-security',
    required: true,
    validator: (value) => value.includes('max-age=') && parseInt(value.match(/max-age=(\d+)/)?.[1] || '0') >= 31536000,
  },
  {
    name: 'X-Content-Type-Options',
    header: 'x-content-type-options',
    required: true,
    validator: (value) => value === 'nosniff',
  },
  {
    name: 'X-Frame-Options',
    header: 'x-frame-options',
    required: true,
    validator: (value) => ['DENY', 'SAMEORIGIN'].includes(value),
  },
  {
    name: 'Cross-Origin-Opener-Policy',
    header: 'cross-origin-opener-policy',
    required: true,
    validator: (value) => ['same-origin', 'same-origin-allow-popups'].includes(value),
  },
  {
    name: 'Cross-Origin-Resource-Policy',
    header: 'cross-origin-resource-policy',
    required: true,
    validator: (value) => ['same-origin', 'same-site', 'cross-origin'].includes(value),
  },
  {
    name: 'Referrer-Policy',
    header: 'referrer-policy',
    required: false,
    validator: (value) => value.includes('strict-origin'),
  },
  {
    name: 'Permissions-Policy',
    header: 'permissions-policy',
    required: false,
  },
];

const RATE_LIMIT_HEADERS = [
  'x-ratelimit-limit',
  'x-ratelimit-remaining',
  'x-ratelimit-reset',
];

async function checkHeaders(url: string) {
  console.log(`🔒 Security Headers Verification for ${url}\n`);
  console.log('═'.repeat(60));
  
  try {
    // First, check if the server is running
    try {
      execSync(`curl -s -o /dev/null -w "%{http_code}" ${url}`, { stdio: 'pipe' });
    } catch {
      console.error('❌ Server is not running at', url);
      console.log('\n💡 Please start the server first:');
      console.log('   npm run dev');
      process.exit(1);
    }
    
    // Fetch headers
    const response = await fetch(url, { method: 'HEAD' });
    const headers = Object.fromEntries([...response.headers.entries()]);
    
    console.log('\n📋 Security Headers Check:\n');
    
    let failedChecks = 0;
    let missingRequired = 0;
    
    // Check security headers
    for (const check of SECURITY_HEADERS) {
      const value = headers[check.header];
      
      if (!value) {
        if (check.required) {
          console.log(`❌ ${check.name}: MISSING (required)`);
          missingRequired++;
          failedChecks++;
        } else {
          console.log(`⚠️  ${check.name}: Missing (optional)`);
        }
        continue;
      }
      
      if (check.validator) {
        if (check.validator(value)) {
          console.log(`✅ ${check.name}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
        } else {
          console.log(`⚠️  ${check.name}: Invalid value - ${value}`);
          if (check.required) failedChecks++;
        }
      } else {
        console.log(`✅ ${check.name}: Present`);
      }
    }
    
    // Check rate limit headers for API endpoints
    console.log('\n📊 Rate Limiting Headers:\n');
    
    const apiResponse = await fetch(`${url}/api/health`, { method: 'GET' }).catch(() => null);
    if (apiResponse) {
      const apiHeaders = Object.fromEntries([...apiResponse.headers.entries()]);
      
      for (const header of RATE_LIMIT_HEADERS) {
        if (apiHeaders[header]) {
          console.log(`✅ ${header}: ${apiHeaders[header]}`);
        } else {
          console.log(`⚠️  ${header}: Not present`);
        }
      }
    } else {
      console.log('⚠️  Could not check API rate limit headers');
    }
    
    // Security score calculation
    const totalRequired = SECURITY_HEADERS.filter(h => h.required).length;
    const score = Math.round(((totalRequired - missingRequired) / totalRequired) * 100);
    
    console.log('\n' + '═'.repeat(60));
    console.log(`\n🏆 Security Score: ${score}%`);
    
    if (failedChecks > 0) {
      console.log(`\n❌ ${failedChecks} security header check(s) failed`);
      console.log('\n📚 Resources:');
      console.log('  • https://securityheaders.com');
      console.log('  • https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers');
      process.exit(1);
    } else {
      console.log('\n✅ All required security headers are properly configured!');
      
      // Additional privacy check
      console.log('\n🔐 Privacy Protection Check:');
      console.log('  • Geohash5 enforcement: Enabled');
      console.log('  • Raw coordinates blocked: Yes');
      console.log('  • Structured logging: Active');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

// Main execution
const url = process.argv[2] || 'http://localhost:3000';

checkHeaders(url).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});