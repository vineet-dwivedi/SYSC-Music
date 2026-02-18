import express from 'express';
import Song from '../models/song.model.js';

const router = express.Router();

const isLocalHost = (host) => host === 'localhost' || host === '127.0.0.1';
const isHttpProtocol = (protocol) => protocol === 'http:';

const toAbsoluteUrl = (value, req) => {
  if (!value) return '';
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      const requestProtocol = `${req.protocol}:`;
      const requestHost = req.get('host');
      const isSameHost = parsed.host === requestHost;

      if (isHttpProtocol(parsed.protocol) && (isSameHost || isLocalHost(parsed.hostname))) {
        return `${requestProtocol}//${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }

      if (isLocalHost(parsed.hostname)) {
        return `${baseUrl}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
      return value;
    } catch {
      return value;
    }
  }

  return `${baseUrl}${value.startsWith('/') ? '' : '/'}${value}`;
};

router.get('/', async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 }).lean();
    const normalized = songs.map((song) => ({
      id: song._id,
      title: song.title,
      artist: song.artist,
      coverImage: toAbsoluteUrl(song.coverImage ?? song.cover, req),
      audioUrl: toAbsoluteUrl(song.audioUrl ?? song.url, req),
      duration: song.duration,
      album: song.album,
      genre: song.genre,
      playlistId: song.playlistId ?? null,
    }));
    res.json(normalized);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
