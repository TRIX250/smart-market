#!/bin/bash
# System Verification Script for SmartMarket Manager
# Checks all configurations are correct

echo "🔍 SmartMarket Manager - System Verification"
echo "=============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: package.json dev script
echo "1️⃣  Checking package.json dev script..."
if grep -q '"dev": "next dev -H 0.0.0.0"' package.json; then
    echo -e "${GREEN}✅ Server configured to bind to 0.0.0.0${NC}"
else
    echo -e "${RED}❌ Server NOT configured for network access${NC}"
    echo "   Expected: \"dev\": \"next dev -H 0.0.0.0\""
fi
echo ""

# Check 2: Firewall status
echo "2️⃣  Checking firewall configuration..."
if command -v ufw &> /dev/null; then
    if sudo ufw status | grep -q "3000.*ALLOW"; then
        echo -e "${GREEN}✅ Port 3000 is open in UFW${NC}"
    else
        echo -e "${YELLOW}⚠️  Port 3000 may not be open in UFW${NC}"
        echo "   Run: sudo ufw allow 3000/tcp"
    fi
elif command -v firewall-cmd &> /dev/null; then
    if sudo firewall-cmd --list-ports | grep -q "3000/tcp"; then
        echo -e "${GREEN}✅ Port 3000 is open in firewalld${NC}"
    else
        echo -e "${YELLOW}⚠️  Port 3000 may not be open in firewalld${NC}"
        echo "   Run: sudo firewall-cmd --permanent --add-port=3000/tcp"
    fi
else
    echo -e "${YELLOW}⚠️  No firewall detected or manual configuration needed${NC}"
fi
echo ""

# Check 3: .env configuration
echo "3️⃣  Checking .env configuration..."
if grep -q "NEXT_PUBLIC_APP_URL=\"http://192.168.43.45:3000\"" .env; then
    echo -e "${GREEN}✅ APP_URL configured correctly${NC}"
else
    echo -e "${YELLOW}⚠️  APP_URL may need updating${NC}"
    echo "   Current value:"
    grep "NEXT_PUBLIC_APP_URL" .env
fi
echo ""

# Check 4: Subscription pricing
echo "4️⃣  Checking subscription pricing..."
PRICE_FILES=(
    "src/app/subscribe/actions.ts"
    "src/app/actions.ts"
    "src/app/subscription/actions.ts"
    "prisma/schema.prisma"
)

ALL_CORRECT=true
for file in "${PRICE_FILES[@]}"; do
    if [ -f "$file" ]; then
        if grep -q "7000" "$file"; then
            echo -e "${GREEN}✅ $file${NC}"
        else
            echo -e "${RED}❌ $file (may have wrong price)${NC}"
            ALL_CORRECT=false
        fi
    fi
done

if [ "$ALL_CORRECT" = true ]; then
    echo -e "${GREEN}✅ All pricing files updated to 7,000 RWF${NC}"
fi
echo ""

# Check 5: Admin bypass configuration
echo "5️⃣  Checking admin bypass..."
if grep -q "ishimwet822@gmail.com" src/middleware.ts; then
    echo -e "${GREEN}✅ Admin bypass configured in middleware${NC}"
else
    echo -e "${RED}❌ Admin bypass NOT found in middleware${NC}"
fi
echo ""

# Check 6: Product images (logos)
echo "6️⃣  Checking payment provider logos..."
if [ -f "public/mtn-momo.png" ]; then
    echo -e "${GREEN}✅ MTN MoMo logo found${NC}"
else
    echo -e "${YELLOW}⚠️  MTN MoMo logo missing (public/mtn-momo.png)${NC}"
fi

if [ -f "public/airtel-money.png" ]; then
    echo -e "${GREEN}✅ Airtel Money logo found${NC}"
else
    echo -e "${YELLOW}⚠️  Airtel Money logo missing (public/airtel-money.png)${NC}"
fi
echo ""

# Check 7: Network IP
echo "7️⃣  Detecting network IP address..."
if command -v ip &> /dev/null; then
    CURRENT_IP=$(ip addr show | grep "inet 192" | awk '{print $2}' | cut -d/ -f1 | head -n 1)
elif command -v hostname &> /dev/null; then
    CURRENT_IP=$(hostname -I | awk '{print $1}')
else
    CURRENT_IP="Unable to detect"
fi

echo "   Current IP: $CURRENT_IP"
if [ "$CURRENT_IP" = "192.168.43.45" ]; then
    echo -e "${GREEN}✅ IP matches configuration${NC}"
elif [ "$CURRENT_IP" = "Unable to detect" ]; then
    echo -e "${YELLOW}⚠️  Please verify IP manually${NC}"
else
    echo -e "${YELLOW}⚠️  IP has changed! Update .env file${NC}"
    echo "   Expected: 192.168.43.45"
    echo "   Current:  $CURRENT_IP"
fi
echo ""

# Check 8: Node modules
echo "8️⃣  Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Node modules installed${NC}"
else
    echo -e "${RED}❌ Node modules missing${NC}"
    echo "   Run: npm install"
fi
echo ""

# Summary
echo "=============================================="
echo "📊 VERIFICATION SUMMARY"
echo "=============================================="
echo ""
echo "Configuration Status:"
echo "  • Server binding: Check item 1"
echo "  • Firewall: Check item 2"
echo "  • Environment: Check item 3"
echo "  • Pricing: Check item 4"
echo "  • Admin access: Check item 5"
echo "  • Logos: Check item 6"
echo "  • Network IP: Check item 7"
echo "  • Dependencies: Check item 8"
echo ""
echo "Next Steps:"
echo "  1. Fix any ❌ or ⚠️  items above"
echo "  2. Stop current server (Ctrl+C)"
echo "  3. Run: npm run dev"
echo "  4. Test: http://$CURRENT_IP:3000"
echo ""
echo "=============================================="
