// routes/userManagementRoutes.js
import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { requireRole, requireKycApproval } from '../middlewares/roleMiddleware.js';
import {
  inviteUser,
  acceptInvitation,
  getRestaurantUsers,
  updateUserPermissions,
  removeUser
} from '../controllers/userManagementController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: User Management
 *     description: Manage restaurant staff members
 */

/**
 * @swagger
 * /api/users/accept-invitation:
 *   post:
 *     summary: Accept invitation and set password (Public route)
 *     tags: [User Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token: { type: string }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       200: { description: Invitation accepted, user account activated }
 */
router.post('/accept-invitation', acceptInvitation);

// All other routes require authentication and KYC approval
router.use(protect);
router.use(requireKycApproval);

/**
 * @swagger
 * /api/users/invite:
 *   post:
 *     summary: Invite a user to your restaurant (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, firstName, lastName, phoneNumber]
 *             properties:
 *               email: { type: string }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               phoneNumber: { type: string }
 *               permissions:
 *                 type: array
 *                 items: { type: string, enum: [manage_ingredients, manage_suppliers, manage_stock, view_reports, manage_users] }
 *     responses:
 *       201: { description: Invitation sent successfully }
 */
router.post(
  '/invite',
  requireRole('restaurant_admin', 'super_admin'),
  inviteUser
);

/**
 * @swagger
 * /api/users/restaurant-users:
 *   get:
 *     summary: Get all users in your restaurant (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of restaurant users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users: { type: array }
 *                 count: { type: number }
 */
router.get(
  '/restaurant-users',
  requireRole('restaurant_admin', 'super_admin'),
  getRestaurantUsers
);

/**
 * @swagger
 * /api/users/{userId}/permissions:
 *   patch:
 *     summary: Update user permissions (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [permissions]
 *             properties:
 *               permissions:
 *                 type: array
 *                 items: { type: string, enum: [manage_ingredients, manage_suppliers, manage_stock, view_reports, manage_users] }
 *     responses:
 *       200: { description: Permissions updated }
 */
router.patch(
  '/:userId/permissions',
  requireRole('restaurant_admin', 'super_admin'),
  updateUserPermissions
);

/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     summary: Remove user from restaurant (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User removed successfully }
 */
router.delete(
  '/:userId',
  requireRole('restaurant_admin', 'super_admin'),
  removeUser
);

export default router;
