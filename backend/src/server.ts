import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';
import path from 'path';
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
const DOMAIN = process.env.DOMAIN || 'ggvault.shop';
const NODE_ENV = process.env.NODE_ENV || 'development';

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

// Start HTTPS and HTTP servers
const port = Number(PORT);

// Check if SSL certificates exist for HTTPS
const certDir = `/etc/letsencrypt/live/${DOMAIN}`;
const certPath = path.join(certDir, 'fullchain.pem');
const keyPath = path.join(certDir, 'privkey.pem');

let httpsServer: https.Server | null = null;

if (fs.existsSync(certPath) && fs.existsSync(keyPath) && NODE_ENV === 'production') {
  try {
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };

    httpsServer = https.createServer(httpsOptions, app);
    httpsServer.listen(443, '0.0.0.0', () => {
      console.log(`� HTTPS Server is running on https://${DOMAIN}:443`);
      console.log(`🔒 API: https://${DOMAIN}:443/api`);
    });
  } catch (error) {
    console.error('❌ Error loading SSL certificates:', error);
    console.log('⚠️  Falling back to HTTP only');
  }
}

// Always run HTTP server for internal communication and health checks
app.listen(port, '0.0.0.0', () => {
  console.log(`�🚀 HTTP Server is running on http://${HOST}:${port}`);
  console.log(`🌐 Network: http://${NETWORK_IP}:${port}`);
  console.log(`📚 Environment: ${NODE_ENV}`);
  if (httpsServer) {
    console.log(`🔐 SSL/TLS enabled for external HTTPS access`);
  }
});

export default app;
