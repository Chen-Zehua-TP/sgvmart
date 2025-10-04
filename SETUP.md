# SGVMart - Setup and Installation Guide

## Project Created Successfully! 🎉

Your full-stack e-commerce application is now set up with the following structure:

```
sgvmart/
├── backend/                    # Node.js + Express + TypeScript backend
│   ├── src/
│   │   ├── routes/            # API route definitions
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic layer
│   │   ├── middleware/        # Auth, error handling
│   │   ├── utils/             # Helper functions
│   │   ├── config/            # Database configuration
│   │   └── server.ts          # Entry point
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                   # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service layer
│   │   ├── types/             # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
│
└── README.md

```

## Next Steps to Get Started

### 1. Install PostgreSQL
Make sure you have PostgreSQL installed and running on your machine.
- Windows: Download from https://www.postgresql.org/download/windows/
- Create a database named `sgvmart`

### 2. Setup Backend

```powershell
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
Copy-Item .env.example .env

# Edit .env file and update database connection string
# DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/sgvmart"

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Start the development server
npm run dev
```

The backend will start on http://localhost:3000

### 3. Setup Frontend

Open a NEW terminal window:

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment file (optional, defaults work)
Copy-Item .env.example .env

# Start the development server
npm run dev
```

The frontend will start on http://localhost:5173

## Architecture Overview

### Backend Flow:
```
Client Request
    ↓
Express Server (server.ts)
    ↓
Routes (*.routes.ts) → Authentication Middleware
    ↓
Controllers (*.controller.ts) → Request Validation
    ↓
Services (*.service.ts) → Business Logic
    ↓
Prisma ORM
    ↓
PostgreSQL Database
```

### Frontend Flow:
```
User Interface (React Components)
    ↓
Pages (Home, Products, Cart, etc.)
    ↓
Services (API calls with Axios)
    ↓
Backend API
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove cart item
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status (Admin)

## Testing the Application

### 1. Create an Admin User
You can create an admin user by registering normally, then manually updating the database:

```sql
-- Connect to your database and run:
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

### 2. Create Categories (Admin Required)
Use Postman or curl to create categories:

```powershell
curl -X POST http://localhost:3000/api/categories `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d '{\"name\": \"Electronics\", \"slug\": \"electronics\", \"description\": \"Electronic items\"}'
```

### 3. Create Products (Admin Required)
After creating categories, create products:

```powershell
curl -X POST http://localhost:3000/api/products `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d '{\"name\": \"Laptop\", \"description\": \"High performance laptop\", \"price\": 999.99, \"stock\": 10, \"categoryId\": \"CATEGORY_ID_HERE\"}'
```

## Development Tips

### Using Prisma Studio
View and edit your database using Prisma's GUI:

```powershell
cd backend
npx prisma studio
```

### Reset Database
If you need to reset your database:

```powershell
cd backend
npx prisma migrate reset
```

### Build for Production

```powershell
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## Features Implemented

✅ User Authentication (JWT)
✅ Product Management
✅ Category Management
✅ Shopping Cart
✅ Order Management
✅ Role-based Access Control (Admin/Customer)
✅ Responsive UI with Tailwind CSS
✅ TypeScript for type safety
✅ RESTful API architecture
✅ Database with Prisma ORM

## Technology Stack

**Backend:**
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcryptjs

**Frontend:**
- React 18
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS

## Troubleshooting

### Port Already in Use
If port 3000 or 5173 is already in use:
- Backend: Change `PORT` in backend/.env
- Frontend: Change port in frontend/vite.config.ts

### Database Connection Issues
- Ensure PostgreSQL is running
- Check your DATABASE_URL in backend/.env
- Verify database exists: `psql -U postgres -l`

### Dependencies Installation Fails
Try clearing npm cache:
```powershell
npm cache clean --force
rm -r node_modules
npm install
```

## Next Steps for Enhancement

- Implement payment gateway integration
- Add product reviews and ratings
- Implement search and filtering
- Add image upload functionality
- Email notifications
- Password reset functionality
- Admin dashboard with analytics
- Wishlist feature
- Product recommendations

## Support

For issues or questions, refer to the documentation:
- Express: https://expressjs.com/
- React: https://react.dev/
- Prisma: https://www.prisma.io/docs
- Vite: https://vitejs.dev/

---

Happy Coding! 🚀
