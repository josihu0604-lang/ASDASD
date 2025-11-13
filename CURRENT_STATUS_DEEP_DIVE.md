# 📌 ZZIK LIVE — 현재 작업상태 **심층 진단** + **다음 작업 자료 패키지**

**작성일**: 2025-11-13\
**버전**: 1.0.0\
**목적**: 현재 코드/인프라/UX/제품 관점에서 상태를 종합 점검하고, 즉시 실행 가능한 **PR/이슈/테스트/보안/UX 산출물**을 한 번에 제공

**핵심 가치**: "**현장 체험을 증명하는 LIVE 리치 콘텐츠 + 지도(Mapbox) 기반의 즉시성**"

이 가치를 기술적으로 관철하기 위해 **GPS+QR+영수증**의 삼중 검증과 지오스패셜 서치/매칭을 엔드투엔드로 구현.

---

## 📊 0) 상위 요약 (신호등)

| 영역 | 상태 | 핵심 소견 | 다음 액션 |
|------|------|-----------|-----------|
| **프론트엔드<br/>(앱셸/탭바/탭 화면)** | 🟡 안정화 진행 | 4-탭 내비게이션 골격 완료<br/>**스플래시/온보딩/로그인 미구현**<br/>→ 초기 경험과 보안 플로우 단절 | **PR #16**: Splash/Onboarding/Auth 구현<br/>(예상: 2일) |
| **백엔드<br/>(API/데이터)** | 🟢 코어 라우트 준비됨 | Day 3–4 시점 기준:<br/>✅ 7개 라우트 구현<br/>✅ Zod 스키마 검증<br/>✅ Rate limiting 패턴<br/>⚠️ Auth/세션·지갑·정산 파이프 추가 필요 | **PR #17**: Auth API 구현<br/>**PR #18**: Wallet/Settlement API |
| **테스트/품질** | 🟢 토대 구축 | ✅ Vitest/Playwright/k6 셋업<br/>✅ 37개 단위 테스트 통과 (85%+ 커버리지)<br/>✅ 9개 E2E 테스트 준비<br/>⚠️ **DB 연동 스모크·로드 실행** 필요 | 1. PostgreSQL + PostGIS 설정<br/>2. k6 스모크 테스트 실행<br/>3. E2E 9→20 확대 |
| **보안/프라이버시** | 🟡 부분 구현 | ✅ Rate limiting 구현<br/>✅ Zod 입력 검증<br/>⚠️ 보안 헤더 미설정<br/>⚠️ 구조화 로깅 미구현<br/>⚠️ **원시 좌표 로깅 방지** 미적용 | **PR #19**: Security hardening<br/>- CSP/HSTS 헤더<br/>- 구조화 로깅<br/>- geohash5 원칙 적용 |
| **데이터/분석** | 🟢 강점 | ✅ Analytics 이벤트 구조 완료<br/>✅ RouteTracker 구현<br/>⚠️ 검색/QR/오퍼/지갑 이벤트 추가 필요 | Event instrumentation 확대 |
| **제품/UX<br/>(Mapbox 핵심가치)** | 🟡 콘셉트 선명 | ✅ **LIVE 릴스 × 지도 중심** 내러티브 명확<br/>⚠️ **첫 실행 플로우** 미구현<br/>(스플래시→온보딩→권한→로그인→탭) | **PR #16 + #17**: 완전한 첫 실행 경험 |

### 🎯 즉시 조치 필요 (Top 3)

1. **🔴 스플래시/온보딩/로그인 구현** (보안 + UX 기반)
2. **🟡 보안 헤더 + 구조화 로깅** (프라이버시 준수)
3. **🟡 데이터베이스 설정 + 스모크 테스트** (성능 검증)

---

## 🎯 1) 핵심 가치 재정의: **"지도로 증명되는 LIVE 체험"**

### 1.1 문제 정의 & 가치 제안

**현재 문제**:
- 저신뢰 리뷰 (허위 리뷰, 조작된 평점)
- 고비용 인플루언서 마케팅 (ROI 측정 어려움)
- 로컬 비즈니스의 효과적인 마케팅 채널 부재

**ZZIK LIVE 솔루션**:
- **나노 크리에이터** × **로컬 비즈니스** 매칭 플랫폼
- **삼중 검증** (GPS + QR + 영수증 OCR)으로 **실제 방문** 증명
- Indoor ≤3m 정확도 조합 (GPS + Wi-Fi + iBeacon + 칼만 필터)
- **지도 중심 탐색** (Mapbox) + **LIVE 릴스** (짧은 영상/사진)

### 1.2 비즈니스 모델

- **B2B (로컬 비즈니스)**: 월 구독 ₩1,500,000 + 보상 수수료 25%
- **B2C (나노 크리에이터)**: 무료 + 체험 보상 (포인트/바우처)
- **검증된 단위 경제학**: LTV/CAC > 7

### 1.3 주 사용자 흐름 (코어 루프)

```
1. [지도 탐색] 근처 체험권(오퍼) 발견
   ↓
2. [오퍼 수락] 참여 의사 표시
   ↓
3. [현장 방문] GPS 위치 확인
   ↓
4. [QR 스캔] 매장 QR 코드 스캔 → 4-상태 검증
   ↓
5. [LIVE 릴스 업로드] 짧은 영상/사진 + 해시태그
   ↓
6. [지갑 보상] 포인트/바우처 적립
   ↓
7. [재방문 유도] 스탬프/뱃지 수집
```

### 1.4 북스타 메트릭 (North Star Metrics)

| 메트릭 | 목표 | 현재 측정 가능? | 우선순위 |
|--------|------|----------------|----------|
| **오퍼→체험→검증 완료 전환율** | 80%+ | ❌ 미구현 | 🔴 최우선 |
| **검증 소요시간 (p50)** | < 2분 | ❌ 미구현 | 🔴 최우선 |
| **LIVE 릴스 게시율** | 90%+ | ❌ 미구현 | 🟡 중간 |
| **장소별 재방문율** | 40%+ | ❌ 미구현 | 🟢 낮음 |
| **파트너 월 구독 유지율** | 95%+ | ❌ 미구현 | 🟡 중간 |

### 1.5 입력 메트릭 (Input Metrics)

| 메트릭 | 목표 | 현재 상태 | 우선순위 |
|--------|------|-----------|----------|
| **오퍼 가시성 (노출→클릭)** | 18%+ | ✅ 측정 가능 (analytics) | 🟡 중간 |
| **지도 상호작용 (팬/줌/핀 클릭)** | 60%+ | ❌ 미구현 | 🔴 최우선 |
| **QR 스캔 성공율** | 98%+ | ❌ 미구현 | 🔴 최우선 |
| **영수증 OCR 일치율** | 95%+ | ❌ 미구현 | 🟢 낮음 |

