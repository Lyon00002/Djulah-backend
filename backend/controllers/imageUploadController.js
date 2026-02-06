import Ingredient from '../models/Ingredient.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload image for ingredient (Local Storage)
export const uploadIngredientImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Check if ingredient exists
    const ingredient = await Ingredient.findById(id);
    if (!ingredient) {
      // Delete uploaded file if ingredient not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
    }

    // Delete old image if exists
    if (ingredient.image) {
      const oldImagePath = path.join(__dirname, '..', ingredient.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Save image path (relative path for URL)
    const imageUrl = `/uploads/ingredients/${req.file.filename}`;
    ingredient.image = imageUrl;
    await ingredient.save();

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        image: imageUrl,
        fullUrl: `${req.protocol}://${req.get('host')}${imageUrl}`
      }
    });

  } catch (error) {
    console.error('Upload image error:', error);
    
    // Delete uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
};

// Upload image using Cloudinary
export const uploadIngredientImageCloudinary = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Check if ingredient exists
    const ingredient = await Ingredient.findById(id);
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
    }

    // req.file.path contains the Cloudinary URL
    const imageUrl = req.file.path;

    // Delete old image from Cloudinary if exists
    if (ingredient.image) {
      try {
        const { deleteImageFromCloudinary } = await import('../utils/cloudinaryUpload.js');
        await deleteImageFromCloudinary(ingredient.image);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }

    // Save Cloudinary URL
    ingredient.image = imageUrl;
    await ingredient.save();

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        image: imageUrl
      }
    });

  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
};

// Delete ingredient image
export const deleteIngredientImage = async (req, res) => {
  try {
    const { id } = req.params;

    const ingredient = await Ingredient.findById(id);
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
    }

    if (!ingredient.image) {
      return res.status(400).json({
        success: false,
        message: 'Ingredient has no image'
      });
    }

    // Check if image is from Cloudinary or local
    if (ingredient.image.includes('cloudinary.com')) {
      // Delete from Cloudinary
      try {
        const { deleteImageFromCloudinary } = await import('../utils/cloudinaryUpload.js');
        await deleteImageFromCloudinary(ingredient.image);
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
      }
    } else {
      // Delete from local storage
      const imagePath = path.join(__dirname, '..', ingredient.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Remove image URL from database
    ingredient.image = null;
    await ingredient.save();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
};