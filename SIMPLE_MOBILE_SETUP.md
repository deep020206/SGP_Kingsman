# 📱 Simple Mobile Setup Guide

## Your Computer's IP Address: 192.168.0.120

## Step 1: Start Your App
1. Open 2 PowerShell windows
2. In first window:
   ```
   cd "C:\Users\Lenovo\Desktop\Kingsmen 3\SGP_Kingsman\backend"
   npm start
   ```
3. In second window:
   ```
   cd "C:\Users\Lenovo\Desktop\Kingsmen 3\SGP_Kingsman\frontend"
   npm start
   ```

## Step 2: Test on Your Computer First
- Open browser and go to: `http://localhost:3000`
- Make sure your app works properly

## Step 3: Access from Mobile (Same WiFi)
1. Make sure your mobile is connected to the **same WiFi** as your computer
2. On your mobile, open any browser
3. Go to: `http://192.168.0.120:3000`
4. You should see your food ordering app!

## That's It! 🎉

### ❓ What if it doesn't work?
1. **Check WiFi**: Both devices must be on same WiFi network
2. **Check Firewall**: Windows might be blocking the connection
3. **Try this**: Turn off Windows Firewall temporarily to test

### 🔧 If still not working:
1. Press `Windows + R`
2. Type `firewall.cpl` and press Enter
3. Click "Turn Windows Defender Firewall on or off"
4. Turn off firewall for "Private networks" temporarily
5. Try accessing `http://192.168.0.120:3000` from mobile again

### ✅ To verify it's working:
- You should see the same food ordering interface on mobile
- You can browse menus, place orders, everything should work
- Data will show because it's using MongoDB Atlas (cloud database)

**Your mobile URL: http://192.168.0.120:3000**