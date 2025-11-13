# 🚀 Vercel Deployment Guide

## 📋 목차

1. [초기 설정](#초기-설정)
2. [GitHub Secrets 설정](#github-secrets-설정)
3. [Preview Deployments](#preview-deployments)
4. [Production Deployment](#production-deployment)
5. [환경 변수 관리](#환경-변수-관리)
6. [문제 해결](#문제-해결)

---

## 🎯 초기 설정

### 1. Vercel 계정 생성 및 프로젝트 연결

```bash
# 1. Vercel CLI 로그인
npx vercel login

# 2. 프로젝트 초기화 (처음 한 번만)
npx vercel

# 3. 프로젝트 정보 확인
npx vercel inspect
```

### 2. Vercel 프로젝트 설정

Vercel 대시보드에서:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### 3. 도메인 설정 (선택사항)

```bash
# 커스텀 도메인 추가
npx vercel domains add your-domain.com

# 도메인 확인
npx vercel domains ls
```

---

## 🔐 GitHub Secrets 설정

GitHub Repository → Settings → Secrets and variables → Actions에서 다음 Secrets 추가:

### 필수 Secrets

```plaintext
VERCEL_TOKEN
└─ Vercel 계정 Settings → Tokens → Create Token
└─ Scope: Full Account

VERCEL_ORG_ID
└─ 프로젝트 Settings → General → Organization ID

VERCEL_PROJECT_ID
└─ 프로젝트 Settings → General → Project ID
```

### Vercel Token 생성 방법

1. Vercel 대시보드 접속
2. Settings → Tokens
3. "Create Token" 클릭
4. Name: `GitHub Actions Deploy`
5. Scope: **Full Account** 선택
6. Expiration: **No Expiration** (권장)
7. 생성된 토큰 복사 → GitHub Secrets에 `VERCEL_TOKEN`으로 추가

### Organization ID & Project ID 확인

```bash
# CLI로 확인
npx vercel project ls

# 또는 .vercel/project.json에서 확인
cat .vercel/project.json
```

### 선택 Secrets (나중에 추가 가능)

```plaintext
CODECOV_TOKEN
└─ Codecov.io에서 생성 (테스트 커버리지 리포트용)
```

---

## 🔄 Preview Deployments

### 자동 Preview 배포

PR을 생성하면 **자동으로** Preview 환경이 배포됩니다:

```bash
# 1. Feature 브랜치 생성
git checkout -b feature/new-feature

# 2. 코드 작성 및 커밋
git add .
git commit -m "feat: add new feature"

# 3. Push
git push origin feature/new-feature

# 4. GitHub에서 PR 생성
# → GitHub Actions가 자동으로 Preview 배포 시작
# → PR 댓글에 Preview URL 자동 추가
```

### Preview 배포 과정

```
1. PR 생성/업데이트
   ↓
2. GitHub Actions 실행 (.github/workflows/vercel-preview.yml)
   ├─ Lint & Test
   ├─ Build 검증
   └─ Vercel Preview 배포
   ↓
3. PR 댓글에 Preview URL 자동 게시
   ↓
4. Preview 환경에서 테스트
```

### Preview URL 예시

```
https://zzik-live-{pr-number}-{branch-name}-{hash}.vercel.app
```

### 수동 Preview 배포 (로컬)

```bash
# Preview 배포
npx vercel

# 특정 환경 변수와 함께 배포
npx vercel --env NEXT_PUBLIC_APP_ENV=preview
```

---

## 🌐 Production Deployment

### 자동 Production 배포

`main` 브랜치에 merge되면 **자동으로** Production 배포:

```bash
# 1. PR이 main에 merge됨
# → GitHub Actions가 자동으로 실행

# 2. 배포 완료 후 자동으로 이슈 생성
# → 제목: "🚀 Production Deployment - YYYY-MM-DD"
# → 내용: 배포 URL, 커밋 정보, 체크리스트
```

### Production 배포 과정

```
1. main 브랜치에 push/merge
   ↓
2. GitHub Actions 실행 (.github/workflows/vercel-production.yml)
   ├─ Full Test Suite (unit + coverage)
   ├─ Build 검증
   └─ Vercel Production 배포
   ↓
3. 배포 완료 이슈 자동 생성
   ↓
4. Production 환경 확인
```

### 수동 Production 배포 (로컬)

```bash
# Production 배포
npx vercel --prod

# 빌드 후 배포 (권장)
npm run build
npx vercel --prebuilt --prod
```

---

## 🔧 환경 변수 관리

### Vercel 대시보드에서 환경 변수 설정

1. Vercel 프로젝트 → Settings → Environment Variables
2. 각 환경별로 변수 추가:
   - **Development**: 로컬 개발 환경
   - **Preview**: PR Preview 환경
   - **Production**: 프로덕션 환경

### 주요 환경 변수

```bash
# 필수 환경 변수
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1...

# 환경별 변수
NEXT_PUBLIC_APP_ENV=production  # 또는 preview, development
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 환경 변수 업데이트

```bash
# CLI로 환경 변수 추가
npx vercel env add VARIABLE_NAME

# 환경 변수 목록 확인
npx vercel env ls

# 환경 변수 pull (로컬로 가져오기)
npx vercel env pull .env.local
```

### .env.local 파일 생성

```bash
# .env.example 복사
cp .env.example .env.local

# 값 채우기 (.secrets/ 폴더 참고)
vim .env.local
```

---

## 🧪 배포 검증

### Preview 배포 체크리스트

```markdown
- [ ] 빌드 성공
- [ ] Lint 통과
- [ ] Unit Tests 통과
- [ ] Preview URL 접근 가능
- [ ] 스플래시 화면 정상 로딩
- [ ] 온보딩 플로우 동작
- [ ] 로그인/인증 기능 테스트
- [ ] 지도 렌더링 확인
- [ ] 모바일 반응형 확인
```

### Production 배포 체크리스트

```markdown
- [ ] Full Test Suite 통과
- [ ] Coverage ≥ 85%
- [ ] Build 성공
- [ ] Production URL 접근 가능
- [ ] 홈페이지 로딩
- [ ] API 엔드포인트 동작
- [ ] 인증 플로우 정상
- [ ] 데이터베이스 연결 확인
- [ ] 에러 트래킹 동작
- [ ] Performance 확인
```

---

## 📊 배포 모니터링

### Vercel Analytics

```bash
# package.json에 추가
npm install @vercel/analytics

# app/layout.tsx에 추가
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Vercel Speed Insights

```bash
# package.json에 추가
npm install @vercel/speed-insights

# app/layout.tsx에 추가
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

---

## 🚨 문제 해결

### 1. 빌드 실패

```bash
# 로컬에서 빌드 테스트
npm run build

# TypeScript 에러 확인
npm run lint

# 캐시 클리어 후 재시도
rm -rf .next node_modules
npm install
npm run build
```

### 2. 환경 변수 문제

```bash
# 환경 변수 pull
npx vercel env pull .env.local

# 환경 변수 확인
npx vercel env ls

# Vercel 대시보드에서 재확인
# → Settings → Environment Variables
```

### 3. 배포가 너무 느림

```bash
# .vercelignore에 불필요한 파일 추가
echo "coverage/" >> .vercelignore
echo "playwright-report/" >> .vercelignore

# Build Cache 활성화 (기본 활성화됨)
# → Vercel 대시보드 → Settings → General → Build Cache
```

### 4. GitHub Actions 실패

```bash
# 1. Secrets 확인
# GitHub → Settings → Secrets → Actions
# VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID 존재 확인

# 2. Workflow 로그 확인
# GitHub → Actions → 실패한 워크플로우 클릭 → 로그 확인

# 3. 로컬에서 재현
git checkout <failed-branch>
npm ci
npm run lint
npm run test:unit
npm run build
```

### 5. Preview URL이 PR 댓글에 안 나타남

```bash
# GitHub Actions 권한 확인
# Settings → Actions → General → Workflow permissions
# → "Read and write permissions" 선택
# → "Allow GitHub Actions to create and approve pull requests" 체크
```

---

## 🔗 유용한 링크

- [Vercel 대시보드](https://vercel.com/dashboard)
- [Vercel CLI 문서](https://vercel.com/docs/cli)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [GitHub Actions 문서](https://docs.github.com/en/actions)

---

## 📞 지원

배포 관련 문제가 있으면:
1. 이 문서의 "문제 해결" 섹션 확인
2. GitHub Issues에 문제 등록
3. Vercel Support 문의

---

**마지막 업데이트**: 2025-11-13
**Vercel CLI 버전**: 48.9.1
**Next.js 버전**: 16.0.2
