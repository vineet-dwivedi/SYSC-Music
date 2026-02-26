import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import songRoutes from './routes/song.routes.js';
import playlistRoutes from './routes/playlist.routes.js';
import mediaRoutes from './routes/media.routes.js';
import authRoutes from './routes/auth.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPublicDir = path.join(__dirname, '../public');
const app = express();

dotenv.config({ path: path.join(__dirname, '../.env') });

const normalizeOrigin = (value) => value.trim().replace(/\/+$/, '');

const configuredOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
  'https://sysc-music.vercel.app',
  ...configuredOrigins,
]);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const normalizedOrigin = normalizeOrigin(origin);
  if (allowedOrigins.has(normalizedOrigin)) return true;

  // Allow Vercel preview deployments.
  try {
    const parsed = new URL(normalizedOrigin);
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
};

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  }),
);
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

app.use('/api/songs', songRoutes);
app.use('/api/tracks', songRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/auth', authRoutes);
app.use(
  '/public',
  express.static(rootPublicDir, {
    maxAge: '7d',
  }),
);

app.get('/', (req, res) => {
  res.send('Music API running');
});

export default app;