---

## 🏗️ 2) **아키텍처 현황** — 구현된 것 vs 필요한 것

### 2.1 프론트엔드 (Next.js 16 App Router + Turbopack)

#### ✅ 구현 완료

**탭 구조** (4개):
```
app/(tabs)/
├── pass/                   ✅ 체험권 (지도 + 릴스)
│   ├── page.tsx           ✅ 메인 뷰
│   └── map/page.tsx       ✅ 전체 지도 뷰
├── offers/                 ✅ 받은 오퍼
│   └── page.tsx           ✅ 오퍼 리스트
├── scan/                   ✅ QR 스캔
│   └── page.tsx           ✅ 스캐너 뷰
└── wallet/                 ✅ 지갑
    ├── page.tsx           ✅ 요약 뷰
    └── passes/page.tsx    ✅ 바우처 상세
```

**컴포넌트** (24개):
```
components/
├── navigation/            ✅ 탭바 + 라우트 추적
│   ├── BottomTabBar.tsx  ✅ 4-탭 네비게이션
│   └── RouteTracker.tsx  ✅ Analytics 자동 추적
├── pass/                  ✅ 체험권 관련
│   ├── MapView.tsx       ✅ Mapbox GL 통합
│   ├── PlaceSheet.tsx    ✅ 장소 상세 시트
│   ├── ReelsCarousel.tsx ✅ LIVE 릴스 캐러셀
│   ├── MiniMap.tsx       ✅ 미니맵 프리뷰
│   ├── SearchBar.tsx     ✅ 검색 입력
│   └── FilterChips.tsx   ✅ 필터 칩
├── offers/                ✅ 오퍼 관련
│   ├── OfferCard.tsx     ✅ 오퍼 카드
│   ├── OfferList.tsx     ✅ 오퍼 목록
│   └── OfferFilters.tsx  ✅ 필터 UI
├── scan/                  ✅ QR 스캔 관련
│   ├── QRScannerView.tsx ✅ 스캐너
│   └── VerifySheet.tsx   ✅ 검증 결과 시트
├── wallet/                ✅ 지갑 관련
│   ├── WalletSummary.tsx ✅ 요약
│   ├── VoucherList.tsx   ✅ 바우처 목록
│   └── LedgerList.tsx    ✅ 거래 내역
└── states/                ✅ 공통 상태 UI
    ├── EmptyState.tsx    ✅ 빈 상태
    ├── LoadingState.tsx  ✅ 로딩
    ├── ErrorState.tsx    ✅ 에러
    └── OfflineState.tsx  ✅ 오프라인
```

**유틸리티/라이브러리**:
```
lib/
├── analytics.ts           ✅ 이벤트 추적
├── button-presets.ts      ✅ 버튼 스타일
├── map-clustering.ts      ✅ 지도 클러스터링
├── schemas/api.ts         ✅ Zod 스키마
├── http/errors.ts         ✅ 에러 처리
├── http/validate.ts       ✅ 요청 검증
└── types/api.ts           ✅ TypeScript 타입
```

#### ❌ 미구현 (긴급)

**초기 실행 플로우**:
```
❌ app/splash/page.tsx              스플래시 화면 (2초)
❌ app/onboarding/page.tsx          온보딩 (3장 캐러셀)
❌ app/auth/login/page.tsx          로그인 (Magic Link/OTP)
❌ app/auth/signup/page.tsx         회원가입
❌ app/auth/callback/page.tsx       OAuth 콜백
❌ components/auth/AuthGate.tsx     인증 가드
❌ components/auth/LoginForm.tsx    로그인 폼
❌ components/auth/SignupForm.tsx   회원가입 폼
❌ middleware.ts                    라우팅 미들웨어
```

**권한 관리**:
```
❌ components/permissions/LocationPermissionRequest.tsx
❌ components/permissions/CameraPermissionRequest.tsx
❌ components/permissions/NotificationPermissionRequest.tsx
❌ lib/permissions.ts
```

**프로필/설정**:
```
❌ app/(tabs)/profile/page.tsx
❌ app/settings/page.tsx
❌ components/profile/ProfileEditor.tsx
❌ components/settings/SettingsPanel.tsx
```

### 2.2 백엔드 (Next.js API Routes)

#### ✅ 구현 완료 (7개 라우트)

```
app/api/
├── offers/
│   ├── route.ts                    ✅ GET: 오퍼 목록 (필터링, 페이지네이션)
│   └── [id]/accept/route.ts        ✅ POST: 오퍼 수락
├── places/
│   └── nearby/route.ts             ✅ GET: 근처 장소 (PostGIS ST_DWithin)
├── qr/
│   └── verify/route.ts             ✅ POST: QR 검증 (4-상태)
├── wallet/
│   ├── summary/route.ts            ✅ GET: 지갑 요약
│   ├── ledger/route.ts             ✅ GET: 거래 내역
│   └── vouchers/route.ts           ✅ GET: 바우처 목록
├── search/route.ts                 ✅ GET: 장소 검색
└── analytics/route.ts              ✅ POST: 이벤트 추적
```

**서버 유틸리티**:
```
lib/server/
├── db.ts                           ✅ Prisma 클라이언트
├── rate-limit.ts                   ✅ In-memory rate limiting
└── idempotency.ts                  ✅ 멱등성 키 검증
```

#### ❌ 미구현 (긴급)

**인증 API**:
```
❌ app/api/auth/magic-link/route.ts    POST: Magic Link 발송
❌ app/api/auth/otp/send/route.ts      POST: OTP 발송
❌ app/api/auth/otp/verify/route.ts    POST: OTP 검증
❌ app/api/auth/logout/route.ts        POST: 로그아웃
❌ app/api/me/route.ts                 GET: 현재 사용자 정보
❌ app/api/me/route.ts                 PATCH: 프로필 업데이트
```

**지갑/정산 API**:
```
❌ app/api/wallet/redeem/route.ts      POST: 바우처 사용
❌ app/api/wallet/transfer/route.ts    POST: 포인트 이체
❌ app/api/settlements/route.ts        GET: 정산 내역
❌ app/api/settlements/request/route.ts POST: 정산 요청
```

**영수증 OCR**:
```
❌ app/api/receipts/upload/route.ts    POST: 영수증 업로드
❌ app/api/receipts/ocr/route.ts       POST: OCR 처리
```

