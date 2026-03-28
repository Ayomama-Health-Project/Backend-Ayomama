import mongoose from 'mongoose';
import dotenv from 'dotenv';
// import logger from '../utils/logger.js';

// Load environment variables
dotenv.config();

//mongoDb database connection setup
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("MongoDB connection failed", { error: error.message });
    throw error;
  }
};

export default connectDB;
