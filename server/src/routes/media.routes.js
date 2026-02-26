import express from 'express';
import { listSongsFromFolder } from '../controllers/media.controller.js';

const router = express.Router();

router.get('/songs', listSongsFromFolder);

export default router;
