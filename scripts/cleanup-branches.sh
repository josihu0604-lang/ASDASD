#!/usr/bin/env bash

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧹 GitHub 브랜치 정리 스크립트${NC}"
echo "════════════════════════════════════════"

# 현재 브랜치 확인
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}현재 브랜치: ${CURRENT_BRANCH}${NC}"

# 모든 원격 브랜치 확인
echo -e "\n${BLUE}📋 원격 브랜치 목록:${NC}"
git branch -r | grep -v HEAD

# 정리할 브랜치 목록
echo -e "\n${YELLOW}⚠️  다음 브랜치들을 정리할 수 있습니다:${NC}"
echo "  1. origin/be/day3-4-core (백엔드 개발 완료)"
echo "  2. origin/feature/db-setup-smoke (DB 설정 완료)"
echo "  3. origin/feature/vercel-preview-system (프리뷰 시스템 설정 완료)"

echo -e "\n${RED}주의: 브랜치를 삭제하기 전에 반드시 PR이 머지되었는지 확인하세요!${NC}"

# 사용자에게 확인
read -p "브랜치를 정리하시겠습니까? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "\n${GREEN}브랜치 정리를 시작합니다...${NC}"
    
    # 머지된 브랜치만 삭제 (안전)
    git fetch --prune
    
    # 로컬에서 원격 추적 브랜치 정리
    git remote prune origin
    
    echo -e "\n${GREEN}✅ 로컬 원격 추적 브랜치가 정리되었습니다${NC}"
    echo -e "${YELLOW}💡 원격 브랜치를 삭제하려면 GitHub에서 직접 삭제하거나 다음 명령어를 사용하세요:${NC}"
    echo "   git push origin --delete <branch-name>"
else
    echo -e "\n${YELLOW}브랜치 정리를 취소했습니다${NC}"
fi

echo -e "\n${BLUE}현재 브랜치 상태:${NC}"
git branch -vv