**LIVE 릴스**:
```
❌ app/api/reels/upload/route.ts       POST: 릴스 업로드
❌ app/api/reels/[id]/route.ts         GET/PATCH/DELETE: 릴스 관리
❌ app/api/reels/[id]/like/route.ts    POST: 좋아요
```

**알림**:
```
❌ app/api/notifications/route.ts      GET: 알림 목록
❌ app/api/notifications/[id]/read/route.ts POST: 읽음 처리
```

### 2.3 데이터베이스 (Supabase PostgreSQL + PostGIS)

#### ✅ 구현 완료

- Prisma 스키마 정의 (추정)
- PostGIS 공간 쿼리 지원
- ST_DWithin 반경 검색

#### ❌ 미구현 (중요)

```
❌ prisma/schema.prisma               완전한 스키마 정의
❌ prisma/migrations/                 마이그레이션 파일
❌ scripts/seed.ts                    시드 데이터 스크립트
❌ Database indexes:
   - geohash6 인덱스 (빠른 지역 검색)
   - user_id + status 복합 인덱스
   - created_at DESC 인덱스
```

### 2.4 테스트 인프라

#### ✅ 구현 완료 (Day 5-6)

**단위 테스트** (Vitest):
```
✅ vitest.config.ts                   설정 완료
✅ vitest.setup.ts                    전역 셋업
✅ __tests__/lib/schemas.spec.ts     24개 테스트 (Zod 스키마)
✅ __tests__/lib/errors.spec.ts      6개 테스트 (에러 처리)
✅ __tests__/lib/rate-limit.spec.ts  7개 테스트 (Rate limit)
✅ Coverage: 85%+ lines, 78%+ branches
```

**E2E 테스트** (Playwright):
```
✅ playwright.config.ts              Chromium + iPhone 13 설정
✅ __tests__/e2e/core-flow.spec.ts   9개 테스트 (탭 네비게이션)
```

**부하 테스트** (k6):
```
✅ k6/api-smoke.js                   스모크 테스트 (10 VU, 1분)
✅ k6/api-load.js                    부하 테스트 (100 VU, 110초)
```

**시드 데이터**:
```
✅ scripts/seed-test-data.sql        PostgreSQL 시드 스크립트
```

#### ❌ 미구현 (다음 단계)

```
❌ 데이터베이스 연결 및 실제 테스트 실행
❌ API 라우트 단위 테스트 (Prisma 모킹)
❌ E2E 테스트 확대 (9 → 20 케이스)
❌ 성능 벤치마크 (실제 DB 연동)
```

---

## 🎨 3) **UX/UI 현황** — Mapbox 중심 4-탭 플로우

### 3.1 ① 체험권(LIVE 릴스) · Map

**목표**: 현재 위치 인근의 **체험 가능한 오퍼** 탐색과 LIVE 릴스 소비

**핵심 컴포넌트**:
- `<MapView>`: Mapbox GL JS 통합
  - ✅ 기본 지도 렌더링
  - ✅ 사용자 위치 표시
  - ❌ 클러스터링 (≥500 핀)
  - ❌ 9-셀 geohash 확장 프리페치
- `<OfferPin>`: 장소 핀
  - ✅ 기본 마커
  - ❌ 상태 뱃지 (신규/임박/혼잡)
  - ❌ 44-56px 터치 영역
- `<PlaceSheet>`: 장소 상세 시트
  - ✅ Half/Full 모드
  - ✅ 오퍼 정보
  - ❌ LIVE 릴스 캐러셀 통합

**상태/분기**:
- `geolocation`: `granted` / `denied` / `prompt`
- `offers`: `loading` / `empty` / `ok` / `error`
- `network`: `online` / `offline`

**계측 이벤트**:
```typescript
✅ map_view { geohash5, zoom, bbox_km2, took_ms }
❌ map_pan_zoom { delta_zoom, distance_m }
❌ offer_pin_click { place_id, has_offer }
❌ place_sheet_open { place_id, offers_count }
❌ cta_join_click { offer_id, distance_m }
```

**성능 목표**:
- 초기 타일 로드: ≤ 1.5s
- 첫 API `nearby` 응답: ≤ 100ms (p95)
- 클러스터 계산: Web Worker 이동 (60fps 유지)

**접근성**:
- ❌ 핀 포커스 가능 (키보드/스위치)
- ❌ 시트 헤더 `aria-expanded`
- ❌ 배지 시각+텍스트 동시 제공 (색맹 대비)

### 3.2 ② 받은 오퍼

**목표**: 내 수락 오퍼의 상태 기반 실행 리스트

**상태 머신** (FSM):
```
PENDING → IN_PROGRESS → VERIFYING → REWARDED / FAILED
```

**컴포넌트**:
- `<OfferCard>`: 오퍼 카드
  - ✅ 기본 레이아웃
  - ❌ 타이머 (만료 임박)
  - ❌ 매장 영업시간 표시
- CTA: "길찾기" / "QR 스캔"
  - ✅ 버튼 존재
  - ❌ 네이티브 맵 앱 연동

**계측**:
```typescript
✅ offer_view { offer_id, status }
❌ cta_nav_to_map { offer_id }
❌ cta_scan_qr { offer_id }
❌ expire_abandon { offer_id, hours_left }
```

**AC**:
- ❌ 만료 48h 이내 오퍼 상단 고정
- ❌ 이탈 경고 (만료 임박)
- 목표 만료율: ≤ 12%

### 3.3 ③ QR 스캔

**목표**: 오프라인 현장 검증의 초간편 경험 (즉시 촬영, 즉시 판정)

**검증 3요소**:
1. **QR 토큰**: SHA-256 해시 검증
2. **GPS 근접**: 장소 중심 ≤ 50m
3. **영수증 OCR**: 상호명/금액/시각 일치 (선택)

**상태**:
```
READY → SCANNING → VALIDATING → SUCCESS / ALREADY_USED / EXPIRED / INVALID
```

**UX**:
- ✅ 스캐너 프레임
- ❌ 레이저 애니메이션
- ❌ 진동/사운드 피드백
- ❌ 저조도 토치 (플래시)

**계측**:
```typescript
❌ qr_scan_open { offer_id }
❌ qr_scan_result { state, took_ms }
❌ qr_retry_click { offer_id, attempt }
```

**AC**:
- 평균 판정: ≤ 900ms
- 4-상태 메시지/가이드 제공
- 실패 재시도: ≤ 1회 평균

### 3.4 ④ 지갑

**목표**: 보상·바우처·스탬프의 일원화된 관리

