// controllers/userManagementController.js
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import crypto from 'crypto';
import { generateToken } from '../middlewares/authMiddleware.js';
import { sendUserInvitationEmail } from '../config/emailConfig.js';

// Invite user to restaurant
export const inviteUser = async (req, res) => {
  try {
    const { email, firstName, lastName, phoneNumber, permissions } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check restaurant user limit
    const restaurant = await Restaurant.findById(req.user.restaurant);
    const currentUserCount = await User.countDocuments({ restaurant: req.user.restaurant });

    if (currentUserCount >= restaurant.maxUsers) {
      return res.status(400).json({
        success: false,
        message: `User limit reached. Your plan allows ${restaurant.maxUsers} users.`
      });
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');

    // Create user with pending status
    const user = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: crypto.randomBytes(20).toString('hex'), // Temporary password
      role: 'restaurant_staff',
      restaurant: req.user.restaurant,
      permissions: permissions || [],
      invitedBy: req.user._id,
      invitationToken,
      invitationExpires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      isVerified: false,
      kycStatus: 'approved', // Staff bypass KYC
      accountStatus: 'inactive' // Becomes active after accepting invite
    });

    // Send invitation email
    await sendUserInvitationEmail(
      email,
      restaurant.name,
      `${req.user.firstName} ${req.user.lastName}`,
      invitationToken
    );

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          permissions: user.permissions
        }
      }
    });

  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to invite user',
      error: error.message
    });
  }
};

// Accept invitation
export const acceptInvitation = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required'
      });
    }

    const user = await User.findOne({
      invitationToken: token,
      invitationExpires: { $gt: Date.now() }
    }).select('+invitationToken +invitationExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired invitation token'
      });
    }

    // Set password and activate account
    user.password = password;
    user.isVerified = true;
    user.accountStatus = 'active';
    user.invitationToken = undefined;
    user.invitationExpires = undefined;
    await user.save();

    const authToken = generateToken(user._id);

    res.json({
      success: true,
      message: 'Invitation accepted! Welcome to the team.',
      token: authToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });

  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept invitation',
      error: error.message
    });
  }
};

// Get restaurant users
export const getRestaurantUsers = async (req, res) => {
  try {
    const users = await User.find({ restaurant: req.user.restaurant })
      .select('-password')
      .populate('invitedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        users,
        count: users.length
      }
    });

  } catch (error) {
    console.error('Get restaurant users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message
    });
  }
};

// Update user permissions
export const updateUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;

    // Check if user belongs to same restaurant
    const user = await User.findOne({
      _id: userId,
      restaurant: req.user.restaurant
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in your restaurant'
      });
    }

    // Cannot modify admins
    if (user.role === 'restaurant_admin' || user.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify admin permissions'
      });
    }

    user.permissions = permissions;
    await user.save();

    res.json({
      success: true,
      message: 'Permissions updated',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          permissions: user.permissions
        }
      }
    });

  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update permissions',
      error: error.message
    });
  }
};

// Remove user from restaurant
export const removeUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user belongs to same restaurant
    const user = await User.findOne({
      _id: userId,
      restaurant: req.user.restaurant
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in your restaurant'
      });
    }

    // Cannot remove admins
    if (user.role === 'restaurant_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot remove restaurant admin'
      });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'User removed successfully'
    });

  } catch (error) {
    console.error('Remove user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove user',
      error: error.message
    });
  }
};
