#!/bin/bash
# Quick Start Script for SmartMarket Manager Network Access
# Run this script to configure everything in one go

echo "🚀 SmartMarket Manager - Quick Network Setup"
echo "=============================================="
echo ""

# Step 1: Configure Firewall
echo "📡 Step 1: Configuring Firewall..."
./open-port-3000.sh

echo ""
echo "=============================================="
echo ""

# Step 2: Display Network Info
echo "📊 Step 2: Network Information"
echo "------------------------------"
echo "Your IP Address:"
if command -v ip &> /dev/null; then
    ip addr show | grep "inet 192" | awk '{print $2}' | cut -d/ -f1
elif command -v hostname &> /dev/null; then
    hostname -I | awk '{print $1}'
else
    echo "Unable to detect IP automatically"
    echo "Please check your network settings"
fi

echo ""
echo "Server will be accessible at:"
echo "  • Local:   http://localhost:3000"
echo "  • Network: http://192.168.43.45:3000"
echo ""

# Step 3: Instructions
echo "=============================================="
echo "📋 Next Steps:"
echo "------------------------------"
echo "1. Stop current server (Ctrl+C if running)"
echo "2. Run: npm run dev"
echo "3. Look for 'Network: http://192.168.43.45:3000'"
echo "4. Test from phone: http://192.168.43.45:3000"
echo ""
echo "✅ Admin Access:"
echo "   Email: ishimwet822@gmail.com"
echo "   Username: trick_market"
echo ""
echo "💰 Subscription:"
echo "   Price: 7,000 RWF"
echo "   USSD: *182*8*1*1957217*7000#"
echo ""
echo "=============================================="
echo "🎉 Setup Complete! Ready to start server."
echo ""
