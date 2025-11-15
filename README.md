# 🌍 ZZIK LIVE

> 삼중 검증(GPS × QR × 영수증) 기반 위치 기반 실시간 경험 플랫폼

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

## 🎯 핵심 기능

- **🗺️ 지도 기반 탐색**: Mapbox 기반 실시간 위치 서비스
- **🔒 삼중 검증**: GPS 위치 × QR 코드 스캔 × 영수증 검증
- **🎬 LIVE 릴스**: 위치 기반 숏폼 비디오 콘텐츠
- **🔐 지오프라이버시 우선**: 모든 위치 데이터는 geohash5로 저장 (원시 좌표 절대 금지)
- **⚡ 실시간 성능**: 핵심 작업에 대해 100ms 미만의 응답 시간

## 🚀 빠른 시작

### 필수 요구사항

- Node.js v20.0.0 이상
- npm 10.0.0 이상
- Docker (PostgreSQL + PostGIS용)
- Mapbox 액세스 토큰

### 설치

```bash
# 1. 저장소 클론
git clone https://github.com/josihu0604-lang/ASDASD.git
cd ASDASD

# 2. 의존성 설치
npm ci

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 필요한 값들을 설정하세요

# 4. 시스템 상태 점검
npm run doctor

# 5. 데이터베이스 시작
npm run db:up

# 6. 데이터베이스 마이그레이션 및 시드
npm run db:migrate
npm run db:seed

# 7. 개발 서버 시작
npm run dev
```

서버가 시작되면 http://localhost:3000 에서 확인할 수 있습니다.

## 📁 프로젝트 구조

```
zzik-live/
├── app/                    # Next.js App Router
├── components/             # UI 컴포넌트
├── lib/                    # 공용 유틸리티
├── db/                     # 데이터베이스 설정
│   ├── compose.yml        # Docker Compose
│   ├── Makefile           # DB 관리 명령어
│   └── seed/              # 시드 스크립트
├── k6/                     # 부하 테스트
├── __tests__/              # 테스트
├── scripts/                # 유틸리티 스크립트
├── docs/                   # 문서
│   ├── RUNBOOK.md         # 운영 가이드
│   ├── PRIVACY.md         # 프라이버시 가이드
│   └── archive/           # 이전 문서들
└── .github/               # GitHub 설정
```

## 🛠️ 주요 명령어

### 개발
```bash
npm run dev          # 개발 서버 시작
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 시작
npm run typecheck    # TypeScript 타입 체크
```

### 데이터베이스
```bash
npm run db:up        # 데이터베이스 시작 (Docker)
npm run db:down      # 데이터베이스 중지
npm run db:migrate   # 마이그레이션 실행
npm run db:seed      # 테스트 데이터 시드
npm run db:reset     # 전체 리셋 (down + up + migrate + seed)
npm run db:studio    # Prisma Studio 실행
```

### 코드 품질
```bash
npm run lint         # ESLint 실행
npm run lint:fix     # ESLint 자동 수정
npm run format       # Prettier 포맷팅
npm run format:check # 포맷 체크만
```

### 테스트
```bash
npm run test         # 테스트 실행
npm run test:unit    # 유닛 테스트
npm run test:e2e     # E2E 테스트
npm run test:coverage # 커버리지 포함
npm run k6:smoke     # k6 스모크 테스트
```

### 유틸리티
```bash
npm run doctor       # 시스템 상태 점검
npm run clean        # 빌드 결과물 정리
npm run clean:deep   # node_modules 포함 전체 정리
npm run headers:verify # 보안 헤더 검증
```

## 🔒 프라이버시 & 보안

### Geohash5 원칙

**절대 원시 좌표를 저장, 로그, 전송하지 마세요!**

모든 위치 데이터는 geohash5 형식으로 변환되어야 합니다 (~5km 정밀도).

```typescript
// ✅ 올바른 예시
const location = {
  geohash: 'u4pru',  // ~5km precision
  timestamp: Date.now()
};

// ❌ 잘못된 예시 - 절대 금지!
const location = {
  lat: 35.6762,    // ❌ 금지!
  lng: 139.6503,   // ❌ 금지!
};
```

자세한 내용은 [docs/PRIVACY.md](docs/PRIVACY.md)를 참조하세요.

### 보안 헤더

모든 응답에 다음 보안 헤더가 포함됩니다:
- Content-Security-Policy
- Strict-Transport-Security
- X-Content-Type-Options
- X-Frame-Options
- Cross-Origin-Opener-Policy
- Cross-Origin-Resource-Policy

## 📊 성능 목표

| 메트릭 | 목표 |
|--------|------|
| API p95 지연시간 | ≤ 150ms |
| 지갑 작업 | ≤ 100ms |
| 검색 작업 | ≤ 120ms |
| 에러율 | < 1% |

## 📚 문서

- [운영 가이드 (RUNBOOK)](docs/RUNBOOK.md)
- [프라이버시 가이드](docs/PRIVACY.md)
- [보안 가이드](docs/SECURITY.md)
- [아키텍처 문서](docs/ARCHITECTURE.md)
- [개발 가이드](docs/DEV_GUIDE.md)
- [빠른 시작 가이드](docs/QUICKSTART.md)

## 🤝 기여하기

1. 이슈를 생성하거나 기존 이슈를 선택하세요
2. Feature 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'feat: add amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

### 커밋 메시지 규칙

Conventional Commits을 따릅니다:

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 포맷팅
refactor: 코드 리팩토링
perf: 성능 개선
test: 테스트 추가/수정
chore: 빌드/도구 변경
```

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- [Next.js](https://nextjs.org/)
- [Mapbox](https://www.mapbox.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [PostGIS](https://postgis.net/)
- [Prisma](https://www.prisma.io/)

---

**Made with ❤️ for location-based experiences**