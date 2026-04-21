import express from 'express';
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/google', loginWithGoogle);
router.post('/email/login', loginWithEmail);
router.post('/email/register', registerWithEmail);

export default router;
