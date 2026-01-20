#!/bin/bash
# Firewall Configuration Script for SmartMarket Manager
# This script opens port 3000 for network access

echo "🔥 Configuring Firewall for SmartMarket Manager..."
echo "📡 Opening Port 3000 for Network Access"
echo ""

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Detected Linux System"
    
    # Check if UFW is installed
    if command -v ufw &> /dev/null; then
        echo "Using UFW (Uncomplicated Firewall)..."
        sudo ufw allow 3000/tcp
        sudo ufw status
        echo "✅ Port 3000 opened via UFW"
    # Check if firewalld is installed
    elif command -v firewall-cmd &> /dev/null; then
        echo "Using firewalld..."
        sudo firewall-cmd --permanent --add-port=3000/tcp
        sudo firewall-cmd --reload
        sudo firewall-cmd --list-ports
        echo "✅ Port 3000 opened via firewalld"
    # Fallback to iptables
    else
        echo "Using iptables..."
        sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
        sudo iptables -L
        echo "✅ Port 3000 opened via iptables"
        echo "⚠️  Note: This rule may not persist after reboot"
    fi
    
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Detected macOS"
    echo "macOS typically doesn't block local network traffic by default."
    echo "If you have issues, check System Preferences > Security & Privacy > Firewall"
    
else
    echo "❌ Unsupported OS: $OSTYPE"
    echo "Please configure your firewall manually to allow port 3000"
fi

echo ""
echo "🎉 Firewall configuration complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Restart your dev server: npm run dev"
echo "   2. Look for: 'ready - started server on http://192.168.43.45:3000'"
echo "   3. Test from another device: http://192.168.43.45:3000"
echo ""
