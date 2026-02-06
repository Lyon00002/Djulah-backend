# Djulah - Backend API (Client Auth)

Client authentication backend for Djulah (property app: furnished, unfurnished, commercial).

All API responses use a unified JSON shape:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

The backend also supports localized messages based on the `Accept-Language` header (ex: `fr`, `en`).

## Quick Start for Developers

### 1. Clone & Install

```bash
cd backend
npm install
```

### 2. Environment Setup

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Then edit `.env` with your values:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/djulah
JWT_SECRET=your-super-secret-jwt-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
CLIENT_URL=http://localhost:3000
```

#### Gmail Setup (Required for Email Verification)

1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Create App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character App Password in your `.env` file

### 3. Run the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will be available at:
- **API Base**: http://localhost:5000/api
- **Swagger Docs**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/health

## Testing the API

### Option 1: Swagger UI (Recommended ⭐)

Visit http://localhost:5000/api-docs for interactive API documentation and testing.

**Features:**
- Test all endpoints directly in the browser
- See request/response schemas
- Authentication support (Bearer tokens)
- No additional tools needed

### Option 2: Postman / Insomnia

**Base URL:** `http://localhost:5000/api`

Example endpoints:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

### Option 3: cURL

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "test123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

## Production API

The production API is deployed on Render:
- **Base URL**: https://klarity-dashboard.onrender.com/api
- **Swagger Docs**: https://klarity-dashboard.onrender.com/api-docs

## Features

### Client Authentication
- User registration with email verification (6-digit codes)
- JWT-based authentication
- Password reset functionality
- Get profile
- Change password

## API Documentation

Endpoints are documented in Swagger. Visit `/api-docs` to explore the client authentication API.

## CORS Configuration

### Development Mode
When `NODE_ENV !== production`, **all origins are allowed** for easy testing.

### Production Mode
Only whitelisted origins are allowed:
- `https://klarity-dashboard.onrender.com`
- `https://api.klarity.cm`
- `http://localhost:3000` (for local frontend development)

**Note:** Requests from Postman, Insomnia, cURL (no origin) are always allowed.

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Get your token by:
1. Registering: `POST /api/auth/register`
2. Verifying email: `POST /api/auth/verify-email`
3. Logging in: `POST /api/auth/login`

## Common Issues

### 🔴 Email not sending?
- Make sure you're using a **Gmail App Password**, not your regular password
- Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
- Verify 2-Step Verification is enabled on your Google account

### 🔴 CORS errors?
- Make sure `NODE_ENV=development` in your `.env` file
- Check the browser console for the actual origin being blocked

### 🔴 MongoDB connection failed?
- Verify your `MONGODB_URI` connection string
- Check network access settings in MongoDB Atlas (allow your IP)
- Ensure the database user has proper permissions

### 🔴 JWT authentication failing?
- Make sure you set a strong `JWT_SECRET` in `.env`
- Include `Authorization: Bearer <token>` header in requests
- Check if your token has expired (tokens expire after 30 days)

## Project Structure

```
backend/
├── config/
│   └── emailConfig.js          # Email transporter setup
├── controllers/
│   ├── authController.js       # Authentication logic
├── middlewares/
│   ├── authMiddleware.js       # JWT verification
│   └── localeMiddleware.js     # Accept-Language → req.t() translator
├── models/
│   ├── User.js                 # Base user schema (discriminators)
│   └── ClientUser.js           # Client user model
├── routes/
│   ├── authRoutes.js           # Auth endpoints
├── swagger.js                  # Swagger configuration
├── swaggerSchemas.js           # Swagger schemas
├── server.js                   # Express app entry point
└── .env.example                # Environment variables template
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT signing | `your-secret-key` |
| `EMAIL_USER` | Gmail address | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | Gmail App Password | `abcd efgh ijkl mnop` |
| `CLIENT_URL` | Frontend URL | `http://localhost:3000` |

## Support & Contributing

For issues or questions:
- Check the Swagger documentation: `/api-docs`
- Review controller files for business logic
- Check model files for data schemas
