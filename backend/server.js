// server.js → 100% READY FOR DJULAH (November 19, 2025)
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { localeMiddleware } from './middlewares/localeMiddleware.js';

// Swagger Setup
import swaggerDocs from './swagger.js';  // ← This activates /api-docs

// Routes
import authRoutes from './routes/authRoutes.js';

const app = express();

// Trust proxy - Required for Render, Heroku, and other reverse proxies
// This allows Express to trust the X-Forwarded-* headers
app.set('trust proxy', 1);

// ==================== SECURITY & MIDDLEWARE ====================
// Helmet configuration - Swagger-friendly
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https://validator.swagger.io"],
      connectSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS CONFIGURATION - Development & Production friendly
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like Swagger UI on same domain, mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'https://klarity-dashboard.onrender.com',
      'https://api.klarity.cm',
      'http://localhost:5000',
      'http://localhost:5001',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:3000',
      // Add Render deployment URLs
      process.env.RENDER_EXTERNAL_URL
    ].filter(Boolean); // Remove any undefined values

    // In development/testing, allow all origins for easier testing
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ CORS allowed (dev mode): ${origin}`);
      return callback(null, true);
    }

    // In production, check against whitelist
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`✅ CORS allowed (whitelisted): ${origin}`);
      callback(null, true);
    } else {
      // Log rejected origins for debugging
      console.warn(`⚠️  CORS rejected origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Accept-Language', 'Time-Zone'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.use(localeMiddleware);

// Rate limiting (especially for auth)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests from this IP' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/auth', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== DATABASE CONNECTION ====================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// ==================== API ROUTES ====================
app.use('/api/auth', authRoutes);

// ==================== HEALTH & WELCOME ====================
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Djulah API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  // Smart URL detection for Render deployment
  let baseUrl;

  if (process.env.RENDER_EXTERNAL_URL) {
    // Render automatically provides this variable
    baseUrl = process.env.RENDER_EXTERNAL_URL;
  } else if (process.env.NODE_ENV === 'production') {
    // Fallback for other production environments
    baseUrl = 'https://klarity-dashboard.onrender.com';
  } else {
    // Development mode
    baseUrl = `http://localhost:${process.env.PORT || 5000}`;
  }

  res.json({
    message: 'Welcome to Djulah API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    docs: `${baseUrl}/api-docs`,
    health: `${baseUrl}/health`
  });
});

// ==================== SWAGGER UI ====================
// This activates the beautiful interactive docs
swaggerDocs(app);  // ← This line gives you /api-docs

// ==================== 404 & ERROR HANDLING ====================
// 404 — Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    data: null,
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    data: null,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('Djulah API Running');
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Swagger Docs: http://localhost:${PORT}/api-docs`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
});

export default app;