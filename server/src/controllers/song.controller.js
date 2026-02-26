import Song from '../models/song.model.js';
import { CACHE_KEYS, withCache } from '../services/cache.service.js';

const TRACKS_CACHE_TTL_MS = Number(process.env.TRACKS_CACHE_TTL_MS) || 30 * 1000;

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

const normalizeSong = (song, req) => ({
  id: song._id,
  title: song.title,
  artist: song.artist,
  coverImage: toAbsoluteUrl(song.coverImage ?? song.cover, req),
  audioUrl: toAbsoluteUrl(song.audioUrl ?? song.url, req),
  duration: song.duration,
  album: song.album,
  genre: song.genre,
  playlistId: song.playlistId ?? null,
});

const listSongs = async (req, res) => {
  try {
    const songs = await withCache(CACHE_KEYS.TRACKS_LIST, TRACKS_CACHE_TTL_MS, async () =>
      Song.find(
        {},
        'title artist coverImage audioUrl duration album genre playlistId createdAt',
      )
        .sort({ createdAt: -1 })
        .lean(),
    );

    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json(songs.map((song) => normalizeSong(song, req)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { listSongs };
