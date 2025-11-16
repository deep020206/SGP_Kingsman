# 🔐 **System Credentials Reference**

## 👑 **Admin Account (Shop Owner)**
- **Email:** `damarodiya8314@gmail.com`
- **Password:** `admin123`
- **Role:** Admin (automatically assigned)
- **Access:** Full dashboard, vendor orders, analytics

## 👤 **Test Customer Account** 
- **Email:** `student@gmail.com` (or any other email)
- **Password:** `student123` (if using existing seed data)
- **Role:** Customer (automatically assigned)
- **Access:** User dashboard, order placement, favorites

## 🔧 **How to Create New Accounts:**

### For Admin Access:
1. Only `damarodiya8314@gmail.com` can get admin role
2. Sign up with this exact email address
3. System automatically assigns admin role
4. Access full shop management features

### For Customer Access:
1. Sign up with any other email address
2. System automatically assigns customer role
3. Access ordering and favorites features

## 🛠️ **If Admin Account Doesn't Exist:**
Run the seed script to create the admin account:
```bash
cd Backend
node seed.js
```

## 🔒 **Security Notes:**
- Admin role is restricted to authorized email only
- No manual role selection possible
- Role assignment is automatic and secure
- Environment controlled authorization

---
**Quick Test Login:**
- **Admin:** `damarodiya8314@gmail.com` / `admin123`
- **Customer:** Any other email after signup