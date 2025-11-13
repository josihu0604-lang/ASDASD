-- ZZIK LIVE - Test Seed Data
-- Database: PostgreSQL 16 + PostGIS 3.6
-- Purpose: Test data for API smoke/load tests
-- Privacy: All locations use geohash5/geohash6, NO raw coordinates in output

-- ============================================
-- Clean existing data
-- ============================================
TRUNCATE TABLE analytics_events CASCADE;
TRUNCATE TABLE vouchers CASCADE;
TRUNCATE TABLE wallet_entries CASCADE;
TRUNCATE TABLE reels CASCADE;
TRUNCATE TABLE qr_scans CASCADE;
TRUNCATE TABLE qr_codes CASCADE;
TRUNCATE TABLE offers CASCADE;
TRUNCATE TABLE places CASCADE;
TRUNCATE TABLE otp_codes CASCADE;
TRUNCATE TABLE magic_links CASCADE;
TRUNCATE TABLE sessions CASCADE;
TRUNCATE TABLE users CASCADE;

-- ============================================
-- Users (Test Creators)
-- ============================================
INSERT INTO users (id, email, phone, nickname, avatar_url, role, is_verified, is_active, last_geohash5, created_at, updated_at)
VALUES
  ('user_creator_1', 'creator1@zzik.live', '01012345001', '서울크리에이터', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde', 'CREATOR', true, true, 'wydm6', NOW() - INTERVAL '30 days', NOW()),
  ('user_creator_2', 'creator2@zzik.live', '01012345002', '강남인플루언서', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330', 'CREATOR', true, true, 'wydm3', NOW() - INTERVAL '25 days', NOW()),
  ('user_creator_3', 'creator3@zzik.live', '01012345003', '홍대나노', 'https://images.unsplash.com/photo-1527980965255-d3b416303d12', 'CREATOR', true, true, 'wydm7', NOW() - INTERVAL '20 days', NOW()),
  ('user_business_1', 'business1@zzik.live', '01012345101', '강남카페', NULL, 'BUSINESS', true, true, 'wydm3', NOW() - INTERVAL '60 days', NOW()),
  ('user_business_2', 'business2@zzik.live', '01012345102', '홍대식당', NULL, 'BUSINESS', true, true, 'wydm7', NOW() - INTERVAL '50 days', NOW());

-- ============================================
-- Places (Seoul Locations with PostGIS)
-- ============================================
INSERT INTO places (id, name, address, location, geohash6, category, phone, business_hour, image_url, is_active, created_at, updated_at)
VALUES
  -- Gangnam (37.4979, 127.0276)
  ('place_gangnam_cafe', '강남 시그니처 카페', '서울 강남구 강남대로 123', ST_GeogFromText('POINT(127.0276 37.4979)'), 'wydm3w', 'CAFE', '02-123-4567', '10:00-22:00', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24', true, NOW() - INTERVAL '60 days', NOW()),
  
  -- Hongdae (37.5563, 126.9242)
  ('place_hongdae_restaurant', '홍대 퓨전 레스토랑', '서울 마포구 와우산로 234', ST_GeogFromText('POINT(126.9242 37.5563)'), 'wydm7y', 'RESTAURANT', '02-234-5678', '11:00-23:00', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', true, NOW() - INTERVAL '50 days', NOW()),
  
  -- Itaewon (37.5345, 126.9952)
  ('place_itaewon_bar', '이태원 루프탑 바', '서울 용산구 이태원로 345', ST_GeogFromText('POINT(126.9952 37.5345)'), 'wydm6d', 'BAR', '02-345-6789', '18:00-02:00', 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2', true, NOW() - INTERVAL '45 days', NOW()),
  
  -- Myeongdong (37.5636, 126.9834)
  ('place_myeongdong_shop', '명동 편집숍', '서울 중구 명동길 456', ST_GeogFromText('POINT(126.9834 37.5636)'), 'wydm6h', 'SHOP', '02-456-7890', '10:30-21:00', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8', true, NOW() - INTERVAL '40 days', NOW()),
  
  -- Gangnam 2 (37.5012, 127.0396)
  ('place_gangnam_gym', '강남 피트니스', '서울 강남구 테헤란로 567', ST_GeogFromText('POINT(127.0396 37.5012)'), 'wydm3x', 'FITNESS', '02-567-8901', '06:00-23:00', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48', true, NOW() - INTERVAL '35 days', NOW());

-- ============================================
-- QR Codes (SHA-256 hashed)
-- ============================================
INSERT INTO qr_codes (id, place_id, code, is_active, expires_at, created_at, updated_at)
VALUES
  ('qr_gangnam_cafe_1', 'place_gangnam_cafe', 'a3b8c9d1e2f34567890abcdef1234567890abcdef1234567890abcdef123456', true, NOW() + INTERVAL '30 days', NOW() - INTERVAL '10 days', NOW()),
  ('qr_hongdae_restaurant_1', 'place_hongdae_restaurant', 'b4c9d0e1f23456789012bcdef0123456789abcdef0123456789abcdef012345', true, NOW() + INTERVAL '30 days', NOW() - INTERVAL '9 days', NOW()),
  ('qr_itaewon_bar_1', 'place_itaewon_bar', 'c5d0e1f234567890123cdef9012345678901bcdef9012345678901bcdef90123', true, NOW() + INTERVAL '30 days', NOW() - INTERVAL '8 days', NOW()),
  ('qr_myeongdong_shop_1', 'place_myeongdong_shop', 'd6e1f2345678901234def890123456789012cdef890123456789012cdef8012', true, NOW() + INTERVAL '30 days', NOW() - INTERVAL '7 days', NOW()),
  ('qr_gangnam_gym_1', 'place_gangnam_gym', 'e7f23456789012345ef78901234567890123def7890123456789012 3def7901', true, NOW() + INTERVAL '30 days', NOW() - INTERVAL '6 days', NOW());

-- ============================================
-- Offers (Test Scenarios)
-- ============================================
INSERT INTO offers (id, place_id, user_id, title, description, reward, status, qr_scanned_at, receipt_url, verified_at, expires_at, created_at, updated_at)
VALUES
  -- PENDING (accepted, not scanned yet)
  ('offer_pending_1', 'place_gangnam_cafe', 'user_creator_1', '강남 카페 라떼 체험', '시그니처 라떼 촬영 후 LIVE 릴스 업로드', 5000, 'PENDING', NULL, NULL, NULL, NOW() + INTERVAL '7 days', NOW() - INTERVAL '2 days', NOW()),
  
  -- IN_PROGRESS (QR scanned, awaiting receipt/reel)
  ('offer_in_progress_1', 'place_hongdae_restaurant', 'user_creator_2', '홍대 레스토랑 런치 체험', '퓨전 런치 코스 촬영', 8000, 'IN_PROGRESS', NOW() - INTERVAL '2 hours', NULL, NULL, NOW() + INTERVAL '5 days', NOW() - INTERVAL '3 days', NOW()),
  
  -- COMPLETED (all verification done, awaiting reward)
  ('offer_completed_1', 'place_itaewon_bar', 'user_creator_3', '이태원 루프탑 바 야경 촬영', '루프탑 뷰 + 칵테일 촬영', 10000, 'COMPLETED', NOW() - INTERVAL '1 day', 'https://storage.zzik.live/receipts/itaewon_bar_20251112.jpg', NOW() - INTERVAL '12 hours', NOW() + INTERVAL '3 days', NOW() - INTERVAL '4 days', NOW()),
  
  -- REWARDED (reward issued)
  ('offer_rewarded_1', 'place_myeongdong_shop', 'user_creator_1', '명동 편집숍 신상품 소개', '신상품 3종 촬영', 6000, 'REWARDED', NOW() - INTERVAL '3 days', 'https://storage.zzik.live/receipts/myeongdong_20251110.jpg', NOW() - INTERVAL '2 days', NOW() + INTERVAL '10 days', NOW() - INTERVAL '5 days', NOW()),
  
  -- EXPIRED
  ('offer_expired_1', 'place_gangnam_gym', 'user_creator_2', '강남 피트니스 PT 체험', '개인 PT 세션 촬영', 7000, 'EXPIRED', NULL, NULL, NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '10 days', NOW());

-- ============================================
-- QR Scans (Test Results)
-- ============================================
INSERT INTO qr_scans (id, qr_code_id, user_id, result, distance, geohash5, scanned_at)
VALUES
  ('qr_scan_success_1', 'qr_hongdae_restaurant_1', 'user_creator_2', 'SUCCESS', 15, 'wydm7', NOW() - INTERVAL '2 hours'),
  ('qr_scan_success_2', 'qr_itaewon_bar_1', 'user_creator_3', 'SUCCESS', 8, 'wydm6', NOW() - INTERVAL '1 day'),
  ('qr_scan_already_used_1', 'qr_myeongdong_shop_1', 'user_creator_1', 'ALREADY_USED', NULL, 'wydm6', NOW() - INTERVAL '3 days'),
  ('qr_scan_expired_1', 'qr_gangnam_gym_1', 'user_creator_2', 'EXPIRED', NULL, 'wydm3', NOW() - INTERVAL '2 days'),
  ('qr_scan_invalid_1', 'qr_gangnam_cafe_1', 'user_creator_3', 'INVALID', NULL, 'wydm3', NOW() - INTERVAL '1 hour');

-- ============================================
-- Reels (LIVE Content)
-- ============================================
INSERT INTO reels (id, user_id, offer_id, video_url, thumbnail_url, duration, caption, hashtags, geohash5, is_published, view_count, created_at, updated_at)
VALUES
  ('reel_itaewon_1', 'user_creator_3', 'offer_completed_1', 'https://mux.zzik.live/reels/itaewon_bar_20251112.mp4', 'https://mux.zzik.live/thumbs/itaewon_bar_20251112.jpg', 12, '이태원 루프탑에서 보는 서울 야경 🌃✨', ARRAY['#이태원루프탑', '#서울야경', '#칵테일'], 'wydm6', true, 245, NOW() - INTERVAL '12 hours', NOW()),
  
  ('reel_myeongdong_1', 'user_creator_1', 'offer_rewarded_1', 'https://mux.zzik.live/reels/myeongdong_shop_20251110.mp4', 'https://mux.zzik.live/thumbs/myeongdong_shop_20251110.jpg', 10, '명동 편집숍 신상품 3종 언박싱 📦', ARRAY['#명동쇼핑', '#신상품', '#편집숍'], 'wydm6', true, 189, NOW() - INTERVAL '2 days', NOW());

-- ============================================
-- Wallet Entries (Transactions)
-- ============================================
INSERT INTO wallet_entries (id, user_id, type, amount, reason, balance_after, offer_id, created_at)
VALUES
  ('wallet_reward_1', 'user_creator_1', 'REWARD', 6000, '명동 편집숍 신상품 소개 체험 완료', 6000, 'offer_rewarded_1', NOW() - INTERVAL '2 days'),
  ('wallet_reward_2', 'user_creator_3', 'REWARD', 10000, '이태원 루프탑 바 야경 촬영 체험 완료', 10000, 'offer_completed_1', NOW() - INTERVAL '12 hours'),
  ('wallet_redeem_1', 'user_creator_1', 'REDEEM', -3000, '스타벅스 아메리카노 바우처 교환', 3000, NULL, NOW() - INTERVAL '1 day'),
  ('wallet_bonus_1', 'user_creator_2', 'BONUS', 1000, '신규 가입 보너스', 1000, NULL, NOW() - INTERVAL '25 days');

-- ============================================
-- Vouchers (Rewards)
-- ============================================
INSERT INTO vouchers (id, user_id, title, description, value, image_url, status, expires_at, redeemed_at, created_at, updated_at)
VALUES
  ('voucher_active_1', 'user_creator_1', '스타벅스 아메리카노', 'Tall 사이즈 아메리카노', 5000, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93', 'ACTIVE', NOW() + INTERVAL '30 days', NULL, NOW() - INTERVAL '3 days', NOW()),
  
  ('voucher_active_2', 'user_creator_3', 'CGV 영화 관람권', '일반 상영관 1매', 12000, 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba', 'ACTIVE', NOW() + INTERVAL '60 days', NULL, NOW() - INTERVAL '5 hours', NOW()),
  
  ('voucher_redeemed_1', 'user_creator_1', '스타벅스 아메리카노', 'Tall 사이즈 아메리카노', 5000, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93', 'REDEEMED', NOW() + INTERVAL '30 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 days', NOW()),
  
  ('voucher_expired_1', 'user_creator_2', 'GS25 편의점 상품권', '5천원권', 5000, 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a', 'EXPIRED', NOW() - INTERVAL '5 days', NULL, NOW() - INTERVAL '40 days', NOW());

-- ============================================
-- Analytics Events (Privacy: geohash5 only)
-- ============================================
INSERT INTO analytics_events (id, event_name, user_id, properties, geohash5, timestamp)
VALUES
  ('event_page_view_1', 'page_view', 'user_creator_1', '{"page": "/pass/map", "referrer": "/"}', 'wydm6', NOW() - INTERVAL '1 hour'),
  ('event_page_view_2', 'page_view', 'user_creator_2', '{"page": "/pass/wallet", "referrer": "/pass/map"}', 'wydm3', NOW() - INTERVAL '45 minutes'),
  ('event_offer_pin_click_1', 'offer_pin_click', 'user_creator_1', '{"place_id": "place_gangnam_cafe", "offer_id": "offer_pending_1"}', 'wydm3', NOW() - INTERVAL '30 minutes'),
  ('event_qr_scan_1', 'qr_scan_result', 'user_creator_3', '{"result": "SUCCESS", "qr_id": "qr_itaewon_bar_1", "distance_m": 8}', 'wydm6', NOW() - INTERVAL '1 day'),
  ('event_voucher_redeem_1', 'voucher_redeem', 'user_creator_1', '{"voucher_id": "voucher_redeemed_1", "value": 5000}', 'wydm6', NOW() - INTERVAL '1 day');

-- ============================================
-- Verification: Check seeded data
-- ============================================
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Places', COUNT(*) FROM places
UNION ALL
SELECT 'QR Codes', COUNT(*) FROM qr_codes
UNION ALL
SELECT 'Offers', COUNT(*) FROM offers
UNION ALL
SELECT 'QR Scans', COUNT(*) FROM qr_scans
UNION ALL
SELECT 'Reels', COUNT(*) FROM reels
UNION ALL
SELECT 'Wallet Entries', COUNT(*) FROM wallet_entries
UNION ALL
SELECT 'Vouchers', COUNT(*) FROM vouchers
UNION ALL
SELECT 'Analytics Events', COUNT(*) FROM analytics_events;

-- Verify geohash indexes
SELECT 'Geohash6 Index Test' as test, COUNT(*) as count 
FROM places 
WHERE geohash6 LIKE 'wydm%';

-- Verify PostGIS queries (radius search example)
SELECT 'PostGIS Radius Test' as test, COUNT(*) as count
FROM places
WHERE ST_DWithin(
  location,
  ST_GeogFromText('POINT(127.0276 37.4979)'), -- Gangnam center
  1000 -- 1km radius
);

-- ============================================
-- Summary
-- ============================================
\echo '========================================';
\echo 'ZZIK LIVE - Test Data Seeded Successfully';
\echo '========================================';
\echo 'Users: 5 (3 creators, 2 businesses)';
\echo 'Places: 5 (with PostGIS geography)';
\echo 'QR Codes: 5 (SHA-256 hashed)';
\echo 'Offers: 5 (all states: PENDING→REWARDED)';
\echo 'QR Scans: 5 (all results: SUCCESS→INVALID)';
\echo 'Reels: 2 (LIVE content samples)';
\echo 'Wallet Entries: 4 (rewards/redeems/bonuses)';
\echo 'Vouchers: 4 (ACTIVE/REDEEMED/EXPIRED)';
\echo 'Analytics Events: 5 (geohash5 privacy-safe)';
\echo '========================================';
\echo 'Ready for k6 smoke/load testing!';
\echo '========================================';
