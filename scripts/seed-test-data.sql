-- Seed Test Data for E2E Tests
-- Run this script against your test database before running tests
-- Usage: psql -d zzik_test -f scripts/seed-test-data.sql

-- Clean up existing test data
DELETE FROM qr_token WHERE voucher_id IN (SELECT id FROM voucher WHERE user_id = '00000000-0000-4000-8000-000000000001');
DELETE FROM voucher WHERE user_id = '00000000-0000-4000-8000-000000000001';
DELETE FROM offer_inbox WHERE user_id = '00000000-0000-4000-8000-000000000001';
DELETE FROM ledger WHERE user_id = '00000000-0000-4000-8000-000000000001';
DELETE FROM offer WHERE brand = 'ZZIK Test';
DELETE FROM place WHERE name LIKE 'Demo %';
DELETE FROM "user" WHERE id = '00000000-0000-4000-8000-000000000001';

-- Insert test user
INSERT INTO "user" (id, email, name, status, created_at)
VALUES (
  '00000000-0000-4000-8000-000000000001',
  'test@zzik.live',
  'Test User',
  'active',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Insert test places
INSERT INTO place (id, name, category, geom, geohash6, score_popularity, created_at)
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'Demo Cafe',
    'cafe',
    ST_SetSRID(ST_MakePoint(126.9780, 37.5665), 4326)::geography,
    'wydm6v',
    0.85,
    NOW()
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'Demo Restaurant',
    'restaurant',
    ST_SetSRID(ST_MakePoint(126.9800, 37.5670), 4326)::geography,
    'wydm6v',
    0.72,
    NOW()
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'Demo Bar',
    'bar',
    ST_SetSRID(ST_MakePoint(126.9760, 37.5660), 4326)::geography,
    'wydm6v',
    0.68,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert test offers
INSERT INTO offer (id, brand, title, benefit, terms, place_id, start_at, end_at, status, created_at)
VALUES
  -- Active offer (new)
  (
    '20000000-0000-0000-0000-000000000001',
    'ZZIK Test',
    'Free Latte',
    'One per user',
    'Valid until end date',
    '10000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '7 days',
    'active',
    NOW()
  ),
  -- Expiring offer (within 48h)
  (
    '20000000-0000-0000-0000-000000000002',
    'ZZIK Test',
    '30% Off Meal',
    'Discount on total bill',
    'Cannot be combined with other offers',
    '10000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '36 hours',
    'active',
    NOW()
  ),
  -- Future offer
  (
    '20000000-0000-0000-0000-000000000003',
    'ZZIK Test',
    'Free Cocktail',
    'First drink on us',
    'Valid on weekends only',
    '10000000-0000-0000-0000-000000000003',
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '10 days',
    'active',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert offers into inbox
INSERT INTO offer_inbox (user_id, offer_id, status, created_at, updated_at)
VALUES
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-0000-0000-000000000001', 'new', NOW(), NOW()),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-0000-0000-000000000002', 'new', NOW(), NOW()),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-0000-0000-000000000003', 'new', NOW(), NOW())
ON CONFLICT (user_id, offer_id) DO NOTHING;

-- Insert wallet ledger (initial balance)
INSERT INTO ledger (id, user_id, type, amount, balance_after, created_at, description)
VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-4000-8000-000000000001',
    'earn',
    1000,
    1000,
    NOW() - INTERVAL '10 days',
    'Welcome bonus'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '00000000-0000-4000-8000-000000000001',
    'earn',
    500,
    1500,
    NOW() - INTERVAL '5 days',
    'QR scan reward'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert test voucher (for QR verification test)
INSERT INTO voucher (id, user_id, offer_id, status, issued_at, expire_at, created_at)
VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    '00000000-0000-4000-8000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'active',
    NOW(),
    NOW() + INTERVAL '3 days',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert QR token (SHA-256 hash of 'DEMO_TOKEN')
-- Hash: 9e6cc0b49ea04e71e90c5652e1a67f0e2fd1a9fc7e8ec3cf77f2bb1c7e46b7be
INSERT INTO qr_token (id, voucher_id, code_hash, status, ttl_sec, created_at)
VALUES
  (
    '50000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    '9e6cc0b49ea04e71e90c5652e1a67f0e2fd1a9fc7e8ec3cf77f2bb1c7e46b7be',
    'issued',
    600,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Verify seed data
SELECT 'Users' as table_name, COUNT(*) as count FROM "user" WHERE id = '00000000-0000-4000-8000-000000000001'
UNION ALL
SELECT 'Places', COUNT(*) FROM place WHERE name LIKE 'Demo %'
UNION ALL
SELECT 'Offers', COUNT(*) FROM offer WHERE brand = 'ZZIK Test'
UNION ALL
SELECT 'Offer Inbox', COUNT(*) FROM offer_inbox WHERE user_id = '00000000-0000-4000-8000-000000000001'
UNION ALL
SELECT 'Ledger', COUNT(*) FROM ledger WHERE user_id = '00000000-0000-4000-8000-000000000001'
UNION ALL
SELECT 'Vouchers', COUNT(*) FROM voucher WHERE user_id = '00000000-0000-4000-8000-000000000001'
UNION ALL
SELECT 'QR Tokens', COUNT(*) FROM qr_token WHERE id = '50000000-0000-0000-0000-000000000001';

\echo '✅ Seed data inserted successfully'