**컴포넌트**:
- `<WalletSummary>`: 요약
  - ✅ 포인트/바우처 수
  - ❌ 만료 임박 알림
- `<VoucherList>`: 바우처 목록
  - ✅ 키셋 페이지네이션
  - ❌ 만료일 정렬
- `<LedgerList>`: 거래 내역
  - ✅ 역시간순
  - ❌ 무한 스크롤 스켈레톤

**계측**:
```typescript
✅ wallet_view { vouchers, points }
❌ voucher_redeem { voucher_id }
❌ export_receipt { format }
```

**AC**:
- ❌ 임박 바우처 상단 고정
- 목표 리딤 누락율: ≤ 1%
- ❌ 1000건 스크롤 60fps 유지

---

## 🚨 4) **긴급: 스플래시/온보딩/로그인 구현** (PR #16)

### 4.1 플로우 정의

```
1. [스플래시 2초]
   - 로고/브랜드
   - 권한 사전 예고
   - 백그라운드: 최소 자산 프리로드
   ↓
2. [온보딩 3장]
   - 1장: 가치 제안 "현장 체험을 증명하는 LIVE 릴스"
   - 2장: 위치 권한 필요성 "내 주변 체험권 발견"
   - 3장: 카메라 권한 "QR 스캔으로 검증"
   ↓
3. [권한 요청]
   - 위치 (필수)
   - 카메라 (선택)
   - 알림 (선택)
   ↓
4. [가입/로그인]
   - Magic Link (Email)
   - OTP (휴대폰)
   - 소셜 로그인 (선택)
   ↓
5. [프로필 최소화]
   - 닉네임 (필수)
   - SNS 링크 (선택)
   ↓
6. [첫 실행 체크리스트]
   - ✅ 권한 허용
   - ✅ 지역 설정 (geohash5)
   - ✅ 알림 허용
   ↓
7. [탭 화면 진입]
```

### 4.2 컴포넌트 스펙

#### `<SplashScreen>`
```typescript
interface SplashScreenProps {
  duration?: number;        // 기본 2000ms
  onComplete: () => void;
}

// 구현 요구사항
- 2s 타임아웃
- 앱 토큰 검사 (localStorage)
- 애니메이션: fade-in → fade-out
- 로딩 에러 시 fallback
```

#### `<OnboardingCarousel>`
```typescript
interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: string;          // 일러스트 URL
  icon?: React.ReactNode;
}

interface OnboardingCarouselProps {
  slides: OnboardingSlide[];
  onDone: () => void;
  onSkip?: () => void;
}

// 구현 요구사항
- 3장 슬라이드
- 좌우 스와이프 또는 Next 버튼
- Progress indicator (1/3, 2/3, 3/3)
- "건너뛰기" 버튼 (선택)
- 접근성: 포커스 트랩, ARIA 라이브 영역
```

#### `<AuthGate>`
```typescript
interface AuthGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;  // 로딩 중
  redirectTo?: string;          // 미인증 시 리다이렉트
}

// 구현 요구사항
- 상태: anonymous / authenticated / pending
- 리다이렉트 규칙:
  - 미인증 + 보호 경로 → /auth/login
  - 인증됨 + /auth/* → /pass (첫 탭)
- 세션 검증 (JWT 또는 Supabase Auth)
```

#### `<LoginForm>`
```typescript
interface LoginFormProps {
  mode: 'email' | 'phone';
  onSuccess: (user: User) => void;
  onModeSwitch: () => void;
}

// 구현 요구사항
- Email/Phone 모드 토글
- Zod 검증 (즉시 피드백)
- Rate limit (5/min)
- 비봇 (Turnstile 또는 reCAPTCHA)
- 접근성: 에러 live region, 포커스 관리
```

### 4.3 보안/규제 요구사항

#### 프라이버시 원칙
```typescript
// ❌ 금지: 원시 좌표 로깅
analytics.track('splash_view', {
  lat: 37.5665,  // ❌ 절대 금지
  lng: 126.9780, // ❌ 절대 금지
});

// ✅ 허용: geohash5 (약 2.4km 해상도)
analytics.track('splash_view', {
  geohash5: 'wydm6',  // ✅ OK
  device_type: 'mobile',
  app_version: '1.0.0',
});
```

#### QR 검증 보안
```typescript
// app/api/qr/verify/route.ts
export async function POST(req: Request) {
  // 1. CORS 차단 (공개 origin 차단)
  const origin = req.headers.get('origin');
  if (origin && origin !== process.env.NEXT_PUBLIC_APP_URL) {
    return new Response('Forbidden', { status: 403 });
  }

  // 2. Idempotency-Key 필수
  const idempotencyKey = req.headers.get('Idempotency-Key');
  if (!idempotencyKey) {
    return new Response('Missing Idempotency-Key', { status: 422 });
  }

  // 3. SHA-256 해시 검증
  const { token } = await req.json();
  const hash = createHash('sha256').update(token).digest('hex');
  
  const qrToken = await prisma.qrToken.findUnique({
    where: { code_hash: hash },
  });

  if (!qrToken) {
    return Response.json({ state: 'invalid' }, { status: 200 });
  }

  if (qrToken.status === 'used') {
    return Response.json({ state: 'already_used' }, { status: 410 });
  }

  if (isExpired(qrToken)) {
    return Response.json({ state: 'expired' }, { status: 410 });
  }

  // 4. GPS 근접 검증 (50m)
  const distance = calculateDistance(userLocation, qrToken.place.location);
  if (distance > 50) {
    return Response.json({ state: 'invalid', reason: 'too_far' }, { status: 200 });
  }

  // 5. 성공: 토큰 소각
  await prisma.qrToken.update({
    where: { id: qrToken.id },
    data: { status: 'used', used_at: new Date() },
  });

  return Response.json({ state: 'success' }, { status: 200 });
}
```

