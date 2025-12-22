# 🍔 Kingsman Food Ordering System

A modern, full-stack food ordering platform built specifically for **CHARUSAT University** campus. Features real-time order tracking, OTP-based authentication, and seamless network switching capabilities.

![Kingsman Banner](https://via.placeholder.com/800x200/facc15/000000?text=Kingsman+Food+Ordering+System)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2016.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%5E18.0.0-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/mongodb-%5E4.4-green)](https://www.mongodb.com/)

## � Live Deployment

🚀 **Frontend:** [https://kingsman-frontend-d18kn8heb-23it060-9815s-projects.vercel.app](https://kingsman-frontend-d18kn8heb-23it060-9815s-projects.vercel.app)  
⚙️ **Backend API:** [https://sgp-kingsman-backend-nsgy412fs-23it060-9815s-projects.vercel.app](https://sgp-kingsman-backend-nsgy412fs-23it060-9815s-projects.vercel.app)

> **Note:** Application is live and fully functional with MongoDB Atlas, JWT authentication, and real-time features enabled.

## �🌟 Features

### 🔐 **Authentication & Security**
- Email-based OTP verification system
- JWT token authentication
- Role-based access (Admin/Customer)
- Secure session management

### 🍽️ **Food Ordering**
- Interactive menu browsing with categories
- Real-time menu updates
- Shopping cart with persistent state
- Order history and tracking

### 📱 **User Experience**
- Fully responsive design (mobile-first)
- Real-time notifications via Socket.io
- Network change detection and auto-recovery
- Loading states and error handling

### 🛠️ **Admin Features**
- Menu management (add/edit/delete items)
- Order management and status updates
- User analytics and reporting
- Vendor dashboard

### 🌐 **Network Reliability**
- Dynamic API URL detection
- Automatic retry mechanisms
- Network change monitoring
- Cross-device compatibility

## 🚀 Tech Stack

### **Frontend**
- **React 18** - Modern UI library with hooks
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client with retry logic
- **React Router** - Navigation and routing
- **React Toastify** - User notifications

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Secure authentication tokens
- **Nodemailer** - Email service integration
- **Winston** - Logging framework

### **Deployment & DevOps**
- **Vercel** - Frontend hosting
- **Railway/Render** - Backend hosting
- **MongoDB Atlas** - Cloud database

## 📦 Project Structure

```
SGP_Kingsman/
├── Frontend/                 # React application
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service functions
│   │   ├── stores/          # Zustand stores
│   │   ├── utils/           # Utility functions
│   │   └── config/          # Configuration files
│   ├── package.json
│   └── .env.example
├── Backend/                  # Node.js API server
│   ├── config/              # Configuration files
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API route handlers
│   ├── middleware/          # Custom middleware
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   ├── uploads/             # File upload directory
│   ├── server.js            # Application entry point
│   ├── package.json
│   └── .env.example
├── docs/                     # Documentation
├── .gitignore
├── README.md
└── vercel.json              # Vercel configuration
```

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB Atlas** account
- **Gmail** account (for email services)

### 1. Clone the Repository
```bash
git clone https://github.com/deep020206/SGP_Kingsman.git
cd SGP_Kingsman
```

### 2. Backend Setup
```bash
cd Backend
npm install
cp .env.example .env
```

Edit `Backend/.env` with your configuration:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_gmail_address
EMAIL_PASSWORD=your_gmail_app_password
```

### 3. Frontend Setup
```bash
cd Frontend
npm install
cp .env.example .env
```

Edit `Frontend/.env` with your configuration:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SERVER_URL=http://localhost:5000
```

### 4. Start Development Servers

**Backend** (Terminal 1):
```bash
cd Backend
npm start
```

**Frontend** (Terminal 2):
```bash
cd Frontend
npm start
```

### 5. Access the Application
- **Local**: `http://localhost:3000`
- **Network**: `http://YOUR_IP:3000` (check terminal output)

## 🌐 Network Configuration

For network access from multiple devices:

1. **Find your IP address**:
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```

2. **Update Frontend/.env**:
   ```env
   REACT_APP_API_URL=http://YOUR_IP:5000/api
   REACT_APP_SERVER_URL=http://YOUR_IP:5000
   ```

3. **Configure Windows Firewall**:
   - Allow ports 3000 and 5000 through firewall

## 🚀 Deployment

### Quick Deploy to Vercel (Frontend)

1. **Fork this repository** to your GitHub account

2. **Deploy to Vercel**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```
   
   Or use the Vercel dashboard:
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set root directory to `Frontend`

3. **Environment Variables** (Add in Vercel dashboard):
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app/api
   REACT_APP_SERVER_URL=https://your-backend-url.railway.app
   REACT_APP_SOCKET_URL=https://your-backend-url.railway.app
   REACT_APP_ENVIRONMENT=production
   ```

### Deploy Backend to Railway

1. **Create Railway Account**: Visit [railway.app](https://railway.app)

2. **Deploy**:
   - Connect your GitHub repository
   - Select `Backend` folder as root
   - Add environment variables
   - Deploy automatically

3. **Environment Variables** (Add in Railway dashboard):
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_gmail_address
   EMAIL_PASSWORD=your_gmail_app_password
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

### Alternative: Deploy Backend to Render

1. **Create Render Account**: Visit [render.com](https://render.com)

2. **Create Web Service**:
   - Connect GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Set environment to `Backend` folder

## 🧪 Testing

### Run Tests
```bash
# Frontend tests
cd Frontend
npm test

# Backend tests  
cd Backend
npm test
```

### Network Testing
Open `network-test.html` in your browser to test network connectivity.

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Menu Endpoints
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get specific menu item
- `POST /api/menu` - Create menu item (Admin)
- `PUT /api/menu/:id` - Update menu item (Admin)
- `DELETE /api/menu/:id` - Delete menu item (Admin)

### Order Endpoints
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get specific order
- `PUT /api/orders/:id/status` - Update order status (Admin)

## 🛡️ Security Features

- **JWT Authentication** with secure token storage
- **OTP Verification** for account security
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for cross-origin requests
- **Input Validation** and sanitization
- **Environment Variable** protection

## 📊 Performance Features

- **Code Splitting** with React.lazy()
- **Image Optimization** with lazy loading
- **Caching Strategies** for API responses
- **Bundle Optimization** with Webpack
- **Real-time Updates** without polling

## 🐛 Troubleshooting

### Common Issues

1. **"Network Error" when switching connections**:
   - Solution: App automatically detects and handles this
   - Check browser console for network logs

2. **OTP not received**:
   - Check Gmail app password configuration
   - Verify email service settings in backend

3. **Cannot access from other devices**:
   - Update `.env` with your actual IP address
   - Configure Windows Firewall settings

4. **Build failures on Vercel**:
   - Check environment variables are set
   - Ensure Node.js version compatibility
   - Review build logs for specific errors

5. **CORS errors in production**:
   - Update `FRONTEND_URL` in backend environment variables
   - Ensure backend allows your frontend domain

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: Deep Amarodiya
- **Institution**: CHARUSAT University
- **Project**: SGP (Software Group Project)

## 📞 Support

For support and queries:
- **Email**: damarodiya8314@gmail.com
- **GitHub Issues**: [Create an issue](https://github.com/deep020206/SGP_Kingsman/issues)

## 🎉 Acknowledgments

- CHARUSAT University for project support
- MongoDB Atlas for database hosting
- Vercel for frontend deployment
- Railway for backend hosting
- All contributors and testers

---

**⭐ Star this repository if you find it helpful!**

**🍔 Made with ❤️ for CHARUSAT University community**