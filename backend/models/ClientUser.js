import User from './User.js';
import mongoose from 'mongoose';

const clientUserSchema = new mongoose.Schema({
  avatar: {
    type: String,
    default: null
  }
});

const ClientUser = User.discriminator('client', clientUserSchema);

export default ClientUser;
