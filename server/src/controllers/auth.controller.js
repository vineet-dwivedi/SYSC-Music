import crypto from 'crypto';
import User from '../models/user.model.js';
import { sendOtpSms } from '../services/sms.service.js';

const OTP_TTL_MS = Number(process.env.OTP_TTL_MS) || 5 * 60 * 1000;
const OTP_MIN_RESEND_INTERVAL_MS = Number(process.env.OTP_MIN_RESEND_INTERVAL_MS) || 30 * 1000;
const OTP_LENGTH = 6;
const OTP_DEV_MODE = String(process.env.OTP_DEV_MODE ?? 'true').trim().toLowerCase() !== 'false';

const otpStore = new Map();

const normalizeMobile = (value) => String(value ?? '').replace(/\D/g, '');
const isValidMobile = (value) => /^\d{10,15}$/.test(value);

const sanitizeName = (value) => {
  const normalized = String(value ?? '').trim();
  if (!normalized) return '';
  return normalized.slice(0, 80);
};

const createOtpCode = () => {
  let otp = '';
  for (let index = 0; index < OTP_LENGTH; index += 1) {
    otp += String(crypto.randomInt(0, 10));
  }
  return otp;
};

const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');

const getOtpKey = (mode, mobile) => `${mode}:${mobile}`;
const clearOtp = ({ mode, mobile }) => otpStore.delete(getOtpKey(mode, mobile));

const pruneExpiredOtps = () => {
  const now = Date.now();
  for (const [key, entry] of otpStore.entries()) {
    if (!entry || entry.expiresAt <= now) otpStore.delete(key);
  }
};

const createSessionToken = () => crypto.randomBytes(32).toString('hex');

const toClientUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email ?? '',
  mobile: user.mobile ?? '',
  avatarUrl: user.avatarUrl ?? '',
  authProvider: user.authProvider,
  mobileVerified: Boolean(user.mobileVerified),
});

const maybeDevOtp = (otp, delivery) => {
  if (OTP_DEV_MODE) return { devOtp: otp };
  return delivery?.delivered ? {} : { devOtp: otp };
};

const saveOtp = ({ mobile, mode }) => {
  pruneExpiredOtps();
  const now = Date.now();
  const key = getOtpKey(mode, mobile);
  const previous = otpStore.get(key);

  if (previous && now - previous.sentAt < OTP_MIN_RESEND_INTERVAL_MS) {
    const retryAfterMs = OTP_MIN_RESEND_INTERVAL_MS - (now - previous.sentAt);
    return { ok: false, retryAfterMs };
  }

  const otp = createOtpCode();
  otpStore.set(key, {
    otpHash: hashOtp(otp),
    sentAt: now,
    expiresAt: now + OTP_TTL_MS,
    attempts: 0,
  });

  return { ok: true, otp };
};

const verifyOtp = ({ mobile, mode, otp }) => {
  pruneExpiredOtps();
  const key = getOtpKey(mode, mobile);
  const current = otpStore.get(key);
  if (!current) return { ok: false, message: 'OTP expired or not requested' };

  if (current.expiresAt <= Date.now()) {
    otpStore.delete(key);
    return { ok: false, message: 'OTP expired. Request a new one' };
  }

  if (current.attempts >= 5) {
    otpStore.delete(key);
    return { ok: false, message: 'Too many attempts. Request a new OTP' };
  }

  const matches = hashOtp(otp) === current.otpHash;
  if (!matches) {
    current.attempts += 1;
    otpStore.set(key, current);
    return { ok: false, message: 'Invalid OTP' };
  }

  otpStore.delete(key);
  return { ok: true };
};

const deliverOtp = async ({ mode, mobile, otp }) => {
  const modeLabel = mode.toUpperCase();
  if (OTP_DEV_MODE) {
    console.log(`[OTP][${modeLabel}] Dev OTP for ${mobile}: ${otp}`);
    return {
      ok: true,
      delivery: {
        delivered: false,
        provider: 'dev',
      },
    };
  }

  try {
    const delivery = await sendOtpSms({ mobile, otp, purpose: mode });
    if (!delivery.delivered && process.env.NODE_ENV === 'production') {
      return {
        ok: false,
        status: 503,
        message: 'OTP SMS provider is not configured on server',
      };
    }

    if (delivery.delivered) {
      console.log(`[OTP][${modeLabel}] Sent via ${delivery.provider} to ${delivery.mobileE164}`);
    } else {
      console.log(`[OTP][${modeLabel}] Dev OTP for ${mobile}: ${otp}`);
    }

    return { ok: true, delivery };
  } catch (error) {
    console.error(`[OTP][${mode.toUpperCase()}] SMS delivery failed for ${mobile}:`, error.message);
    return {
      ok: false,
      status: 502,
      message: 'Failed to send OTP to mobile number. Please try again.',
    };
  }
};

