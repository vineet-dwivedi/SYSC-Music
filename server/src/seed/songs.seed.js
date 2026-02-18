import mongoose from "mongoose";
import dotenv from "dotenv";
import Song from "../models/song.model.js";

dotenv.config();

const songs = [
  {
    title: "Lutt Le Gaya",
    artist: "Demo Artist",
    album: "Single",
    genre: "Demo",
    duration: 214,
    coverImage: "/public/images/cover1.jpg",
    audioUrl: "/public/audio/song1.mp3"
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Song.deleteMany();
    await Song.insertMany(songs);

    console.log("✅ Songs seeded");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
