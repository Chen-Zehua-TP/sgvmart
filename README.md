# SGVMart - E-Commerce Web Application

## 🌟 New Feature: AI-Powered Category Items

SGVMart now includes an intelligent category discovery system powered by Google's Gemini AI! The home page displays curated items across 5 categories that users can click to instantly search for products.

**Quick Setup:**
```bash
node setup-gemini.js
```

See [QUICKSTART.md](QUICKSTART.md) for detailed setup instructions.

---

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
- **Google Gemini API** (AI-powered category items)

### Database
- PostgreSQL

### External APIs
- **Google Gemini API** - AI-powered item generation
- **GGSel** - Product search integration

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
GEMINI_API_KEY="your-gemini-api-key"  # NEW! Get from https://makersuite.google.com/app/apikey
PORT=3000
NODE_ENV=development
```

#### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

## API Endpoints

### Category Items (NEW! 🌟)
- GET `/api/category-items` - Get all AI-generated category items
- GET `/api/category-items/:category` - Get items for specific category
- POST `/api/category-items/:category/refresh` - Refresh items from Gemini (Admin)

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

### Quick Setup with Gemini API
```bash
# Interactive setup for Gemini API key
node setup-gemini.js

# Or manually edit backend/.env and add:
# GEMINI_API_KEY="your-api-key-here"
```

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

## 📚 Additional Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Quick setup guide for the Gemini feature
- **[GEMINI_CATEGORY_ITEMS.md](GEMINI_CATEGORY_ITEMS.md)** - Detailed documentation
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical implementation details
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture diagrams

## 🎯 Feature Highlights

### AI-Powered Category Discovery
- 🎮 **Games** - Popular gaming titles
- 💰 **Digital Currency & Items** - In-game currencies and items
- 💻 **Software Products** - Software and productivity tools
- 🎁 **Gift Cards** - Digital gift cards
- 📺 **Subscriptions** - Streaming and service subscriptions

### Benefits
- ✅ Smart caching for fast performance
- ✅ One-click search for popular items
- ✅ AI-generated, always relevant content
- ✅ Cost-effective (minimal API usage)
- ✅ Beautiful, responsive UI
