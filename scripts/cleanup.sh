#!/usr/bin/env bash

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧹 ZZIK LIVE Cleanup Script${NC}"
echo "════════════════════════════════════════"

# Track what was cleaned
CLEANED_ITEMS=()

# Clean Next.js build artifacts
if [ -d ".next" ]; then
    rm -rf .next
    CLEANED_ITEMS+=("Next.js build cache")
    echo -e "${GREEN}✓${NC} Removed .next directory"
fi

# Clean Turbo cache
if [ -d ".turbo" ]; then
    rm -rf .turbo
    CLEANED_ITEMS+=("Turbo cache")
    echo -e "${GREEN}✓${NC} Removed .turbo directory"
fi

# Clean coverage reports
if [ -d "coverage" ]; then
    rm -rf coverage
    CLEANED_ITEMS+=("Coverage reports")
    echo -e "${GREEN}✓${NC} Removed coverage directory"
fi

# Clean dist/out directories
if [ -d "dist" ]; then
    rm -rf dist
    CLEANED_ITEMS+=("Dist directory")
    echo -e "${GREEN}✓${NC} Removed dist directory"
fi

if [ -d "out" ]; then
    rm -rf out
    CLEANED_ITEMS+=("Out directory")
    echo -e "${GREEN}✓${NC} Removed out directory"
fi

# Clean temporary files
if [ -d "tmp" ]; then
    rm -rf tmp
    CLEANED_ITEMS+=("Temp directory")
    echo -e "${GREEN}✓${NC} Removed tmp directory"
fi

# Clean log files
LOG_COUNT=$(find . -name "*.log" -type f 2>/dev/null | wc -l)
if [ "$LOG_COUNT" -gt 0 ]; then
    find . -name "*.log" -type f -delete
    CLEANED_ITEMS+=("$LOG_COUNT log files")
    echo -e "${GREEN}✓${NC} Removed $LOG_COUNT log files"
fi

# Clean npm debug logs
NPM_LOG_COUNT=$(find . -name "npm-debug.log*" -type f 2>/dev/null | wc -l)
if [ "$NPM_LOG_COUNT" -gt 0 ]; then
    find . -name "npm-debug.log*" -type f -delete
    CLEANED_ITEMS+=("$NPM_LOG_COUNT npm debug logs")
    echo -e "${GREEN}✓${NC} Removed npm debug logs"
fi

# Clean yarn error logs
if [ -f "yarn-error.log" ]; then
    rm -f yarn-error.log
    CLEANED_ITEMS+=("Yarn error log")
    echo -e "${GREEN}✓${NC} Removed yarn-error.log"
fi

# Clean DS_Store files (macOS)
DS_STORE_COUNT=$(find . -name ".DS_Store" -type f 2>/dev/null | wc -l)
if [ "$DS_STORE_COUNT" -gt 0 ]; then
    find . -name ".DS_Store" -type f -delete
    CLEANED_ITEMS+=(".DS_Store files")
    echo -e "${GREEN}✓${NC} Removed $DS_STORE_COUNT .DS_Store files"
fi

# Clean TypeScript build info
if [ -f "tsconfig.tsbuildinfo" ]; then
    rm -f tsconfig.tsbuildinfo
    CLEANED_ITEMS+=("TypeScript build info")
    echo -e "${GREEN}✓${NC} Removed tsconfig.tsbuildinfo"
fi

# Clean test artifacts
if [ -d "test-results" ]; then
    rm -rf test-results
    CLEANED_ITEMS+=("Test results")
    echo -e "${GREEN}✓${NC} Removed test-results directory"
fi

# Clean Playwright artifacts
if [ -d "playwright-report" ]; then
    rm -rf playwright-report
    CLEANED_ITEMS+=("Playwright reports")
    echo -e "${GREEN}✓${NC} Removed playwright-report directory"
fi

# Clean node_modules if requested
if [ "${1:-}" = "--deep" ]; then
    echo -e "\n${YELLOW}Deep clean mode activated${NC}"
    
    if [ -d "node_modules" ]; then
        echo -e "${YELLOW}⚠${NC}  Removing node_modules (this will require npm install)..."
        rm -rf node_modules
        CLEANED_ITEMS+=("node_modules")
        echo -e "${GREEN}✓${NC} Removed node_modules"
    fi
    
    if [ -f "package-lock.json" ]; then
        echo -e "${YELLOW}⚠${NC}  Removing package-lock.json..."
        rm -f package-lock.json
        CLEANED_ITEMS+=("package-lock.json")
        echo -e "${GREEN}✓${NC} Removed package-lock.json"
    fi
fi

# Calculate disk space saved
echo ""
echo "════════════════════════════════════════"

# Summary
if [ ${#CLEANED_ITEMS[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ Already clean! Nothing to remove.${NC}"
else
    echo -e "${GREEN}✅ Cleanup complete!${NC}"
    echo ""
    echo "Cleaned items:"
    for item in "${CLEANED_ITEMS[@]}"; do
        echo "  • $item"
    done
fi

# Suggest next steps
echo ""
echo "💡 Next steps:"
echo "  • Run 'npm ci' to reinstall dependencies (if needed)"
echo "  • Run 'npm run build' to rebuild the project"
echo "  • Run 'npm run doctor' to verify system health"

# Exit successfully
exit 0