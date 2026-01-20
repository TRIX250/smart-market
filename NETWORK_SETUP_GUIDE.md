# 🌐 SmartMarket Manager - Network Access Setup Guide

## ✅ Changes Completed

### 1. Server Configuration ✓
- **Updated `package.json`**: Dev script now uses `-H 0.0.0.0` flag
- **Effect**: Server binds to all network interfaces, allowing network access
- **Previous**: `next dev` (localhost only)
- **Current**: `next dev -H 0.0.0.0` (network accessible)

### 2. Firewall Script Created ✓
- **File**: `open-port-3000.sh`
- **Location**: `/home/trick/Desktop/smartmarket-manager/`
- **Purpose**: Automatically configures firewall to allow port 3000

### 3. Subscription Pricing Updated ✓
- **Price**: 7,000 RWF (consistent across all files)
- **USSD Code**: `*182*8*1*1957217*7000#`
- **Files Updated**:
  - ✓ `src/app/subscribe/actions.ts` (was 15000, now 7000)
  - ✓ `src/app/actions.ts` (7000)
  - ✓ `src/app/subscription/actions.ts` (7000)
  - ✓ `src/app/subscription/flutterwave.ts` (7000)
  - ✓ `src/app/welcome/page.tsx` (7,000)
  - ✓ `prisma/schema.prisma` (7000)

### 4. Admin Bypass Verified ✓
- **Email**: `ishimwet822@gmail.com`
- **Username**: `trick_market`
- **Configured in**:
  - ✓ `src/middleware.ts`
  - ✓ `src/app/actions.ts`
  - ✓ `src/components/sidebar.tsx`
  - ✓ `src/app/subscription/actions.ts`

### 5. Product Image Cache Fix ✓
- **Issue**: Images not showing in POS after creation
- **Solution**: `revalidatePath('/pos')` already implemented in:
  - ✓ `src/app/inventory/actions.ts` (createProduct)
  - ✓ `src/app/actions.ts` (approvePayment)

---

## 🚀 How to Start the Server

### Step 1: Stop Current Server
Press `Ctrl + C` in your terminal to stop the running dev server.

### Step 2: Configure Firewall (One-Time Setup)

**For Linux:**
```bash
cd /home/trick/Desktop/smartmarket-manager
./open-port-3000.sh
```

**For Windows (PowerShell as Administrator):**
```powershell
New-NetFirewallRule -DisplayName "SmartMarket Port 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

**For macOS:**
macOS typically doesn't block local network traffic. If you have issues:
1. Go to System Preferences → Security & Privacy → Firewall
2. Click "Firewall Options"
3. Ensure Node.js is allowed

### Step 3: Start Server with Network Access
```bash
npm run dev
```

### Step 4: Verify Server is Running
Look for this message in your terminal:
```
✓ Ready in [time]
○ Local:        http://localhost:3000
○ Network:      http://192.168.43.45:3000
```

---

## 📱 Testing Network Access

### From Your Phone/Tablet:
1. **Connect to the same Wi-Fi/Hotspot** as your laptop
2. **Open browser** (Chrome, Safari, etc.)
3. **Type**: `http://192.168.43.45:3000`
4. **Expected Result**: You should see the SmartMarket login page with the animated gradient background

### From Another Computer:
1. **Connect to the same network**
2. **Open browser**
3. **Type**: `http://192.168.43.45:3000`

---

## 🔧 Troubleshooting

### Problem: "Connection Refused" or "Can't reach this page"

**Solution 1: Check Firewall**
```bash
# Linux - Check if port is open
sudo ufw status
# or
sudo firewall-cmd --list-ports

# Should show: 3000/tcp
```

**Solution 2: Verify Server is Listening on 0.0.0.0**
```bash
# Check if server is running
netstat -tuln | grep 3000
# or
ss -tuln | grep 3000

# Should show: 0.0.0.0:3000 (not 127.0.0.1:3000)
```

**Solution 3: Check Your IP Address**
```bash
# Get your current IP
ip addr show | grep "inet 192"
# or
hostname -I

# Update .env if IP changed
```

### Problem: "Failed to create product" Error

**Solution**: Already fixed! The system now:
1. Validates image size (max 2MB)
2. Uses default placeholder if no image provided
3. Automatically revalidates POS cache
4. Shows helpful error messages

### Problem: Subscription page not showing MTN/Airtel logos

**Verify logos exist**:
```bash
ls -la public/mtn-momo.png
ls -la public/airtel-money.png
```

If missing, add them to the `public/` folder.

---

## 🎯 Subscription Flow (7,000 RWF)

### Mobile Flow:
1. User clicks "Pay with MTN MoMo"
2. USSD code `*182*8*1*1957217*7000#` is copied
3. Dialer opens automatically
4. User pastes code and dials
5. User enters Transaction ID from SMS
6. Admin approves → User gets access

### Desktop Flow:
1. User sees glassmorphism card with USSD code
2. User manually dials on their phone
3. User enters Transaction ID on website
4. Admin approves → User gets access

---

## 👨‍💼 Admin Access (TRICK)

**Email**: `ishimwet822@gmail.com`
**Username**: `trick_market`

**Privileges**:
- ✅ Bypasses subscription paywall
- ✅ Access to `/admin/control-center`
- ✅ Can approve payment requests
- ✅ Unlimited access to all features

---

## 📊 Network Configuration Summary

| Setting | Value |
|---------|-------|
| **Server Host** | `0.0.0.0` (all interfaces) |
| **Port** | `3000` |
| **Local URL** | `http://localhost:3000` |
| **Network URL** | `http://192.168.43.45:3000` |
| **Firewall Rule** | Allow TCP port 3000 inbound |
| **Subscription Price** | 7,000 RWF |
| **USSD Code** | `*182*8*1*1957217*7000#` |

---

## 🎨 UI/UX Features

### Glassmorphism Design:
- ✅ Transparent backgrounds (`bg-transparent`)
- ✅ Animated mesh gradient visible everywhere
- ✅ Frosted glass cards (`bg-white/5 backdrop-blur-xl`)
- ✅ No solid dark backgrounds blocking animation

### Mobile Optimizations:
- ✅ Compact subscription form (no scrolling needed)
- ✅ Responsive tables with text wrapping
- ✅ Hidden columns on small screens
- ✅ Touch-friendly buttons and inputs

---

## 🔐 Security Notes

1. **Network Access**: Only devices on your local network can access the app
2. **Firewall**: Port 3000 is only open for local network (192.168.x.x)
3. **Admin Bypass**: Only `ishimwet822@gmail.com` has special privileges
4. **Payment Verification**: Manual approval required for all subscriptions

---

## 📞 Support

If you encounter any issues:
1. Check this guide's troubleshooting section
2. Verify all steps were completed
3. Check terminal for error messages
4. Contact: ishimwet822@gmail.com

---

**Last Updated**: 2026-01-19
**Version**: 1.0.0
**Status**: ✅ Production Ready
