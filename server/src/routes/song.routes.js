import express from 'express';
import Song from '../models/song.model.js';

const router = express.Router();

const toAbsoluteUrl = (value, req) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
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
