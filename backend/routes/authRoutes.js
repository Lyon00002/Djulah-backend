// routes/authRoutes.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  verifyEmail,
  resendVerificationCode,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  changePassword
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rate limiting for all auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: { success: false, message: 'Too many requests. Try again later.' }
});

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: User authentication, registration & password management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               name: { type: string, example: "Jean Dupont" }
 *               email: { type: string, format: email, example: "jean@djulah.cm" }
 *               password: { type: string, format: password, minLength: 6, example: "myPass123" }
 *     responses:
 *       201:
 *         description: Registration successful – check email for verification code
 *       400:
 *         description: Validation error (missing or invalid fields)
 *       409:
 *         description: User already exists (either verified or pending verification)
 */
router.post('/register', authLimiter, register);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify email with 6-digit code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email: { type: string, format: email, example: "jean@djulah.cm" }
 *               code: { type: string, example: "483920" }
 *     responses:
 *       200:
 *         description: Email verified – returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 token: { type: string }
 *                 user: { type: object }
 *       400:
 *         description: Invalid or expired code
 */
router.post('/verify-email', authLimiter, verifyEmail);

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Resend verification code (max once per minute)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email, example: "jean@djulah.cm" }
 *     responses:
 *       200:
 *         description: New code sent
 *       429:
 *         description: Too many resend requests
 */
router.post('/resend-verification', authLimiter, resendVerificationCode);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email & password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Login successful – returns JWT token
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Email not verified
 */
router.post('/login', authLimiter, login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email, example: "jean@djulah.cm" }
 *     responses:
 *       200:
 *         description: Reset code sent to email
 *       404:
 *         description: No verified account found
 */
router.post('/forgot-password', authLimiter, forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using 6-digit code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - password
 *             properties:
 *               email: { type: string, format: email }
 *               code: { type: string, example: "729104" }
 *               password: { type: string, format: password, minLength: 6 }
 *     responses:
 *       200:
 *         description: Password reset successful – returns new JWT token
 *       400:
 *         description: Invalid or expired code
 */
router.post('/reset-password', authLimiter, resetPassword);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized - no token provided
 */
router.get('/profile', protect, getProfile);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Change password (requires authentication)
 *     description: Allows authenticated users (including super admin) to change their password. New password must be different from current password.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmNewPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Your current password
 *                 example: "oldPass123"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Your new password (must be different from current)
 *                 example: "newPass456"
 *               confirmNewPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Confirm your new password
 *                 example: "newPass456"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully! Please login with your new password."
 *       400:
 *         description: Validation error (passwords don't match, too short, or same as old password)
 *       401:
 *         description: Current password is incorrect or unauthorized
 */
router.put('/change-password', protect, changePassword);

export default router;