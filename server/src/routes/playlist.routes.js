import express from 'express';
import mongoose from 'mongoose';
import Playlist from '../models/playlist.model.js';
import Song from '../models/song.model.js';

const router = express.Router();

const toAbsoluteUrl = (value, req) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}${value.startsWith('/') ? '' : '/'}${value}`;
};

const normalizePlaylist = (playlist, req) => ({
  id: playlist._id,
  name: playlist.name,
  slug: playlist.slug,
  movieTitle: playlist.movieTitle,
  coverImage: toAbsoluteUrl(playlist.coverImage, req),
  description: playlist.description,
});

const normalizeSong = (song, req) => ({
  id: song._id,
  title: song.title,
  artist: song.artist,
  coverImage: toAbsoluteUrl(song.coverImage ?? song.cover, req),
  audioUrl: toAbsoluteUrl(song.audioUrl ?? song.url, req),
  duration: song.duration,
  album: song.album,
  genre: song.genre,
  playlistId: song.playlistId,
});

const parseTrackIds = (payload) => {
  if (Array.isArray(payload?.trackIds)) return payload.trackIds;
  if (payload?.trackId) return [payload.trackId];
  return [];
};

router.get('/', async (req, res) => {
  try {
    const playlists = await Playlist.find().sort({ name: 1 }).lean();
    res.json(playlists.map((playlist) => normalizePlaylist(playlist, req)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, movieTitle = '', coverImage = '', description = '' } = req.body ?? {};
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Playlist name is required' });
    }

    const playlist = await Playlist.create({
      name: name.trim(),
      movieTitle: movieTitle.trim(),
      coverImage: coverImage.trim(),
      description: description.trim(),
    });

    return res.status(201).json(normalizePlaylist(playlist.toObject(), req));
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'Playlist already exists' });
    }
    return res.status(500).json({ message: err.message });
  }
});

router.get('/:playlistId', async (req, res) => {
  try {
    const { playlistId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({ message: 'Invalid playlist id' });
    }

    const playlist = await Playlist.findById(playlistId).lean();
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    return res.json(normalizePlaylist(playlist, req));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch('/:playlistId', async (req, res) => {
  try {
    const { playlistId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({ message: 'Invalid playlist id' });
    }

    const updates = {};
    const { name, movieTitle, coverImage, description } = req.body ?? {};
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (typeof movieTitle === 'string') updates.movieTitle = movieTitle.trim();
    if (typeof coverImage === 'string') updates.coverImage = coverImage.trim();
    if (typeof description === 'string') updates.description = description.trim();

    const playlist = await Playlist.findByIdAndUpdate(playlistId, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    return res.json(normalizePlaylist(playlist, req));
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'Playlist name already exists' });
    }
    return res.status(500).json({ message: err.message });
  }
});

router.delete('/:playlistId', async (req, res) => {
  try {
    const { playlistId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({ message: 'Invalid playlist id' });
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId).lean();
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    await Song.updateMany({ playlistId }, { $set: { playlistId: null } });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/:playlistId/tracks', async (req, res) => {
  try {
    const { playlistId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({ message: 'Invalid playlist id' });
    }

    const playlist = await Playlist.findById(playlistId).lean();
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    const tracks = await Song.find({ playlistId }).sort({ title: 1 }).lean();
    return res.json({
      playlist: normalizePlaylist(playlist, req),
      tracks: tracks.map((track) => normalizeSong(track, req)),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post('/:playlistId/tracks', async (req, res) => {
  try {
    const { playlistId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({ message: 'Invalid playlist id' });
    }

    const playlist = await Playlist.findById(playlistId).lean();
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    const rawTrackIds = parseTrackIds(req.body);
    const trackIds = rawTrackIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (!trackIds.length) {
      return res.status(400).json({ message: 'Provide valid trackId or trackIds[]' });
    }

    await Song.updateMany(
      { _id: { $in: trackIds } },
      { $set: { playlistId: new mongoose.Types.ObjectId(playlistId) } },
    );

    const tracks = await Song.find({ playlistId }).sort({ title: 1 }).lean();
    return res.status(200).json({
      playlist: normalizePlaylist(playlist, req),
      tracks: tracks.map((track) => normalizeSong(track, req)),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete('/:playlistId/tracks/:trackId', async (req, res) => {
  try {
    const { playlistId, trackId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(trackId)) {
      return res.status(400).json({ message: 'Invalid playlist or track id' });
    }

    const updated = await Song.findOneAndUpdate(
      { _id: trackId, playlistId },
      { $set: { playlistId: null } },
      { new: true },
    ).lean();

    if (!updated) return res.status(404).json({ message: 'Track not found in this playlist' });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
