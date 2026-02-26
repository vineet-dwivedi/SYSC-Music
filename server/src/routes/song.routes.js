import express from 'express';
import { listSongs } from '../controllers/song.controller.js';

const router = express.Router();

router.get('/', listSongs);

export default router;
