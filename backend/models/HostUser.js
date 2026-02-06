import User from './User.js';
import mongoose from 'mongoose';

const hostUserSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['super_admin', 'restaurant_admin', 'restaurant_staff'],
    default: 'restaurant_staff'
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    default: null
  },
  kycStatus: {
    type: String,
    enum: ['not_submitted', 'pending', 'under_review', 'approved', 'rejected'],
    default: 'not_submitted'
  },
  kycSubmission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KycSubmission',
    default: null
  },
  permissions: {
    type: [String],
    enum: ['manage_ingredients', 'manage_suppliers', 'manage_stock', 'view_reports', 'manage_users'],
    default: []
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  invitationToken: {
    type: String,
    select: false
  },
  invitationExpires: {
    type: Date,
    select: false
  }
});

const HostUser = User.discriminator('host', hostUserSchema);

export default HostUser;