const requestMobileRegisterOtp = async (req, res) => {
  try {
    const mobile = normalizeMobile(req.body?.mobile);
    const name = sanitizeName(req.body?.name);

    if (!isValidMobile(mobile)) {
      return res.status(400).json({ message: 'Enter a valid mobile number' });
    }
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const existing = await User.findOne({ mobile }).lean();
    if (existing) {
      return res.status(409).json({ message: 'Mobile number already registered. Please login.' });
    }

    const saved = saveOtp({ mobile, mode: 'register' });
    if (!saved.ok) {
      return res.status(429).json({
        message: 'OTP already sent recently. Please wait before trying again.',
        retryAfterMs: saved.retryAfterMs,
      });
    }

    const deliveryResult = await deliverOtp({ mode: 'register', mobile, otp: saved.otp });
    if (!deliveryResult.ok) {
      clearOtp({ mode: 'register', mobile });
      return res.status(deliveryResult.status).json({ message: deliveryResult.message });
    }

    return res.status(200).json({
      message: 'OTP sent to mobile number',
      ...maybeDevOtp(saved.otp, deliveryResult.delivery),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const verifyMobileRegisterOtp = async (req, res) => {
  try {
    const mobile = normalizeMobile(req.body?.mobile);
    const otp = String(req.body?.otp ?? '').trim();
    const name = sanitizeName(req.body?.name);

    if (!isValidMobile(mobile)) {
      return res.status(400).json({ message: 'Enter a valid mobile number' });
    }
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'Enter a valid 6-digit OTP' });
    }
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const otpResult = verifyOtp({ mobile, mode: 'register', otp });
    if (!otpResult.ok) {
      return res.status(401).json({ message: otpResult.message });
    }

    const alreadyRegistered = await User.findOne({ mobile }).lean();
    if (alreadyRegistered) {
      return res.status(409).json({ message: 'Mobile number already registered. Please login.' });
    }

    const user = await User.create({
      name,
      mobile,
      authProvider: 'mobile',
      mobileVerified: true,
    });

    const token = createSessionToken();
    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: toClientUser(user),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const requestMobileLoginOtp = async (req, res) => {
  try {
    const mobile = normalizeMobile(req.body?.mobile);
    if (!isValidMobile(mobile)) {
      return res.status(400).json({ message: 'Enter a valid mobile number' });
    }

    const user = await User.findOne({ mobile }).lean();
    if (!user) {
      return res.status(404).json({ message: 'Mobile number is not registered' });
    }

    const saved = saveOtp({ mobile, mode: 'login' });
    if (!saved.ok) {
      return res.status(429).json({
        message: 'OTP already sent recently. Please wait before trying again.',
        retryAfterMs: saved.retryAfterMs,
      });
    }

    const deliveryResult = await deliverOtp({ mode: 'login', mobile, otp: saved.otp });
    if (!deliveryResult.ok) {
      clearOtp({ mode: 'login', mobile });
      return res.status(deliveryResult.status).json({ message: deliveryResult.message });
    }

    return res.status(200).json({
      message: 'OTP sent to registered mobile number',
      ...maybeDevOtp(saved.otp, deliveryResult.delivery),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const verifyMobileLoginOtp = async (req, res) => {
  try {
    const mobile = normalizeMobile(req.body?.mobile);
    const otp = String(req.body?.otp ?? '').trim();

    if (!isValidMobile(mobile)) {
      return res.status(400).json({ message: 'Enter a valid mobile number' });
    }
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'Enter a valid 6-digit OTP' });
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ message: 'Mobile number is not registered' });
    }

    const otpResult = verifyOtp({ mobile, mode: 'login', otp });
    if (!otpResult.ok) {
      return res.status(401).json({ message: otpResult.message });
    }

    const token = createSessionToken();
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: toClientUser(user),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const loginWithGoogle = async (req, res) => {
  try {
    const credential = String(req.body?.credential ?? '').trim();
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    const configuredAudience = String(process.env.GOOGLE_CLIENT_ID ?? '').trim();
    if (!configuredAudience) {
      return res.status(503).json({ message: 'Google login is not configured on server' });
    }

    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
    );
    if (!response.ok) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    const tokenInfo = await response.json();
    if (tokenInfo.aud !== configuredAudience) {
      return res.status(401).json({ message: 'Google client id mismatch' });
    }
    if (tokenInfo.email_verified !== 'true') {
      return res.status(401).json({ message: 'Google email is not verified' });
    }

    const email = String(tokenInfo.email ?? '').trim().toLowerCase();
    const googleSub = String(tokenInfo.sub ?? '').trim();
    if (!email || !googleSub) {
      return res.status(401).json({ message: 'Google token payload is invalid' });
    }

    const name = sanitizeName(tokenInfo.name) || email.split('@')[0] || 'Google User';
    const avatarUrl = String(tokenInfo.picture ?? '').trim();

    const query = {
      $or: [{ googleSub }, { email }],
    };
    const update = {
      $set: {
        name,
        email,
        googleSub,
        avatarUrl,
        authProvider: 'google',
      },
      $setOnInsert: {
        mobileVerified: false,
      },
    };

    const user = await User.findOneAndUpdate(query, update, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

    const token = createSessionToken();
    return res.status(200).json({
      message: 'Google login successful',
      token,
      user: toClientUser(user),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export {
  loginWithGoogle,
  requestMobileLoginOtp,
  requestMobileRegisterOtp,
  verifyMobileLoginOtp,
  verifyMobileRegisterOtp,
};
