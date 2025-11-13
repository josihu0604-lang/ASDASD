#!/usr/bin/env tsx
/**
 * System Health Check Script
 * Verifies all required dependencies and services are available
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import * as path from 'node:path';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: string;
}

const results: CheckResult[] = [];

function check(name: string, cmd: string, required = true): void {
  try {
    const output = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' }).trim();
    results.push({
      name,
      status: 'pass',
      message: output,
    });
  } catch (error) {
    results.push({
      name,
      status: required ? 'fail' : 'warn',
      message: `${name} check failed`,
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

function checkFile(name: string, filepath: string, required = true): void {
  const fullPath = path.resolve(process.cwd(), filepath);
  if (existsSync(fullPath)) {
    results.push({
      name,
      status: 'pass',
      message: `Found at ${filepath}`,
    });
  } else {
    results.push({
      name,
      status: required ? 'fail' : 'warn',
      message: `Missing: ${filepath}`,
    });
  }
}

function checkEnvVar(name: string, envVar: string, required = true): void {
  if (process.env[envVar]) {
    results.push({
      name,
      status: 'pass',
      message: 'Set',
      details: envVar.includes('TOKEN') || envVar.includes('SECRET') 
        ? '***' 
        : process.env[envVar]?.substring(0, 20) + '...',
    });
  } else {
    results.push({
      name,
      status: required ? 'fail' : 'warn',
      message: `Environment variable ${envVar} not set`,
    });
  }
}

async function checkService(name: string, host: string, port: number): Promise<void> {
  try {
    execSync(`nc -z ${host} ${port}`, { stdio: 'pipe' });
    results.push({
      name,
      status: 'pass',
      message: `Service running on ${host}:${port}`,
    });
  } catch {
    results.push({
      name,
      status: 'warn',
      message: `Service not available on ${host}:${port}`,
    });
  }
}

async function main() {
  console.log('🩺 ZZIK LIVE System Health Check\n');
  console.log('═'.repeat(50));
  
  // System requirements
  console.log('\n📦 System Requirements:');
  check('Node.js', 'node -v');
  check('npm', 'npm -v');
  check('Docker', 'docker --version', false);
  check('Docker Compose', 'docker compose version', false);
  
  // Project files
  console.log('\n📁 Project Files:');
  checkFile('package.json', './package.json');
  checkFile('tsconfig.json', './tsconfig.json');
  checkFile('.env', './.env');
  checkFile('Prisma Schema', './prisma/schema.prisma', false);
  
  // Environment variables
  console.log('\n🔐 Environment Variables:');
  checkEnvVar('Database URL', 'DATABASE_URL');
  checkEnvVar('Mapbox Token', 'NEXT_PUBLIC_MAPBOX_TOKEN');
  checkEnvVar('App URL', 'NEXT_PUBLIC_APP_URL');
  checkEnvVar('Node Environment', 'NODE_ENV', false);
  checkEnvVar('Log Level', 'LOG_LEVEL', false);
  
  // Services
  console.log('\n🌐 Services:');
  await checkService('PostgreSQL', 'localhost', 5432);
  await checkService('Redis', 'localhost', 6379);
  await checkService('Next.js Dev Server', 'localhost', 3000);
  
  // Dependencies check
  console.log('\n📚 Dependencies:');
  try {
    execSync('npm ls --depth=0', { stdio: 'pipe' });
    results.push({
      name: 'npm packages',
      status: 'pass',
      message: 'All dependencies installed',
    });
  } catch {
    results.push({
      name: 'npm packages',
      status: 'warn',
      message: 'Some dependencies may be missing',
      details: 'Run: npm ci',
    });
  }
  
  // Prisma check
  try {
    execSync('npx prisma validate', { stdio: 'pipe' });
    results.push({
      name: 'Prisma Schema',
      status: 'pass',
      message: 'Schema is valid',
    });
  } catch {
    results.push({
      name: 'Prisma Schema',
      status: 'warn',
      message: 'Schema validation failed',
      details: 'Run: npx prisma validate',
    });
  }
  
  // Print results
  console.log('\n' + '═'.repeat(50));
  console.log('📊 Results Summary:\n');
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warn').length;
  
  for (const result of results) {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    const statusColor = result.status === 'pass' ? '\x1b[32m' : result.status === 'fail' ? '\x1b[31m' : '\x1b[33m';
    const reset = '\x1b[0m';
    
    console.log(`${icon} ${statusColor}${result.name}${reset}: ${result.message}`);
    if (result.details) {
      console.log(`   └─ ${result.details}`);
    }
  }
  
  console.log('\n' + '═'.repeat(50));
  console.log(`\n📈 Summary: ${passed} passed, ${failed} failed, ${warnings} warnings`);
  
  if (failed > 0) {
    console.log('\n❌ System check failed. Please fix the issues above.');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('\n⚠️  System check passed with warnings.');
  } else {
    console.log('\n✅ All systems operational!');
  }
  
  // Quick start guide if checks pass
  if (failed === 0) {
    console.log('\n🚀 Quick Start:');
    console.log('  1. npm run db:up      # Start database');
    console.log('  2. npm run db:migrate # Run migrations');
    console.log('  3. npm run dev        # Start dev server');
  }
}

main().catch(error => {
  console.error('❌ Doctor script failed:', error);
  process.exit(1);
});