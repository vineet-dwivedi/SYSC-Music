import express from 'express';
import {
  loginWithGoogle,
  requestMobileLoginOtp,
  requestMobileRegisterOtp,
  verifyMobileLoginOtp,
  verifyMobileRegisterOtp,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/google', loginWithGoogle);
router.post('/mobile/register/request-otp', requestMobileRegisterOtp);
router.post('/mobile/register/verify-otp', verifyMobileRegisterOtp);
router.post('/mobile/login/request-otp', requestMobileLoginOtp);
router.post('/mobile/login/verify-otp', verifyMobileLoginOtp);

export default router;
