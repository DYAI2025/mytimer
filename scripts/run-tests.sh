#!/bin/bash
# Timer Collection Test Runner Script

set -e

echo "=========================================="
echo "Timer Collection - Test Runner"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Run unit tests
echo -e "${YELLOW}Running Unit Tests...${NC}"
npm run test -- --run
UNIT_RESULT=$?

if [ $UNIT_RESULT -eq 0 ]; then
    echo -e "${GREEN}✓ Unit Tests Passed${NC}"
else
    echo -e "${RED}✗ Unit Tests Failed${NC}"
fi

echo ""
echo "=========================================="

# Run type check
echo -e "${YELLOW}Running Type Check...${NC}"
npm run type-check
TYPE_RESULT=$?

if [ $TYPE_RESULT -eq 0 ]; then
    echo -e "${GREEN}✓ Type Check Passed${NC}"
else
    echo -e "${RED}✗ Type Check Failed${NC}"
fi

echo ""
echo "=========================================="

# Run lint
echo -e "${YELLOW}Running Lint...${NC}"
npm run lint
LINT_RESULT=$?

if [ $LINT_RESULT -eq 0 ]; then
    echo -e "${GREEN}✓ Lint Passed${NC}"
else
    echo -e "${RED}✗ Lint Failed${NC}"
fi

echo ""
echo "=========================================="

# Summary
echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="

if [ $UNIT_RESULT -eq 0 ] && [ $TYPE_RESULT -eq 0 ] && [ $LINT_RESULT -eq 0 ]; then
    echo -e "${GREEN}All checks passed!${NC}"
    exit 0
else
    echo -e "${RED}Some checks failed. See above for details.${NC}"
    exit 1
fi
