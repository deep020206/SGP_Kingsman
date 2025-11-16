# 🗄️ MongoDB Atlas Setup Guide

## 🎯 Current Configuration

**Atlas Connection String**: 
```
mongodb+srv://23it060:<db_password>@cluster0.sn6d5ao.mongodb.net/sgp_kingsman?retryWrites=true&w=majority&appName=Cluster0
```

---

## ⚡ Quick Setup Steps

### 1. **Get Your Database Password**
- Log into [MongoDB Atlas](https://cloud.mongodb.com/)
- Go to **Database Access** → **Database Users**
- Find user `23it060` and note/reset the password

### 2. **Update Environment Configuration**

Replace `<db_password>` in your `.env` file:

**Backend `.env` file:**
```env
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://23it060:YOUR_ACTUAL_PASSWORD@cluster0.sn6d5ao.mongodb.net/sgp_kingsman?retryWrites=true&w=majority&appName=Cluster0
```

### 3. **Verify Network Access**
- In Atlas Dashboard → **Network Access**
- Ensure your IP address is whitelisted
- For development, you can use `0.0.0.0/0` (allow from anywhere)

### 4. **Test Connection**
```bash
cd backend
npm run dev
```

Look for: `✅ Connected to MongoDB Atlas successfully`

---

## 🔧 Database Structure

### **Database Name**: `sgp_kingsman`

### **Collections** (Auto-created):
- `users` - User accounts and profiles
- `menuitems` - Food items and vendor menus  
- `orders` - Customer orders and tracking
- `notifications` - System notifications
- `ratings` - User ratings and reviews
- `vendoranalytics` - Sales and performance data

---

## 🚀 Production Configuration

### **For Heroku Deployment:**
```bash
heroku config:set MONGODB_URI="mongodb+srv://23it060:YOUR_PASSWORD@cluster0.sn6d5ao.mongodb.net/sgp_kingsman?retryWrites=true&w=majority&appName=Cluster0"
```

### **For Vercel/Netlify:**
Add to environment variables in dashboard:
```
MONGODB_URI=mongodb+srv://23it060:YOUR_PASSWORD@cluster0.sn6d5ao.mongodb.net/sgp_kingsman?retryWrites=true&w=majority&appName=Cluster0
```

---

## 🛡️ Security Best Practices

### **✅ Recommended Settings:**

1. **Database User**: `23it060` (read/write access)
2. **Network Access**: Specific IP addresses (production)
3. **Database Name**: `sgp_kingsman` 
4. **Connection Options**:
   - `retryWrites=true` - Automatic retry for write operations
   - `w=majority` - Write concern for data safety
   - `appName=Cluster0` - Application identification

### **🔐 Security Checklist:**
- [ ] Strong password for database user
- [ ] IP whitelist configured (not 0.0.0.0/0 in production)
- [ ] Environment variables properly secured
- [ ] Connection string not exposed in code
- [ ] Regular password rotation schedule

---

## 📊 Connection Monitoring

### **Atlas Dashboard**:
- Monitor connection count
- Check query performance  
- View error logs
- Track data usage

### **Application Logs**:
```bash
# View MongoDB connection status
cd backend
npm run dev

# Look for these messages:
✅ Connected to MongoDB Atlas successfully
❌ MongoDB connection error: [error details]
```

---

## 🆘 Troubleshooting

### **Common Issues:**

#### **"Authentication failed"**
- Check password in connection string
- Verify user exists in Database Access

#### **"Connection timeout"**
- Check Network Access whitelist
- Verify internet connection
- Try different network/VPN

#### **"Database not found"**
- Database will be created automatically on first write
- Check database name spelling: `sgp_kingsman`

#### **"Too many connections"**
- Atlas M0 (free tier) has connection limits
- Check for connection leaks in code
- Consider upgrading Atlas tier

---

## 🎉 Success Indicators

When everything is working correctly, you'll see:

### **Backend Console:**
```
🚀 Server running on port 5000
✅ Connected to MongoDB Atlas successfully
📱 Socket.IO server initialized
```

### **Atlas Dashboard:**
- Active connections showing
- Data operations logged
- No error alerts

---

**Need Help?** 
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Connection Troubleshooting Guide](https://docs.atlas.mongodb.com/troubleshoot-connection/)
- [Atlas Support](https://support.mongodb.com/)