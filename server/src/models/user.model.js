import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    mobile: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },
    googleSub: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },
    avatarUrl: {
      type: String,
      default: '',
      trim: true,
    },
    authProvider: {
      type: String,
      enum: ['google', 'mobile'],
      required: true,
    },
    mobileVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);
