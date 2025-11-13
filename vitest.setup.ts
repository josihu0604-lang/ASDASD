/**
 * Vitest Global Setup
 * Runs before all tests
 */

import { config } from 'dotenv';
import path from 'path';

// Load test environment variables
config({ path: path.resolve(__dirname, '.env.test') });

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.test.mock';

// Global test utilities
global.TEST_USER_ID = '00000000-0000-4000-8000-000000000001';
global.TEST_USER_ID_2 = '00000000-0000-4000-8000-000000000002';

console.log('✅ Vitest setup complete');
