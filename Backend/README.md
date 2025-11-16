# Food Ordering System Backend

A Node.js/Express.js backend for a food ordering system with vendor management and real-time order tracking.

## Project Structure

```
backend/
├── config/           # Configuration files
├── middleware/       # Express middleware
├── models/          # Mongoose models
├── routes/          # Express routes
├── services/        # Business logic
├── utils/           # Utility functions
└── logs/            # Application logs
```

## Features

- User authentication (JWT)
- Role-based access control (Student/Vendor)
- Real-time order tracking with Socket.IO
- Menu management for vendors
- Order management system
- Rating and review system
- Analytics for vendors
- Group ordering capability

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and update the values
4. Create the uploads directory:
   ```bash
   mkdir uploads
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

### Authentication

- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user

### Menu

- GET /api/menu - List all menu items
- POST /api/menu - Create menu item (vendor only)
- PUT /api/menu/:id - Update menu item (vendor only)
- DELETE /api/menu/:id - Delete menu item (vendor only)

### Orders

- POST /api/orders - Create new order
- GET /api/orders/my-orders - Get user's orders
- GET /api/orders/vendor-orders - Get vendor's orders
- PATCH /api/orders/:id/status - Update order status

### Vendor

- GET /api/vendor/analytics - Get vendor analytics
- GET /api/vendor/dashboard - Get dashboard stats
- POST /api/vendor/menu-items - Add menu item

## Environment Variables

Required environment variables:

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `NODE_ENV` - Environment (development/production)

## Error Handling

The application uses a centralized error handling mechanism. All errors are logged using Winston logger.

## Logging

Logs are stored in the `logs` directory:
- `error.log` - Error level logs
- `combined.log` - All logs

## Development

Run linting:
```bash
npm run lint
```

Run tests:
```bash
npm test
```

## Socket.IO Events

- `order-status-update` - Real-time order status updates
- `join-room` - Join user-specific room
- `leave-room` - Leave user-specific room