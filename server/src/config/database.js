import mongoose from 'mongoose';

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) return cachedConnection;

  const uri = process.env.MONGO_URI?.trim();
  if (!uri) {
    throw new Error('MONGO_URI is missing');
  }

  cachedConnection = mongoose.connect(uri, {
    maxPoolSize: 10,
    minPoolSize: 1,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
  });

  await cachedConnection;
  console.log('MongoDB connected');
  return cachedConnection;
};

export default connectDB;