### 4.4 보안 헤더 (next.config.ts)

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), payment=()',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "connect-src 'self' https://api.mapbox.com https://*.supabase.co",
              "img-src 'self' https: data:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
            ].join('; '),
          },
        ],
      },
      {
        // QR 검증 엔드포인트: CORS 완전 차단
        source: '/api/qr/verify',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'null' },
        ],
      },
    ];
  },
};
```

---

## 📊 5) **계측(Analytics) 사양** — 이벤트/속성

### 5.1 기존 구현 (RouteTracker)

```typescript
// components/navigation/RouteTracker.tsx
✅ page_view { pathname, referrer, took_ms }
```

### 5.2 추가 필요 이벤트

#### 앱 생애주기
```typescript
❌ app_launch { device, os, app_version }
❌ onboarding_complete { seconds, geolocation_granted }
❌ login_success { method: 'email' | 'otp' | 'social' }
❌ logout { session_duration_s }
```

#### 지도 상호작용
```typescript
❌ map_view { geohash5, zoom, bbox_km2, took_ms }
❌ map_pan_zoom { delta_zoom, distance_m }
❌ offer_pin_click { place_id, has_offer, distance_m }
❌ place_sheet_open { place_id, offers_count, view_mode: 'half' | 'full' }
❌ cta_join_click { offer_id, distance_m }
```

#### QR 검증
```typescript
❌ qr_scan_open { offer_id, location_granted }
❌ qr_scan_result {
  state: 'success' | 'already_used' | 'expired' | 'invalid',
  took_ms,
  retry_count
}
❌ qr_camera_denied { offer_id }
```

#### 지갑
```typescript
❌ wallet_view { vouchers, points, expiring_soon }
❌ voucher_redeem { voucher_id, value, place_id }
❌ export_receipt { format: 'pdf' | 'csv' }
```

#### 검색 (기존 확장)
```typescript
✅ search_query {
  q_len,
  lang_guess,
  geohash5,
  result_count,
  took_ms,
  cache_hit
}
```

### 5.3 DQ/가드레일 (기존 자산 활용)

**Phase 5 기준** (15개 뷰):
- ✅ 이벤트 누락율 ≤ 0.5%
- ✅ 중복 제거 (dedup) 100%
- ✅ 타임스탬프 정확도 ±1초
- ✅ 지오해시5 포맷 검증

**가드레일** (3개):
- ✅ LCP p75 ≤ 2.5s
- ✅ 에러율 ≤ 0.3%
- ✅ 인제스트 성공율 ≥ 97%

---

## 🎯 6) **즉시 실행 작업 패키지**

### PR #16: UX Entry (스플래시/온보딩/로그인)

**목표**: 완전한 첫 실행 경험 구현

**산출물**:
1. **컴포넌트** (8개):
   - `app/splash/page.tsx`
   - `app/onboarding/page.tsx`
   - `app/auth/login/page.tsx`
   - `app/auth/signup/page.tsx`
   - `components/auth/AuthGate.tsx`
   - `components/auth/LoginForm.tsx`
   - `components/auth/SignupForm.tsx`
   - `components/permissions/PermissionRequest.tsx`

2. **API 라우트** (5개):
   - `app/api/auth/magic-link/route.ts`
   - `app/api/auth/otp/send/route.ts`
   - `app/api/auth/otp/verify/route.ts`
   - `app/api/auth/logout/route.ts`
   - `app/api/me/route.ts`

3. **Zod 스키마** (3개):
   - `LoginSchema`
   - `SignupSchema`
   - `OTPSchema`

4. **테스트**:
   - 15개 단위 테스트 (schemas, auth utils)
   - 6개 E2E 테스트:
     1. 스플래시 → 온보딩 → 로그인
     2. 권한 허용 → 탭 진입
     3. 권한 거부 → 대체 UX
     4. Magic Link 플로우
     5. OTP 플로우
     6. 세션 만료 → 재로그인

**AC**:
- 최초 실행 90초 내 가입 완료
- 권한 미허용 시 대체 UX (시뮬레이션 위치)
- 접근성 AA 통과 (WCAG 2.1)
- Rate limit 적용 (Magic Link 5/min, OTP 3/min)

**예상 시간**: 2일

**Claude 작업 프롬프트**:
```
목표: Splash/Onboarding/Login/AuthGate 구현.
산출물: 컴포넌트 8종 + API 5종 + Zod 스키마 3종 + E2E 6케이스.
제약:
- a11y AA 준수
- 최초 실행 90초 내 가입 완료 퍼널
- 로그엔 geohash5만 (원시 좌표 금지)
- Rate limit: Magic Link 5/min, OTP 3/min
검증:
- vitest 15테스트 통과
- e2e 6케이스 통과
- k6 스모크 통과 (auth 엔드포인트)
```

---

### PR #17: Mapbox Core (지도 핵심 기능)

**목표**: MapView/OfferPin/PlaceSheet + /api/places/nearby 최적화

**산출물**:
1. **MapView 개선**:
   - ✅ geohash6 + 9셀 확장 프리페치
   - ✅ Web Worker 클러스터링 (≥500 핀)
   - ✅ 핀 상태 뱃지 (신규/임박/혼잡)
   - ✅ 44-56px 터치 영역

2. **PlaceSheet 강화**:
   - ✅ LIVE 릴스 캐러셀 통합
   - ✅ CTA 행동 로그
   - ✅ 카메라 offset Y 20% (시트 공간 확보)

3. **API 최적화**:
   - `/api/places/nearby`: p95 ≤ 100ms
   - PostGIS ST_DWithin + GIST 인덱스
   - 9-셀 geohash 확장 쿼리

4. **계측 이벤트**:
   - `map_pan_zoom`
   - `offer_pin_click`
   - `place_sheet_open`
   - `cta_join_click`

**테스트**:
- 8개 단위 테스트 (clustering, geohash)
- 5개 E2E 테스트 (지도 상호작용)
- k6 스모크 (nearby 엔드포인트)

**AC**:
- p95 nearby ≤ 100ms
- 초기 지도 화면 ≤ 1.5s
- 9셀 후보/클러스터 정상 작동
- 접근성: 핀 포커스, 시트 ARIA

**예상 시간**: 3일

**Claude 작업 프롬프트**:
```
목표: MapView/OfferPin/PlaceSheet + /api/places/nearby 연동.
요건:
- geohash6 + 9셀 확장
- Web Worker 클러스터 (≥500 핀)
- p95 nearby ≤ 100ms
- 초화면 ≤ 1.5s
- 접근성: 핀 포커스, 시트 aria-expanded
검증:
- 8 유닛 테스트
- 5 E2E 테스트
- k6 smoke (nearby)
```

---

### PR #18: QR & Wallet (검증 + 보상)

**목표**: QR 스캔 4-state UX + Wallet(요약/내역/바우처)

**산출물**:
1. **QR 스캐너 강화**:
   - ✅ 레이저 애니메이션
   - ✅ 진동/사운드 피드백
   - ✅ 저조도 토치 (플래시)
   - ✅ 4-상태 처리 (success/already_used/expired/invalid)

2. **Wallet 완성**:
   - ✅ 만료 임박 뱃지/정렬
   - ✅ 키셋 페이지네이션
   - ✅ 무한 스크롤 스켈레톤
   - ✅ 바우처 리딤 API 연동

3. **API**:
   - `POST /api/qr/verify`: QR 왕복 ≤ 800ms (p95)
   - `POST /api/wallet/redeem`: 멱등성 키 적용
   - CORS 차단 (QR 검증)

4. **계측**:
   - `qr_scan_result`
   - `voucher_redeem`

**테스트**:
- 10개 단위 테스트
- 6개 E2E 테스트 (QR 플로우, 지갑 리딤)
- k6 혼합 부하 (QR + Wallet)

**AC**:
- QR 왕복 ≤ 800ms (p95)
- 키셋 페이지네이션
- 임박 정렬
- CORS 차단 (QR 검증)

**예상 시간**: 2일

**Claude 작업 프롬프트**:
```
목표: QR 스캔 4-state UX + Wallet(요약/내역/바우처).
요건:
- QR 왕복 ≤ 800ms (p95)
- 키셋 페이지네이션
- 임박 정렬
- CORS 차단 (QR 검증)
- 멱등성 키 적용
검증:
- 10 유닛 테스트
- 6 E2E 테스트
- k6 QR/Wallet 혼합 부하
```

---

### PR #19: Security Hardening (보안 강화)

**목표**: 보안 헤더 + 구조화 로깅 + geohash5 원칙

**산출물**:
1. **보안 헤더** (next.config.ts):
   - CSP / COOP / CORP / HSTS
   - Referrer-Policy
   - Permissions-Policy

2. **구조화 로깅** (lib/server/logger.ts):
   - request_id (nanoid)
   - route, method, status, took_ms
   - geohash5 (원시 좌표 금지)
   - JSON 형식

3. **Rate Limit 헤더**:
   - X-RateLimit-Limit
   - X-RateLimit-Remaining
   - X-RateLimit-Reset

4. **프라이버시 가드**:
   - 이벤트/로그에 geohash5만
   - 원시 lat/lng 로그 금지 ESLint 규칙

**테스트**:
- 8개 단위 테스트 (logger, rate-limit headers)
- Security headers 검증 (E2E)

**AC**:
- securityheaders.com A+ 등급
- 모든 API 응답에 rate limit 헤더
- 로그에 원시 좌표 없음 (100% 검증)

**예상 시간**: 1일

**Claude 작업 프롬프트**:
```
목표: 보안 헤더 + 구조화 로깅 + geohash5 원칙.
요건:
- CSP/HSTS 헤더
- 구조화 로깅 (request_id, geohash5)
- Rate limit 헤더
- 원시 좌표 로깅 금지 (ESLint)
검증:
- 8 유닛 테스트
- securityheaders.com A+
- E2E 헤더 검증
```

---

## 📋 7) **이슈 백로그** (Granular Tasks)

### Phase 1: UX Entry (PR #16)

1. **Splash Screen** (4h)
   - [ ] `app/splash/page.tsx` 생성
   - [ ] 로고/브랜드 애니메이션
   - [ ] 2s 타이머 + 토큰 검사
   - [ ] Fade-in/out transition

2. **Onboarding Carousel** (6h)
   - [ ] 3장 슬라이드 컴포넌트
   - [ ] 좌우 스와이프 제스처
   - [ ] Progress indicator
   - [ ] 권한 설명 일러스트

3. **Auth Gate** (4h)
   - [ ] `components/auth/AuthGate.tsx`
   - [ ] 상태 관리 (anonymous/authenticated/pending)
   - [ ] 리다이렉트 로직
   - [ ] 세션 검증 (Supabase Auth)

4. **Login Form** (8h)
   - [ ] Email/Phone 모드 토글
   - [ ] Zod 검증 + 즉시 피드백
   - [ ] Magic Link API 연동
   - [ ] OTP API 연동
   - [ ] Rate limit UI 피드백

5. **Permission Requests** (4h)
   - [ ] 위치 권한 요청 UI
   - [ ] 카메라 권한 요청 UI
   - [ ] 알림 권한 요청 UI
   - [ ] 거부 시 대체 UX

6. **E2E Tests** (4h)
   - [ ] Splash → Onboarding → Login
   - [ ] 권한 허용 플로우
   - [ ] 권한 거부 플로우
   - [ ] Magic Link 플로우
   - [ ] OTP 플로우
   - [ ] 세션 만료 플로우

**총 예상**: 30시간 (2일)

### Phase 2: Mapbox Core (PR #17)

7. **MapView 클러스터링** (8h)
   - [ ] Web Worker 설정
   - [ ] Supercluster 통합
   - [ ] ≥500 핀 시 자동 클러스터
   - [ ] 클러스터 zoom drill-down

8. **Geohash 9셀 프리페치** (6h)
   - [ ] geohash6 계산 (사용자 위치)
   - [ ] 9셀 확장 (8방향 + 중앙)
   - [ ] 경계 누락 방지
   - [ ] Cache 전략

9. **OfferPin 상태 뱃지** (4h)
   - [ ] 신규 (NEW) 뱃지
   - [ ] 임박 (EXP) 뱃지
   - [ ] 혼잡 (BUSY) 뱃지
   - [ ] 44-56px 터치 영역

10. **PlaceSheet 릴스 통합** (6h)
    - [ ] ReelsCarousel 임베딩
    - [ ] 저화질 썸네일 (LQIP)
    - [ ] CTA 행동 로그
    - [ ] Half/Full 모드 전환

11. **API nearby 최적화** (6h)
    - [ ] PostGIS ST_DWithin 쿼리
    - [ ] GIST 인덱스 생성
    - [ ] 9셀 확장 쿼리
    - [ ] p95 ≤ 100ms 검증

12. **E2E Tests** (4h)
    - [ ] 지도 팬/줌
    - [ ] 핀 클릭 → 시트 열기
    - [ ] 시트 확장 (Half → Full)
    - [ ] CTA "참여하기" 클릭
    - [ ] 클러스터 drill-down

**총 예상**: 34시간 (3일)

### Phase 3: QR & Wallet (PR #18)

13. **QR Scanner UX** (8h)
    - [ ] 레이저 애니메이션
    - [ ] 진동 피드백 (Vibration API)
    - [ ] 사운드 피드백 (Audio API)
    - [ ] 저조도 토치 (MediaStream)

14. **QR 4-State 처리** (6h)
    - [ ] SUCCESS 상태 UI
    - [ ] ALREADY_USED 상태 UI (410)
    - [ ] EXPIRED 상태 UI (410)
    - [ ] INVALID 상태 UI (200)
    - [ ] 재시도 로직

15. **Wallet 만료 정렬** (4h)
    - [ ] 만료 임박 계산 (≤7일)
    - [ ] 상단 고정 정렬
    - [ ] 만료 뱃지 (시각+텍스트)
    - [ ] 키셋 페이지네이션

16. **Wallet 리딤 API** (6h)
    - [ ] `POST /api/wallet/redeem`
    - [ ] 멱등성 키 검증
    - [ ] 바우처 소각 (status: used)
    - [ ] 거래 내역 생성

17. **E2E Tests** (4h)
    - [ ] QR 스캔 성공 플로우
    - [ ] QR 중복 사용 (410)
    - [ ] QR 만료 (410)
    - [ ] 지갑 리딤
    - [ ] 만료 임박 정렬
    - [ ] 거래 내역 확인

**총 예상**: 28시간 (2일)

### Phase 4: Security Hardening (PR #19)

18. **Security Headers** (4h)
    - [ ] next.config.ts 헤더 설정
    - [ ] CSP: Mapbox + Supabase 허용
    - [ ] HSTS: 1년 max-age
    - [ ] COOP/CORP: same-origin
    - [ ] QR 검증 CORS 차단

19. **Structured Logging** (6h)
    - [ ] lib/server/logger.ts
    - [ ] request_id 생성 (nanoid)
    - [ ] JSON 로그 형식
    - [ ] geohash5만 포함 (원시 좌표 금지)
    - [ ] 모든 API 라우트 적용

20. **Rate Limit Headers** (2h)
    - [ ] X-RateLimit-Limit
    - [ ] X-RateLimit-Remaining
    - [ ] X-RateLimit-Reset
    - [ ] lib/server/rate-limit.ts 업데이트

21. **ESLint Privacy Rule** (2h)
    - [ ] no-raw-coordinates 규칙
    - [ ] 로그/이벤트에 lat/lng 금지
    - [ ] geohash5 권장 제안

22. **Security Tests** (2h)
    - [ ] securityheaders.com 검증
    - [ ] E2E 헤더 검증
    - [ ] Rate limit 헤더 확인

**총 예상**: 16시간 (1일)

---

## 🧪 8) **테스트 전략 업데이트**

### 8.1 단위 테스트 확대 (Vitest)

**현재**: 37개 테스트, 85%+ 커버리지

**추가 필요**:
- Auth 스키마 (15개)
- Logger 유틸 (8개)
- Geohash 계산 (6개)
- 클러스터링 로직 (8개)
- QR 4-state 머신 (10개)

**목표**: 84개 테스트, 85%+ 커버리지 유지

### 8.2 E2E 테스트 확대 (Playwright)

**현재**: 9개 테스트 (탭 네비게이션)

**추가 필요**:
- 스플래시/온보딩/로그인 (6개)
- 지도 상호작용 (5개)
- QR 스캔 플로우 (4개)
- 지갑 리딤 (2개)

**목표**: 26개 E2E 테스트

### 8.3 부하 테스트 업데이트 (k6)

**현재**: 스모크 + 로드 스크립트 준비됨

**실행 필요**:
1. PostgreSQL + PostGIS 설정
2. 시드 데이터 로드
3. k6 스모크 실행 (10 VU, 1분)
4. 기준치 수집 (p50/p95/p99)
5. k6 로드 실행 (100 VU, 110초)
6. 임계값 검증

**목표**:
- nearby: p95 ≤ 100ms
- search: p95 ≤ 80ms, p99 ≤ 150ms
- qr/verify: p95 ≤ 800ms
- wallet: p95 ≤ 100ms

---

## 🎨 9) **디자인 시스템 토큰** (Tailwind 기준)

### 9.1 컬러 (Semantic)

```css
:root {
  /* Background */
  --bg: #0B0F14;           /* 앱셸 다크 */
  --surface: #111827;      /* 카드/시트 */
  
  /* Text */
  --text: #E5E7EB;         /* 주 텍스트 */
  --text-muted: #9CA3AF;   /* 보조 텍스트 */
  
  /* Accent */
  --primary: #10B981;      /* 브랜드 (그린) */
  --success: #22C55E;
  --warning: #F59E0B;
  --danger: #EF4444;
  
  /* Interactive */
  --interactive: #3B82F6;  /* 링크/버튼 */
  --interactive-hover: #2563EB;
}
```

**Tailwind 매핑**:
```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        text: {
          DEFAULT: 'var(--text)',
          muted: 'var(--text-muted)',
        },
        primary: 'var(--primary)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
      },
    },
  },
};
```

### 9.2 간격/그리드

```css
/* 4px base */
spacing: {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
}

