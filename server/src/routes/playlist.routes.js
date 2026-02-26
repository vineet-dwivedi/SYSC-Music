import express from 'express';
import {
  addPlaylistTracks,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getPlaylistTracks,
  listPlaylists,
  removePlaylistTrack,
  updatePlaylist,
} from '../controllers/playlist.controller.js';

const router = express.Router();

router.get('/', listPlaylists);
router.post('/', createPlaylist);
router.get('/:playlistId', getPlaylistById);
router.patch('/:playlistId', updatePlaylist);
router.delete('/:playlistId', deletePlaylist);
router.get('/:playlistId/tracks', getPlaylistTracks);
router.post('/:playlistId/tracks', addPlaylistTracks);
router.delete('/:playlistId/tracks/:trackId', removePlaylistTrack);

export default router;
