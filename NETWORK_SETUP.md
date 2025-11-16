# Kingsman - Network Configuration Guide

## Problem Solved
This guide fixes the issue where the app stops fetching data when you switch internet connections or try to access it from different devices on the network.

## Quick Setup for Network Access

### 1. Find Your IP Address
Run this command in Command Prompt:
```cmd
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.100`)

### 2. Update Frontend Configuration
Edit `Frontend/.env` file:
```env
REACT_APP_API_URL=http://YOUR_IP_ADDRESS:5000/api
REACT_APP_SERVER_URL=http://YOUR_IP_ADDRESS:5000
REACT_APP_SOCKET_URL=http://YOUR_IP_ADDRESS:5000
```

Example:
```env
REACT_APP_API_URL=http://192.168.1.100:5000/api
REACT_APP_SERVER_URL=http://192.168.1.100:5000
REACT_APP_SOCKET_URL=http://192.168.1.100:5000
```

### 3. Configure Firewall (Windows)
Allow these ports through Windows Firewall:
- Port 3000 (Frontend)
- Port 5000 (Backend)

### 4. Start Servers
```cmd
# Backend
cd Backend
npm start

# Frontend (new terminal)
cd Frontend
npm start
```

### 5. Access from Any Device
- Same computer: `http://localhost:3000`
- Other devices: `http://YOUR_IP_ADDRESS:3000`

## Automatic Network Detection

The app now includes smart network detection that:
- ✅ Automatically detects your IP address
- ✅ Retries failed requests when network changes
- ✅ Shows connection status indicators
- ✅ Falls back to localhost when needed

## Troubleshooting

### Issue: App not loading on other devices
**Solution**: Make sure your IP address is correct in the `.env` file and firewall allows the ports.

### Issue: Data not fetching after switching networks
**Solution**: The app now automatically retries failed requests. You'll see a network status indicator.

### Issue: "Connection refused" errors
**Solution**: 
1. Check if backend server is running on port 5000
2. Verify IP address in `.env` file
3. Check Windows Firewall settings

## Network Status Features

The app now includes:
- 🔄 **Automatic retry**: Failed requests retry 3 times
- 🌐 **Network detection**: Shows when you go online/offline
- 📡 **Connection indicator**: Visual feedback for network status
- 🔧 **Smart fallback**: Automatically uses best available connection

## For Developers

### Dynamic Configuration
The app automatically detects:
- If running on localhost vs network IP
- Best API endpoints to use
- Connection failures and retries

### Environment Variables
```env
# Frontend/.env
REACT_APP_API_URL=http://localhost:5000/api       # Backend API
REACT_APP_SERVER_URL=http://localhost:5000        # Backend server
REACT_APP_SOCKET_URL=http://localhost:5000        # WebSocket connection
REACT_APP_ENVIRONMENT=development                 # Environment
```

### Backend Configuration
The backend automatically:
- Accepts connections from any IP (not just localhost)
- Allows CORS from local network IPs (192.168.x.x, 10.x.x.x, etc.)
- Provides health check endpoint at `/api/test/health`

This ensures your Kingsman app works reliably regardless of network changes! 🚀