/* 컨테이너 */
container: {
  padding: '16px',      /* 좌우 여백 */
  maxWidth: '1280px',   /* 데스크톱 최대 */
}

/* 8pt baseline grid */
line-height: 1.5 (24px / 16px)
```

### 9.3 타이포그래피

```css
/* Headings */
.text-h1 { font-size: 32px; font-weight: 600; line-height: 1.2; }
.text-h2 { font-size: 24px; font-weight: 600; line-height: 1.3; }
.text-h3 { font-size: 20px; font-weight: 600; line-height: 1.4; }

/* Body */
.text-body { font-size: 16px; line-height: 1.5; }
.text-sm { font-size: 14px; line-height: 1.4; }
.text-xs { font-size: 12px; line-height: 1.3; }

/* 숫자 */
.tabular-nums { font-variant-numeric: tabular-nums; }
```

### 9.4 아이콘

```css
/* 사이즈 */
icon: {
  sm: '16px',
  md: '24px',  /* 기본 */
  lg: '32px',
}

/* 터치타겟 */
touch-target: {
  min: '44px',  /* iOS */
  ideal: '48px', /* Android */
}

/* 스타일 */
stroke-width: 2px
hit-slop: 8px  /* 터치 영역 확장 */
```

### 9.5 애니메이션

```css
/* Duration */
duration: {
  fast: '100ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
}

