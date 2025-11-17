#!/bin/bash

# RAJAI Platform API Test Script
# This script tests all API endpoints to ensure they're working correctly

set -e

BASE_URL="${1:-http://localhost:5001}"
echo "🧪 Testing RAJAI Platform API at $BASE_URL"
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test an endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    local data=$5

    echo -n "Testing: $description... "
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint" 2>/dev/null || echo "000")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            "$BASE_URL$endpoint" 2>/dev/null || echo "000")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $status_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected HTTP $expected_status, got $status_code)"
        if [ -n "$body" ]; then
            echo "  Response: $body"
        fi
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo ""
echo "📋 Running API Tests..."
echo ""

# Test 1: Health Check
test_endpoint "GET" "/api/health" "200" "Health check endpoint"

# Test 2: Get all agents (should work even if empty)
test_endpoint "GET" "/api/agents" "200" "Get all agents"

# Test 3: Get all executions (should work even if empty)
test_endpoint "GET" "/api/executions" "200" "Get all executions"

# Test 4: Get non-existent agent (should return 404)
test_endpoint "GET" "/api/agents/non-existent-id" "404" "Get non-existent agent"

# Test 5: Get non-existent execution (should return 404)
test_endpoint "GET" "/api/executions/non-existent-id" "404" "Get non-existent execution"

# Test 6: Create agent with invalid data (should return 400)
test_endpoint "POST" "/api/agents" "400" "Create agent with invalid data" '{}'

# Test 7: Create valid agent
AGENT_DATA='{
  "name": "Test Agent",
  "role": "Software Developer",
  "goal": "Write clean code",
  "backstory": "Experienced developer",
  "tasks": ["Write a hello world function"]
}'
if test_endpoint "POST" "/api/agents" "201" "Create valid agent" "$AGENT_DATA"; then
    # Extract agent ID from response for further tests
    AGENT_ID=$(echo "$body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -n "$AGENT_ID" ]; then
        # Test 8: Get the created agent
        test_endpoint "GET" "/api/agents/$AGENT_ID" "200" "Get created agent"
        
        # Test 9: Update the agent
        UPDATE_DATA='{
          "name": "Updated Test Agent",
          "role": "Senior Software Developer",
          "goal": "Write excellent code",
          "backstory": "Very experienced developer",
          "tasks": ["Write advanced functions"]
        }'
        test_endpoint "PATCH" "/api/agents/$AGENT_ID" "200" "Update agent" "$UPDATE_DATA"
        
        # Test 10: Execute the agent (should return 202 Accepted)
        test_endpoint "POST" "/api/agents/$AGENT_ID/execute" "202" "Execute agent"
        
        # Test 11: Delete the agent
        test_endpoint "DELETE" "/api/agents/$AGENT_ID" "204" "Delete agent"
        
        # Test 12: Verify agent is deleted
        test_endpoint "GET" "/api/agents/$AGENT_ID" "404" "Verify agent deletion"
    fi
fi

echo ""
echo "================================================"
echo "📊 Test Results:"
echo -e "   ${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "   ${RED}Failed: $TESTS_FAILED${NC}"
echo "================================================"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
