import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Import routes
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import categoryItemsRoutes from './routes/categoryItems.routes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
const NETWORK_IP = process.env.NETWORK_IP || '192.168.1.85';

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'SGVMart API is running' });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/category-items', categoryItemsRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const port = Number(PORT);
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://${HOST}:${port}`);
  console.log(`🌐 Network: http://${NETWORK_IP}:${port}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
