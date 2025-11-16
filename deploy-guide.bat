@echo off
title Kingsman Deployment Guide

echo.
echo 🍔 Kingsman Food Ordering System - Deployment Guide
echo ==================================================
echo.

echo This guide will walk you through deploying your Kingsman app to production.
echo.

echo 🚀 DEPLOYMENT STEPS:
echo.

echo ═══════════════════════════════════════════════════════════════
echo 📦 STEP 1: FRONTEND DEPLOYMENT (VERCEL)
echo ═══════════════════════════════════════════════════════════════
echo.
echo 1. Visit https://vercel.com and sign in with GitHub
echo 2. Click "New Project"
echo 3. Import your GitHub repository: deep020206/SGP_Kingsman
echo 4. Configure project settings:
echo    - Root Directory: Frontend
echo    - Framework Preset: Create React App
echo    - Build Command: npm run build
echo    - Output Directory: build
echo.
echo 5. Add Environment Variables in Vercel dashboard:
echo    REACT_APP_API_URL=https://your-backend-url.railway.app/api
echo    REACT_APP_SERVER_URL=https://your-backend-url.railway.app
echo    REACT_APP_SOCKET_URL=https://your-backend-url.railway.app
echo    REACT_APP_ENVIRONMENT=production
echo.
pause

echo.
echo ═══════════════════════════════════════════════════════════════
echo 🖥️  STEP 2: BACKEND DEPLOYMENT (RAILWAY)
echo ═══════════════════════════════════════════════════════════════
echo.
echo 1. Visit https://railway.app and sign in with GitHub
echo 2. Click "New Project"
echo 3. Select "Deploy from GitHub repo"
echo 4. Choose repository: deep020206/SGP_Kingsman
echo 5. Set Root Directory: Backend
echo.
echo 6. Add Environment Variables in Railway dashboard:
echo    NODE_ENV=production
echo    PORT=5000
echo    MONGODB_URI=your_mongodb_atlas_connection_string
echo    JWT_SECRET=your_super_secret_jwt_key
echo    EMAIL_USER=your_gmail_address
echo    EMAIL_PASSWORD=your_gmail_app_password
echo    FRONTEND_URL=https://your-frontend-url.vercel.app
echo    AUTHORIZED_ADMIN_EMAILS=damarodiya8314@gmail.com
echo.
pause

echo.
echo ═══════════════════════════════════════════════════════════════
echo 🗄️  STEP 3: DATABASE SETUP (MONGODB ATLAS)
echo ═══════════════════════════════════════════════════════════════
echo.
echo 1. Visit https://cloud.mongodb.com
echo 2. Sign in or create account
echo 3. Create a new cluster (M0 Sandbox - FREE)
echo 4. Create database user:
echo    - Username: your_username
echo    - Password: your_secure_password
echo 5. Configure Network Access:
echo    - Add IP: 0.0.0.0/0 (Allow access from anywhere)
echo 6. Get connection string:
echo    - Click "Connect" → "Connect your application"
echo    - Copy connection string
echo    - Replace ^<password^> with your actual password
echo.
pause

echo.
echo ═══════════════════════════════════════════════════════════════
echo 📧 STEP 4: EMAIL SETUP (GMAIL)
echo ═══════════════════════════════════════════════════════════════
echo.
echo 1. Go to your Google Account settings
echo 2. Enable 2-Factor Authentication
echo 3. Generate App Password:
echo    - Go to Security → App passwords
echo    - Select "Mail" and your device
echo    - Copy the generated 16-character password
echo 4. Use this app password in EMAIL_PASSWORD (not your regular Gmail password)
echo.
pause

echo.
echo ═══════════════════════════════════════════════════════════════
echo 🔄 STEP 5: UPDATE CROSS-REFERENCES
echo ═══════════════════════════════════════════════════════════════
echo.
echo After both deployments are complete:
echo.
echo 1. Copy your Railway backend URL (e.g., https://sgp-kingsman-backend-production.up.railway.app)
echo 2. Update Vercel environment variables with this backend URL
echo 3. Copy your Vercel frontend URL (e.g., https://sgp-kingsman.vercel.app)  
echo 4. Update Railway FRONTEND_URL with this frontend URL
echo 5. Redeploy both services
echo.
pause

echo.
echo ═══════════════════════════════════════════════════════════════
echo ✅ STEP 6: TESTING
echo ═══════════════════════════════════════════════════════════════
echo.
echo Test your deployed application:
echo.
echo 1. Visit your Vercel frontend URL
echo 2. Test user registration with OTP verification
echo 3. Test login functionality
echo 4. Browse menu items
echo 5. Test adding items to cart
echo 6. Test placing orders
echo 7. Test admin login (if you have admin access)
echo 8. Test real-time features
echo.
pause

echo.
echo ═══════════════════════════════════════════════════════════════
echo 🎉 DEPLOYMENT COMPLETE!
echo ═══════════════════════════════════════════════════════════════
echo.
echo Your Kingsman Food Ordering System is now live! 🚀
echo.
echo 📱 Frontend: https://your-app.vercel.app
echo 🖥️  Backend:  https://your-api.railway.app
echo 🗄️  Database: MongoDB Atlas
echo.
echo 🔗 GitHub Repository: https://github.com/deep020206/SGP_Kingsman
echo.
echo 💡 TIPS:
echo - Monitor both services for any errors
echo - Check logs if something doesn't work
echo - You can always redeploy by pushing to GitHub
echo - Consider setting up custom domains for production
echo.
echo ⭐ Don't forget to star the repository if deployment was successful!
echo.
echo 🍔 Happy food ordering!
echo.
pause