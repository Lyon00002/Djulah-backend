// controllers/adminController.js
import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js';
import KycSubmission from '../models/KycSubmission.js';
import Ingredient from '../models/Ingredient.js';

// Get all restaurants
export const getAllRestaurants = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const restaurants = await Restaurant.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Restaurant.countDocuments(query);

    res.json({
      success: true,
      data: {
        restaurants,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve restaurants',
      error: error.message
    });
  }
};

// Get restaurant by ID
export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id)
      .populate('createdBy', 'firstName lastName email phoneNumber');

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Get restaurant stats
    const userCount = await User.countDocuments({ restaurant: id });
    const ingredientCount = await Ingredient.countDocuments({ restaurant: id });

    res.json({
      success: true,
      data: {
        restaurant,
        stats: {
          userCount,
          ingredientCount
        }
      }
    });

  } catch (error) {
    console.error('Get restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve restaurant',
      error: error.message
    });
  }
};

// Update restaurant status
export const updateRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['active', 'suspended', 'inactive'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, suspended, or inactive'
      });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.json({
      success: true,
      message: 'Restaurant status updated',
      data: restaurant
    });

  } catch (error) {
    console.error('Update restaurant status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update restaurant status',
      error: error.message
    });
  }
};

// Get system statistics
export const getSystemStats = async (req, res) => {
  try {
    const totalRestaurants = await Restaurant.countDocuments({ status: 'active' });
    const totalUsers = await User.countDocuments({ accountStatus: 'active' });
    const pendingKyc = await KycSubmission.countDocuments({ status: 'pending' });
    const approvedKyc = await KycSubmission.countDocuments({ status: 'approved' });
    const rejectedKyc = await KycSubmission.countDocuments({ status: 'rejected' });

    res.json({
      success: true,
      data: {
        totalRestaurants,
        totalUsers,
        kyc: {
          pending: pendingKyc,
          approved: approvedKyc,
          rejected: rejectedKyc
        }
      }
    });

  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve system statistics',
      error: error.message
    });
  }
};