/* Easing */
easing: {
  ease-out: cubic-bezier(0.0, 0.0, 0.2, 1),
  ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1),
}

/* 예시 */
.sheet-enter {
  animation: slideUp 300ms ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

---

## 📚 10) **참고 문서 및 자산**

### 10.1 기존 문서

1. **사업계획서 v3.0** (`나노 크리에이터 × 로컬 비즈니스 매칭 플랫폼 사업계획서.txt`)
   - 핵심 가치, BM 전략, 삼중 검증, 일본 확장, 규제 준수

2. **Phase 5: DQ & 가드레일** (진단 패키지)
   - 15개 DQ 뷰
   - 3개 가드레일 (LCP, 에러율, 인제스트)

3. **Phase 6: Search 목표** (진단 패키지)
   - p95 ≤ 80ms, p99 ≤ 150ms
   - 캐시 전략, 지오스패셜 인덱스

4. **Day 5-6 테스트 요약** (`DAY5_6_TEST_SUMMARY.md`)
   - 37개 단위 테스트
   - 9개 E2E 테스트
   - k6 스크립트
   - 커버리지 85%+

5. **테스트 가이드** (`TESTING_GUIDE.md`)
   - Vitest/Playwright/k6 사용법
   - 커버리지 임계값
   - CI/CD 통합

6. **보안 가이드** (`.secrets/SECURITY_GUIDE.md`)
   - API 키 관리
   - 토큰 갱신
   - 보안 사고 대응

### 10.2 API 크리덴셜 (`.secrets/`)

- 토스페이먼츠
- 금융결제원 오픈뱅킹
- NICE 본인인증
- Supabase (sbp_5c9dc...)
- Vercel (fuVa8JoW...)
- Mapbox (pk.eyJ1...)
- OpenAI (sk-proj-...)
- Instagram (App ID, Secret, Access Token)
- Facebook (2개 계정)

### 10.3 테스트 데이터

**Seed Script**: `scripts/seed-test-data.sql`
- 2명 사용자
- 5개 장소 (PostGIS geography)
- 4개 오퍼
- 3개 바우처
- 2개 QR 토큰
- 1개 예약
- 2개 분석 이벤트

---

## 🎯 11) **즉시 실행 체크리스트**

### 오늘 (Day 7)

- [ ] **PR #16 착수**: 스플래시/온보딩/로그인 구현
  - [ ] 브랜치 생성: `git checkout -b feature/ux-entry`
  - [ ] SplashScreen 컴포넌트
  - [ ] OnboardingCarousel 컴포넌트
  - [ ] AuthGate + LoginForm
  - [ ] Magic Link/OTP API

- [ ] **보안 헤더 적용** (PR #19 일부 선행)
  - [ ] next.config.ts 헤더 설정
  - [ ] CSP: Mapbox + Supabase 허용
  - [ ] CORS 차단 (QR 검증)

- [ ] **로깅 구조화** (PR #19 일부 선행)
  - [ ] lib/server/logger.ts 생성
  - [ ] request_id 생성
  - [ ] geohash5 원칙 적용

### 이번 주 (Day 8-10)

- [ ] **PR #16 완료 및 머지**
  - [ ] E2E 6케이스 통과
  - [ ] Unit 15케이스 통과
  - [ ] PR 생성 → 리뷰 → 머지

- [ ] **PR #17 착수**: Mapbox 핵심 기능
  - [ ] 브랜치 생성: `git checkout -b feature/mapbox-core`
  - [ ] 클러스터링 (Web Worker)
  - [ ] geohash6 + 9셀 프리페치
  - [ ] OfferPin 상태 뱃지
  - [ ] PlaceSheet 릴스 통합

- [ ] **데이터베이스 설정**
  - [ ] PostgreSQL + PostGIS 로컬 설치
  - [ ] Prisma 마이그레이션 실행
  - [ ] 시드 데이터 로드
  - [ ] k6 스모크 테스트 실행

### 다음 주 (Day 11-14)

- [ ] **PR #17 완료 및 머지**
  - [ ] E2E 5케이스 통과
  - [ ] k6 nearby ≤ 100ms 검증
  - [ ] PR 생성 → 리뷰 → 머지

- [ ] **PR #18 착수 및 완료**: QR & Wallet
  - [ ] QR Scanner UX 강화
  - [ ] Wallet 만료 정렬
  - [ ] 리딤 API 구현
  - [ ] E2E 6케이스 통과

- [ ] **PR #19 완료**: Security Hardening
  - [ ] securityheaders.com A+ 검증
  - [ ] 모든 API 라우트 로깅 적용
  - [ ] ESLint privacy 규칙

---

## 🚀 12) **결론 및 우선순위**

### 최우선 (Critical Path)

1. **🔴 스플래시/온보딩/로그인** (PR #16, 2일)
   - 첫 실행 경험의 토대
   - 보안 플로우의 시작점
   - 모든 후속 기능의 전제조건

2. **🔴 보안 헤더 + 구조화 로깅** (PR #19 선행, 1일)
   - 프라이버시 준수 (geohash5 원칙)
   - 보안 강화 (CSP/HSTS)
   - 운영 관측성 (request_id)

3. **🟡 데이터베이스 설정 + 스모크 테스트** (0.5일)
   - 실제 API 성능 검증
   - k6 기준치 수집
   - 병목 식별

### 다음 단계 (High Impact)

4. **🟡 Mapbox 핵심 기능** (PR #17, 3일)
   - 지도 중심 UX의 완성
   - 클러스터링 + 9셀 프리페치
   - LIVE 릴스 통합

5. **🟡 QR & Wallet** (PR #18, 2일)
   - 검증 → 보상 루프 완성
   - 4-상태 처리
   - 지갑 정렬/리딤

### 후속 작업 (Medium Priority)

6. **🟢 E2E 테스트 확대** (9 → 26 케이스, 1일)
7. **🟢 API 라우트 단위 테스트** (Prisma 모킹, 2일)
8. **🟢 영수증 OCR** (선택적 3차 검증, 2일)
9. **🟢 LIVE 릴스 업로드** (사용자 콘텐츠, 3일)
10. **🟢 알림 시스템** (푸시 알림, 2일)

### 성공 지표

**2주 후 목표**:
- ✅ 완전한 첫 실행 플로우 (스플래시 → 탭)
- ✅ 지도 중심 탐색 (클러스터링, 9셀 프리페치)
- ✅ QR 검증 4-상태 처리
- ✅ 지갑 보상 루프
- ✅ 보안 헤더 A+ 등급
- ✅ 구조화 로깅 (geohash5 원칙)
- ✅ E2E 26개 테스트 통과
- ✅ k6 스모크/로드 테스트 통과

**제품 상태**:
- **데모 가능** (투자자/파트너 대상)
- **베타 준비** (선별된 나노 크리에이터 대상)
- **측정 가능** (북스타 메트릭 추적 시작)

---

**문서 버전**: 1.0.0\
**마지막 업데이트**: 2025-11-13\
**작성자**: ZZIK LIVE 개발팀\
**다음 검토일**: 2025-11-20

---

## 📞 문의 및 피드백

**기술 책임자**: assembcho@gmail.com\
**프로젝트 저장소**: `/home/user/webapp`\
**브랜치 전략**: `main` ← `be/day3-4-core` ← `feature/*`
