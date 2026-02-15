import express from 'express';
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import songRoutes from "./routes/song.routes.js";
import playlistRoutes from './routes/playlist.routes.js';
import mediaRoutes from './routes/media.routes.js';
import path from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname =  path.dirname(__filename);
const rootPublicDir = path.join(__dirname, '../public');
const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());
app.use("/api/songs", songRoutes);
app.use("/api/tracks", songRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/media', mediaRoutes);
app.use('/public', express.static(rootPublicDir));
connectDB();

app.get("/", (req, res) => {
  res.send("Music API running 🚀");
});

export default app;
