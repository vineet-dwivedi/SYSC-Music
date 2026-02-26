import mongoose from 'mongoose';

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) return cachedConnection;

  const uri = process.env.MONGO_URI?.trim();
  if (!uri) {
    throw new Error('MONGO_URI is missing');
  }

  const maxPoolSize = Number(process.env.MONGO_MAX_POOL_SIZE) || 25;
  const minPoolSize = Number(process.env.MONGO_MIN_POOL_SIZE) || 2;
  const serverSelectionTimeoutMS = Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 10000;
  const socketTimeoutMS = Number(process.env.MONGO_SOCKET_TIMEOUT_MS) || 45000;
  const maxIdleTimeMS = Number(process.env.MONGO_MAX_IDLE_TIME_MS) || 30000;

  cachedConnection = mongoose.connect(uri, {
    maxPoolSize,
    minPoolSize,
    serverSelectionTimeoutMS,
    socketTimeoutMS,
    maxIdleTimeMS,
    family: 4,
  });

  await cachedConnection;
  console.log('MongoDB connected');
  return cachedConnection;
};

export default connectDB;
