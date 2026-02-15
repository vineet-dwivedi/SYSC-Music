import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const songsRootDir = path.join(__dirname, '../../public/songs');

const AUDIO_EXTENSIONS = new Set(['.mp3', '.flac', '.wav', '.m4a', '.aac', '.ogg']);

const sanitizeFolder = (value) => {
  const raw = typeof value === 'string' ? value.trim() : '';
  const fallback = 'bulk-800';
  const candidate = raw || fallback;
  if (path.isAbsolute(candidate) || candidate.includes('..')) return null;
  const normalized = candidate.replace(/\\/g, '/');
  if (normalized.startsWith('/')) return null;
  return normalized
    .split('/')
    .filter(Boolean)
    .join('/');
};

const toAudioUrl = (fileName, folder, req) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const encodedName = encodeURIComponent(fileName);
  return `${baseUrl}/public/songs/${folder}/${encodedName}`;
};

router.get('/songs', async (req, res) => {
  const folder = sanitizeFolder(req.query.folder);
  if (!folder) {
    return res.status(400).json({ message: 'Invalid folder path' });
  }

  const targetDir = path.join(songsRootDir, folder);
  const relative = path.relative(songsRootDir, targetDir);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return res.status(400).json({ message: 'Invalid folder path' });
  }

  try {
    const entries = await fs.readdir(targetDir, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile() && AUDIO_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));

    const items = files.map((fileName) => ({
      fileName,
      relativePath: `/public/songs/${folder}/${fileName}`,
      audioUrl: toAudioUrl(fileName, folder, req),
    }));

    return res.json({
      folder,
      count: items.length,
      items,
    });
  } catch (err) {
    if (err?.code === 'ENOENT') {
      return res.status(404).json({ message: `Folder not found: ${folder}` });
    }
    return res.status(500).json({ message: err.message });
  }
});

export default router;
