import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import config from '../config/index.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ingredients', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit' }, // Resize large images
      { quality: 'auto' } // Automatic quality optimization
    ]
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Configure multer with Cloudinary storage
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Middleware for single image upload
export const uploadSingleImageToCloudinary = upload.single('image');

// ==================== KYC DOCUMENT UPLOAD CONFIGURATION ====================

// Configure Cloudinary storage for KYC documents
const kycStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kyc-documents', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto', // Allows PDFs and other file types
    transformation: [
      { quality: 'auto' } // Automatic quality optimization
    ]
  }
});

// File filter for KYC documents - allow images and PDFs
const kycFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (jpeg, jpg, png) and PDFs are allowed for KYC documents'));
  }
};

// Configure multer for KYC documents
const kycUpload = multer({
  storage: kycStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for documents
  },
  fileFilter: kycFileFilter
});

// Middleware for multiple KYC document uploads
export const uploadKycDocuments = kycUpload.fields([
  { name: 'businessLicense', maxCount: 1 },
  { name: 'ownerIdFront', maxCount: 1 },
  { name: 'ownerIdBack', maxCount: 1 },
  { name: 'proofOfAddress', maxCount: 1 },
  { name: 'additionalDocs', maxCount: 5 }
]);

// Delete document from Cloudinary (works for both images and PDFs)
export const deleteImageFromCloudinary = async (imageUrl) => {
  try {
    // Extract public_id from Cloudinary URL
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1];
    const publicId = 'ingredients/' + filename.split('.')[0];

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Delete KYC document from Cloudinary
export const deleteKycDocumentFromCloudinary = async (documentUrl) => {
  try {
    // Extract public_id from Cloudinary URL
    const parts = documentUrl.split('/');
    const filename = parts[parts.length - 1];
    // Remove file extension
    const filenameWithoutExt = filename.split('.')[0];
    const publicId = 'kyc-documents/' + filenameWithoutExt;

    // For PDFs, we need to specify resource_type as 'raw'
    const isPdf = documentUrl.toLowerCase().endsWith('.pdf');
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: isPdf ? 'raw' : 'image'
    });

    return result;
  } catch (error) {
    console.error('Error deleting KYC document from Cloudinary:', error);
    throw error;
  }
};

// Error handling middleware for multer
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

export default cloudinary;