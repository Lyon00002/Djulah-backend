// Script to manually verify a user
import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import config from '../config/index.js';

dotenv.config();

async function verifyUser(email) {
  try {
    await mongoose.connect(config.db.mongoUri);
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      process.exit(1);
    }
    
    console.log('Found user:', user.email);
    console.log('Current isVerified:', user.isVerified);
    
    user.isVerified = true;
    await user.save();
    
    console.log('✅ User verified successfully!');
    console.log('User can now login');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.log('Usage: node verify-user.js <email>');
  process.exit(1);
}

verifyUser(email);
