# SGP Kingsman - Food Ordering System

A full-stack food ordering system built with React.js frontend and Node.js/Express.js backend. This application enables students to order food from vendors with real-time order tracking, vendor management, and analytics.

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

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **React Icons** - Icon library
- **React Toastify** - Toast notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Winston** - Logging
- **Multer** - File uploads

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

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables in `.env`:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/foodordering
   JWT_SECRET=your-secret-key
   NODE_ENV=development
   ```

5. **Create uploads directory:**
   ```bash
   mkdir uploads
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```

   The backend server will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   The frontend application will start on `http://localhost:3000`

## 🗄️ Database Setup

### MongoDB Setup
1. Install MongoDB on your system
2. Start MongoDB service
3. The application will automatically create the required collections

### Seeding Data (Optional)
```bash
cd backend
npm run seed:instructions
npm run seed:notifications
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build the application (if applicable)
3. Deploy to your preferred hosting service (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the production version:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the `build` folder to your hosting service (Netlify, Vercel, etc.)

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

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Deep** - *Initial work* - [deep020206](https://github.com/deep020206)

## 🙏 Acknowledgments

- Thanks to all contributors who helped with this project
- Inspiration from modern food delivery applications
- Built as part of Software Group Project (SGP)

## 🐛 Issues & Support

If you encounter any issues or need support:
1. Check the [Issues](https://github.com/deep020206/SGP_Kingsman/issues) page
2. Create a new issue if your problem isn't already listed
3. Provide detailed information about the problem

## 📈 Future Enhancements

- [ ] Payment gateway integration
- [ ] Push notifications
- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Delivery tracking with maps
- [ ] Inventory management
- [ ] Promotional codes and discounts
