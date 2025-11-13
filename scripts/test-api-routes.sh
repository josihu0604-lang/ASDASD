#!/bin/bash

# API Routes Smoke Test Script
# Tests all 7 implemented routes with basic scenarios

BASE_URL="http://localhost:3000"
USER_ID="test-user-123"

echo "🧪 Testing ZZIK LIVE API Routes"
echo "================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_count=0
pass_count=0
fail_count=0

# Helper function to test endpoint
test_endpoint() {
  local name=$1
  local method=$2
  local url=$3
  local data=$4
  local expected_code=$5
  
  test_count=$((test_count + 1))
  echo -n "Test $test_count: $name ... "
  
  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      -H "x-user-id: $USER_ID" \
      -H "Content-Type: application/json" \
      "$BASE_URL$url")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      -H "x-user-id: $USER_ID" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$BASE_URL$url")
  fi
  
  status_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$status_code" == "$expected_code" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $status_code)"
    pass_count=$((pass_count + 1))
  else
    echo -e "${RED}✗ FAIL${NC} (Expected HTTP $expected_code, got $status_code)"
    echo "Response: $body"
    fail_count=$((fail_count + 1))
  fi
}

echo "📝 Starting API tests..."
echo ""

# Test 1: GET /api/offers (all)
test_endpoint "GET /api/offers (all)" "GET" "/api/offers?filter=all&limit=10" "" "200"

# Test 2: GET /api/offers (new)
test_endpoint "GET /api/offers (new)" "GET" "/api/offers?filter=new&limit=5" "" "200"

# Test 3: GET /api/offers (expiring)
test_endpoint "GET /api/offers (expiring)" "GET" "/api/offers?filter=expiring" "" "200"

# Test 4: GET /api/offers (with lat/lng)
test_endpoint "GET /api/offers (with location)" "GET" "/api/offers?filter=all&lat=37.5665&lng=126.978" "" "200"

# Test 5: GET /api/wallet/summary
test_endpoint "GET /api/wallet/summary" "GET" "/api/wallet/summary" "" "200"

# Test 6: POST /api/qr/verify (invalid token)
test_endpoint "POST /api/qr/verify (invalid)" "POST" "/api/qr/verify" '{"token":"invalid-token-12345678901234567890"}' "200"

# Test 7: GET /api/wallet/vouchers (all)
test_endpoint "GET /api/wallet/vouchers (all)" "GET" "/api/wallet/vouchers?limit=10" "" "200"

# Test 8: GET /api/wallet/vouchers (active)
test_endpoint "GET /api/wallet/vouchers (active)" "GET" "/api/wallet/vouchers?status=active" "" "200"

# Test 9: GET /api/wallet/ledger
test_endpoint "GET /api/wallet/ledger" "GET" "/api/wallet/ledger?limit=10" "" "200"

# Test 10: GET /api/places/nearby
test_endpoint "GET /api/places/nearby" "GET" "/api/places/nearby?geohash5=wydm6&radius=500" "" "200"

# Test 11: GET /api/search (text only)
test_endpoint "GET /api/search (text)" "GET" "/api/search?q=cafe&limit=5" "" "200"

# Test 12: GET /api/search (with location)
test_endpoint "GET /api/search (geo)" "GET" "/api/search?q=restaurant&lat=37.5665&lng=126.978&radius=1000" "" "200"

# Test 13: Invalid parameter (negative limit)
test_endpoint "GET /api/offers (invalid limit)" "GET" "/api/offers?limit=-1" "" "400"

# Test 14: Rate limiting test (should fail after 60 requests for offers)
echo ""
echo "🔒 Testing rate limiting (60 requests to /api/offers)..."
rate_limit_hit=false
for i in {1..65}; do
  status_code=$(curl -s -w "%{http_code}" -o /dev/null \
    -H "x-user-id: rate-limit-test-user" \
    "$BASE_URL/api/offers?filter=all")
  
  if [ "$status_code" == "429" ]; then
    echo -e "${GREEN}✓ Rate limit enforced at request $i${NC}"
    rate_limit_hit=true
    break
  fi
done

if [ "$rate_limit_hit" = true ]; then
  pass_count=$((pass_count + 1))
else
  echo -e "${RED}✗ Rate limit not enforced after 65 requests${NC}"
  fail_count=$((fail_count + 1))
fi
test_count=$((test_count + 1))

# Summary
echo ""
echo "================================"
echo "📊 Test Summary"
echo "================================"
echo -e "Total tests: $test_count"
echo -e "${GREEN}Passed: $pass_count${NC}"
echo -e "${RED}Failed: $fail_count${NC}"
echo ""

if [ "$fail_count" -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠ Some tests failed. Check implementation.${NC}"
  exit 1
fi
