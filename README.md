# SGVMart - E-Commerce Web Application

## Architecture Overview

This is a full-stack e-commerce web application with the following architecture:

```
┌─────────────────┐
│    Frontend     │
│  (React+Vite)   │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│   API Gateway   │
│   (Express)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│Routes │ │ APIs    │
└───┬───┘ └──┬──────┘
    │        │
    └───┬────┘
        │
┌───────▼────────┐
│   Controllers  │
└───────┬────────┘
        │
┌───────▼────────┐
│    Services    │
└───────┬────────┘
        │
┌───────▼────────┐
│   Database     │
│  (PostgreSQL)  │
└────────────────┘
```

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Axios
- TailwindCSS

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- JWT Authentication
- bcrypt

### Database
- PostgreSQL

## Project Structure

```
sgvmart/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service layer
│   │   ├── hooks/        # Custom React hooks
│   │   ├── utils/        # Utility functions
│   │   ├── types/        # TypeScript types
│   │   └── App.tsx       # Main app component
│   └── package.json
│
├── backend/              # Express backend application
│   ├── src/
│   │   ├── routes/      # API route definitions
│   │   ├── controllers/ # Request handlers
│   │   ├── services/    # Business logic
│   │   ├── models/      # Data models
│   │   ├── middleware/  # Express middleware
│   │   ├── utils/       # Utility functions
│   │   ├── config/      # Configuration files
│   │   └── server.ts    # Entry point
│   ├── prisma/          # Prisma schema and migrations
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository
2. Set up the backend:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your .env file
   npx prisma migrate dev
   npm run dev
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Environment Variables

#### Backend (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/sgvmart"
JWT_SECRET="your-secret-key"
PORT=3000
NODE_ENV=development
```

#### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- POST `/api/auth/logout` - User logout
- GET `/api/auth/me` - Get current user

### Products
- GET `/api/products` - Get all products
- GET `/api/products/:id` - Get product by ID
- POST `/api/products` - Create product (Admin)
- PUT `/api/products/:id` - Update product (Admin)
- DELETE `/api/products/:id` - Delete product (Admin)

### Categories
- GET `/api/categories` - Get all categories
- GET `/api/categories/:id` - Get category by ID
- POST `/api/categories` - Create category (Admin)
- PUT `/api/categories/:id` - Update category (Admin)
- DELETE `/api/categories/:id` - Delete category (Admin)

### Cart
- GET `/api/cart` - Get user cart
- POST `/api/cart/items` - Add item to cart
- PUT `/api/cart/items/:id` - Update cart item
- DELETE `/api/cart/items/:id` - Remove cart item
- DELETE `/api/cart` - Clear cart

### Orders
- GET `/api/orders` - Get user orders
- GET `/api/orders/:id` - Get order by ID
- POST `/api/orders` - Create order
- PUT `/api/orders/:id` - Update order status (Admin)

### Users
- GET `/api/users/:id` - Get user profile
- PUT `/api/users/:id` - Update user profile
- DELETE `/api/users/:id` - Delete user account

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## License
MIT
