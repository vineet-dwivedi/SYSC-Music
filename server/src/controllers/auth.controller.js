import crypto from 'crypto';
import User from '../models/user.model.js';

const sanitizeName = (value) => {
  const normalized = String(value ?? '').trim();
  if (!normalized) return '';
  return normalized.slice(0, 80);
};

const normalizeAuthMode = (value) =>
  String(value ?? '').trim().toLowerCase() === 'register' ? 'register' : 'login';

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


const loginWithGoogle = async (req, res) => {
  try {
    const credential = String(req.body?.credential ?? '').trim();
    const authMode = normalizeAuthMode(req.body?.mode);
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
    const existingUser = await User.findOne({
      $or: [{ googleSub }, { email }],
    });

    if (authMode === 'register' && existingUser) {
      return res.status(409).json({ message: 'This email is already registered. Please login.' });
    }

    if (authMode === 'login' && !existingUser) {
      return res.status(404).json({ message: 'This email is not registered. Please register first.' });
    }

    let user;
    if (existingUser) {
      user = await User.findByIdAndUpdate(
        existingUser._id,
        {
          $set: {
            name,
            email,
            googleSub,
            avatarUrl,
            authProvider: 'google',
          },
        },
        { new: true },
      );
    } else {
      user = await User.create({
        name,
        email,
        googleSub,
        avatarUrl,
        authProvider: 'google',
        mobileVerified: false,
      });
    }

    const token = createSessionToken();
    return res.status(200).json({
      message: authMode === 'register' ? 'Registration successful' : 'Google login successful',
      token,
      user: toClientUser(user),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export {
  loginWithGoogle,
};
