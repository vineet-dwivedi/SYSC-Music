import Song from '../models/song.model.js';
import { CACHE_KEYS, withCache } from '../services/cache.service.js';

const TRACKS_CACHE_TTL_MS = Number(process.env.TRACKS_CACHE_TTL_MS) || 5 * 60 * 1000;
const TRACKS_LIST_PROJECTION = 'title artist coverImage audioUrl duration album genre playlistId';

const isLocalHost = (host) => host === 'localhost' || host === '127.0.0.1';
const isHttpProtocol = (protocol) => protocol === 'http:';

const getRequestMeta = (req) => {
  const host = req.get('host');
  const protocol = `${req.protocol}:`;

  return {
    baseUrl: `${req.protocol}://${host}`,
    host,
    protocol,
  };
};

const toAbsoluteUrl = (value, requestMeta) => {
  if (!value) return '';
  const { baseUrl, host, protocol } = requestMeta;

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      const isSameHost = parsed.host === host;

      if (isHttpProtocol(parsed.protocol) && (isSameHost || isLocalHost(parsed.hostname))) {
        return `${protocol}//${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}`;
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

const normalizeSong = (song, requestMeta) => ({
  id: song._id,
  title: song.title,
  artist: song.artist,
  coverImage: toAbsoluteUrl(song.coverImage ?? song.cover, requestMeta),
  audioUrl: toAbsoluteUrl(song.audioUrl ?? song.url, requestMeta),
  duration: song.duration,
  album: song.album,
  genre: song.genre,
  playlistId: song.playlistId ?? null,
});

const loadSongsForList = () =>
  Song.find({}, TRACKS_LIST_PROJECTION)
    // Sort by _id to use Mongo's built-in primary index instead of an unindexed createdAt sort.
    .sort({ _id: -1 })
    .lean();

const listSongs = async (req, res) => {
  try {
    const songs = await withCache(CACHE_KEYS.TRACKS_LIST, TRACKS_CACHE_TTL_MS, loadSongsForList);
    const requestMeta = getRequestMeta(req);

    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json(songs.map((song) => normalizeSong(song, requestMeta)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { listSongs };
