# 🍽️ SGP Kingsman - Enterprise Food Ordering Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2016.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%5E18.0.0-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/mongodb-%5E4.4-green)](https://www.mongodb.com/)

A **professional-grade, full-stack food ordering platform** designed for educational institutions. Built with modern web technologies including React 18, Node.js, Express, MongoDB, and real-time Socket.IO communication.

## ✨ Key Highlights

- 🚀 **Modern Stack**: React 18 + Node.js + Express + MongoDB + Socket.IO
- 📱 **Mobile-First Design**: Responsive UI with Tailwind CSS
- 🔐 **Enterprise Security**: JWT authentication with bcrypt encryption
- ⚡ **Real-Time Updates**: Live order tracking and notifications
- 🎨 **Professional UI/UX**: Dark/light mode with smooth animations
- 📊 **Analytics Dashboard**: Comprehensive vendor analytics
- 🔍 **Advanced Search**: Multi-criteria filtering and search
- 📦 **Scalable Architecture**: Modular design with service layers

## 🚀 Features

### For Students
- **User Authentication** - Secure login and registration
- **Browse Menus** - View available food items from different vendors
- **Place Orders** - Individual and group ordering capabilities
- **Real-time Tracking** - Track order status in real-time
- **Rating & Reviews** - Rate vendors and food items
- **Order History** - View past orders and reorder favorites

### For Vendors
- **Vendor Dashboard** - Comprehensive management interface
- **Menu Management** - Add, edit, and remove menu items
- **Order Management** - Accept, prepare, and complete orders
- **Analytics** - View sales analytics and performance metrics
- **Real-time Notifications** - Get notified of new orders instantly

### Technical Features
- **Real-time Communication** - Socket.IO for live updates
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Dark Mode Support** - Toggle between light and dark themes
- **RESTful API** - Clean and documented API endpoints
- **JWT Authentication** - Secure token-based authentication
- **File Upload** - Image uploads for menu items
- **Search & Filter** - Advanced search and filtering capabilities

## 🛠️ Technology Stack

### 🎨 Frontend Technologies
- **React 18** - Latest React with concurrent features
- **Tailwind CSS 3** - Utility-first CSS framework
- **Framer Motion** - Production-ready motion library
- **React Router v6** - Declarative routing
- **Axios** - Promise-based HTTP client
- **Socket.IO Client** - Real-time bidirectional communication
- **React Icons** - Popular icon library
- **React Toastify** - Beautiful toast notifications

### ⚙️ Backend Technologies  
- **Node.js 16+** - JavaScript runtime environment
- **Express.js 4** - Fast, unopinionated web framework
- **MongoDB 4.4+** - NoSQL document database
- **Mongoose 6** - Elegant MongoDB object modeling
- **Socket.IO** - Real-time engine
- **JWT** - JSON Web Token implementation
- **bcryptjs** - Password hashing library
- **Winston** - Universal logging library
- **Multer** - Middleware for file uploads
- **Helmet** - Security middleware

### 🔧 Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting  
- **Git** - Version control
- **VS Code** - Recommended IDE

## 📁 Project Structure

```
SGP_Kingsman/
├── frontend/                 # React.js frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   │   ├── Auth/        # Authentication components
│   │   │   ├── Dashboard/   # Dashboard components
│   │   │   ├── LandingPage/ # Landing page components
│   │   │   ├── Layout/      # Layout components
│   │   │   ├── Menu/        # Menu components
│   │   │   ├── Notifications/ # Notification components
│   │   │   ├── Orders/      # Order components
│   │   │   └── Search/      # Search components
│   │   ├── api/            # API configuration
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # Service layer
│   │   └── config/         # Configuration files
│   ├── public/             # Static assets
│   └── build/              # Production build (generated)
├── backend/                 # Node.js backend application
│   ├── config/             # Configuration files
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # Express routes
│   ├── services/           # Business logic services
│   ├── utils/              # Utility functions
│   ├── logs/               # Application logs
│   └── uploads/            # File uploads directory
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

## 🚀 Quick Start Guide

### 📋 Prerequisites
- **Node.js** v16.0.0 or higher ([Download](https://nodejs.org/))
- **MongoDB** v4.4 or higher ([Download](https://www.mongodb.com/try/download/community))
- **Git** ([Download](https://git-scm.com/downloads))

### ⚡ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/deep020206/SGP_Kingsman.git
   cd SGP_Kingsman
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   
   # Create environment file
   cp .env.example .env
   
   # Edit .env with your configuration
   # Required: MONGODB_URI, JWT_SECRET, PORT
   
   # Start development server
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the application:**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

### 🔐 Environment Configuration

Create `.env` file in backend directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/sgp_kingsman

# Security
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS
FRONTEND_URL=http://localhost:3000
```

## � Development & Production

### 🔧 Development Commands
```bash
# Backend development
cd backend
npm run dev          # Start with nodemon
npm run seed         # Seed database with sample data
npm run logs         # View application logs

# Frontend development  
cd frontend
npm start            # Start development server
npm run build        # Create production build
npm run lint         # Run ESLint
```

### 🚀 Production Deployment

#### Backend (Node.js)
```bash
cd backend
npm install --production
npm start
```

#### Frontend (Static)
```bash
cd frontend
npm run build
# Deploy /build folder to static hosting (Netlify, Vercel, etc.)
```

### 🐳 Docker Support (Optional)
```bash
# Run with Docker Compose
docker-compose up -d

# Or build individual containers
docker build -t sgp-backend ./backend
docker build -t sgp-frontend ./frontend
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### User Endpoints
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Menu Endpoints
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Order Endpoints
- `GET /api/orders` - Get orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status
- `GET /api/orders/:id` - Get order by ID

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### � Contribution Guidelines
- Follow existing code style and conventions
- Write clear commit messages
- Update documentation for new features
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Deep Patel** - *Lead Developer* - [@deep020206](https://github.com/deep020206)

## 🙏 Acknowledgments

- Built as part of **Software Group Project (SGP)**
- Inspired by modern food delivery platforms
- Thanks to the open-source community for amazing tools and libraries

## 🔗 Links

- **Repository**: [https://github.com/deep020206/SGP_Kingsman](https://github.com/deep020206/SGP_Kingsman)
- **Issues**: [Report a bug or request a feature](https://github.com/deep020206/SGP_Kingsman/issues)
- **Wiki**: [Project documentation and guides](https://github.com/deep020206/SGP_Kingsman/wiki)

## � Project Status

**Current Version**: 1.0.0  
**Status**: Active Development  
**Last Updated**: September 2025

---

<div align="center">
  <p><strong>⭐ Star this repository if you find it helpful!</strong></p>
  <p>Made with ❤️ for the SGP community</p>
</div>
