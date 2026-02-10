import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    artist: {
      type: String,
      required: true,
      index: true
    },

    album: {
      type: String,
      default: ""
    },

    coverImage: {
      type: String
    },

    audioUrl: {
      type: String,
      required: true
    },

    duration: {
      type: Number // seconds
    },

    genre: {
      type: String,
      index: true
    },

    plays: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("Song", songSchema);
