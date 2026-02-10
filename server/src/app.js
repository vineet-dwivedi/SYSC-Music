import express from 'express';
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import songRoutes from "./routes/song.routes.js";
import path from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname =  path.dirname(__filename);
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/songs", songRoutes);
app.use("/api/tracks", songRoutes);
app.use("/public", express.static(path.join(__dirname,"public"))); 

dotenv.config();
connectDB();

app.get("/", (req, res) => {
  res.send("Music API running 🚀");
});

export default app;
