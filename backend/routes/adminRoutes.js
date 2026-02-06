// routes/adminRoutes.js
import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import {
  getAllKycSubmissions,
  getKycSubmissionById,
  approveKyc,
  rejectKyc
} from '../controllers/kycController.js';
import {
  getAllRestaurants,
  getRestaurantById,
  updateRestaurantStatus,
  getSystemStats
} from '../controllers/adminController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Super admin operations for managing restaurants and KYC submissions
 */

// All routes require authentication and super_admin role
router.use(protect);
router.use(requireRole('super_admin'));

/**
 * @swagger
 * /api/admin/kyc-submissions:
 *   get:
 *     summary: Get all KYC submissions (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, under_review, approved, rejected] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: List of KYC submissions }
 */
router.get('/kyc-submissions', getAllKycSubmissions);

/**
 * @swagger
 * /api/admin/kyc-submissions/{id}:
 *   get:
 *     summary: Get single KYC submission by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: KYC submission details }
 */
router.get('/kyc-submissions/:id', getKycSubmissionById);

/**
 * @swagger
 * /api/admin/kyc-submissions/{id}/approve:
 *   post:
 *     summary: Approve KYC submission and create restaurant
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reviewNotes: { type: string }
 *     responses:
 *       200: { description: KYC approved successfully }
 */
router.post('/kyc-submissions/:id/approve', approveKyc);

/**
 * @swagger
 * /api/admin/kyc-submissions/{id}/reject:
 *   post:
 *     summary: Reject KYC submission
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rejectionReason]
 *             properties:
 *               rejectionReason: { type: string }
 *               reviewNotes: { type: string }
 *     responses:
 *       200: { description: KYC rejected }
 */
router.post('/kyc-submissions/:id/reject', rejectKyc);

/**
 * @swagger
 * /api/admin/restaurants:
 *   get:
 *     summary: Get all restaurants
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, suspended, inactive] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: List of restaurants }
 */
router.get('/restaurants', getAllRestaurants);

/**
 * @swagger
 * /api/admin/restaurants/{id}:
 *   get:
 *     summary: Get restaurant by ID with stats
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Restaurant details with user count and ingredient count }
 */
router.get('/restaurants/:id', getRestaurantById);

/**
 * @swagger
 * /api/admin/restaurants/{id}/status:
 *   patch:
 *     summary: Update restaurant status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [active, suspended, inactive] }
 *     responses:
 *       200: { description: Restaurant status updated }
 */
router.patch('/restaurants/:id/status', updateRestaurantStatus);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get system-wide statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRestaurants: { type: number }
 *                 totalUsers: { type: number }
 *                 kyc:
 *                   type: object
 *                   properties:
 *                     pending: { type: number }
 *                     approved: { type: number }
 *                     rejected: { type: number }
 */
router.get('/stats', getSystemStats);

export default router;
