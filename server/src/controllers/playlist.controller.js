import mongoose from 'mongoose';
import Playlist from '../models/playlist.model.js';
import Song from '../models/song.model.js';
import { CACHE_KEYS, invalidateMany, withCache } from '../services/cache.service.js';

const PLAYLISTS_CACHE_TTL_MS = Number(process.env.PLAYLISTS_CACHE_TTL_MS) || 30 * 1000;

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

const listPlaylists = async (req, res) => {
  try {
    const playlists = await withCache(CACHE_KEYS.PLAYLISTS_LIST, PLAYLISTS_CACHE_TTL_MS, async () =>
      Playlist.find().sort({ name: 1 }).lean(),
    );
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    res.json(playlists.map((playlist) => normalizePlaylist(playlist, req)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createPlaylist = async (req, res) => {
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

    invalidateMany([CACHE_KEYS.PLAYLISTS_LIST]);
    return res.status(201).json(normalizePlaylist(playlist.toObject(), req));
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'Playlist already exists' });
    }
    return res.status(500).json({ message: err.message });
  }
};

const getPlaylistById = async (req, res) => {
  try {
    const { playlistId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({ message: 'Invalid playlist id' });
    }

    const playlist = await Playlist.findById(playlistId).lean();
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    invalidateMany([CACHE_KEYS.PLAYLISTS_LIST]);
    return res.json(normalizePlaylist(playlist, req));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const updatePlaylist = async (req, res) => {
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
};

const deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({ message: 'Invalid playlist id' });
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId).lean();
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    await Song.updateMany({ playlistId }, { $set: { playlistId: null } });
    invalidateMany([CACHE_KEYS.PLAYLISTS_LIST, CACHE_KEYS.TRACKS_LIST]);
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getPlaylistTracks = async (req, res) => {
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
};

const addPlaylistTracks = async (req, res) => {
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
    invalidateMany([CACHE_KEYS.TRACKS_LIST]);
    return res.status(200).json({
      playlist: normalizePlaylist(playlist, req),
      tracks: tracks.map((track) => normalizeSong(track, req)),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const removePlaylistTrack = async (req, res) => {
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
    invalidateMany([CACHE_KEYS.TRACKS_LIST]);
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export {
  addPlaylistTracks,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getPlaylistTracks,
  listPlaylists,
  removePlaylistTrack,
  updatePlaylist,
};
