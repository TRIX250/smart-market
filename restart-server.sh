#!/bin/bash
# Clean restart script for SmartMarket Manager

echo "🔄 Restarting SmartMarket Manager..."
echo ""

# Kill any running Next.js processes
echo "1️⃣ Stopping any running servers..."
pkill -f "next dev" 2>/dev/null || true
sleep 1

# Clear Next.js cache
echo "2️⃣ Clearing Next.js cache..."
rm -rf .next
echo "   ✅ Cache cleared"

# Verify configuration
echo ""
echo "3️⃣ Verifying configuration..."
echo "   Dev script: $(grep '"dev":' package.json)"
echo ""

# Start fresh
echo "4️⃣ Starting fresh server..."
echo "   Run: npm run dev"
echo ""
echo "✅ Ready to start!"
