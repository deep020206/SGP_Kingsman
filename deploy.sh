#!/bin/bash

# Kingsman Deployment Script
# This script helps deploy your Kingsman app to production

echo "🍔 Kingsman Food Ordering System - Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo ""
print_info "This script will help you deploy your Kingsman app to production."
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_error "Git repository not found! Please run this script from the project root."
    exit 1
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    print_error "Git remote 'origin' not found! Please add your GitHub repository."
    echo "Run: git remote add origin https://github.com/yourusername/SGP_Kingsman.git"
    exit 1
fi

echo "🚀 Deployment Steps:"
echo "1. Frontend (Vercel)"
echo "2. Backend (Railway)"
echo "3. Database (MongoDB Atlas)"
echo ""

print_info "Step 1: Frontend Deployment (Vercel)"
echo "1. Visit https://vercel.com and sign in"
echo "2. Click 'New Project'"
echo "3. Import your GitHub repository"
echo "4. Set Root Directory to: Frontend"
echo "5. Framework Preset: Create React App"
echo "6. Add these environment variables:"
echo ""
echo "   REACT_APP_API_URL=https://your-backend-url.railway.app/api"
echo "   REACT_APP_SERVER_URL=https://your-backend-url.railway.app"
echo "   REACT_APP_SOCKET_URL=https://your-backend-url.railway.app"
echo "   REACT_APP_ENVIRONMENT=production"
echo ""

read -p "Press Enter after setting up Vercel frontend..."

print_info "Step 2: Backend Deployment (Railway)"
echo "1. Visit https://railway.app and sign in"
echo "2. Click 'New Project'"
echo "3. Select 'Deploy from GitHub repo'"
echo "4. Choose your repository"
echo "5. Set Root Directory to: Backend"
echo "6. Add these environment variables:"
echo ""
echo "   NODE_ENV=production"
echo "   MONGODB_URI=your_mongodb_atlas_connection_string"
echo "   JWT_SECRET=your_super_secret_jwt_key"
echo "   EMAIL_USER=your_gmail_address"
echo "   EMAIL_PASSWORD=your_gmail_app_password"
echo "   FRONTEND_URL=https://your-frontend-url.vercel.app"
echo ""

read -p "Press Enter after setting up Railway backend..."

print_info "Step 3: Database Setup (MongoDB Atlas)"
echo "1. Visit https://cloud.mongodb.com"
echo "2. Create a cluster (free tier available)"
echo "3. Create a database user"
echo "4. Allow network access (0.0.0.0/0 for production)"
echo "5. Get connection string and update MONGODB_URI"
echo ""

read -p "Press Enter after setting up MongoDB Atlas..."

print_info "Step 4: Update Environment Variables"
echo "Now update your environment variables with the actual URLs:"
echo ""
echo "In Railway (Backend):"
echo "- FRONTEND_URL should be your Vercel frontend URL"
echo ""
echo "In Vercel (Frontend):"
echo "- REACT_APP_API_URL should be your Railway backend URL + /api"
echo "- REACT_APP_SERVER_URL should be your Railway backend URL"
echo "- REACT_APP_SOCKET_URL should be your Railway backend URL"
echo ""

read -p "Press Enter after updating environment variables..."

print_status "Deployment Complete!"
echo ""
print_info "Your Kingsman app should now be live!"
echo ""
echo "Frontend: https://your-app.vercel.app"
echo "Backend: https://your-api.railway.app"
echo ""
print_info "Test your deployment:"
echo "1. Visit your frontend URL"
echo "2. Try signing up with OTP"
echo "3. Browse the menu"
echo "4. Place a test order"
echo "5. Check admin features"
echo ""
print_warning "Remember to:"
echo "- Test all features thoroughly"
echo "- Monitor error logs"
echo "- Set up proper domain names if needed"
echo "- Configure SSL certificates"
echo ""
print_status "Happy food ordering! 🍔"