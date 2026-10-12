import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { setAuthCookie, signAuthToken } from '../utils/auth.js';

const router = Router();

router.post('/google', async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Google credential is required' });
    if (!process.env.GOOGLE_CLIENT_ID) return res.status(503).json({ message: 'Google login is not configured yet' });

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const profile = ticket.getPayload();
    if (!profile?.sub || !profile?.email || !profile.email_verified) return res.status(401).json({ message: 'Google email is not verified' });

    let user = await User.findOne({ email: profile.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        googleId: profile.sub,
        name: profile.name || profile.email.split('@')[0],
        email: profile.email,
        avatar: profile.picture,
        role: 'student'
      });
    } else {
      if (user.googleId && user.googleId !== profile.sub) return res.status(409).json({ message: 'Account linked to a different Google identity' });
      user.googleId ||= profile.sub;
      user.avatar = profile.picture || user.avatar;
      user.name = profile.name || user.name;
      await user.save();
    }

    setAuthCookie(res, signAuthToken(user));
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.post('/dev-login', async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_DEMO_LOGIN !== 'true') return res.status(404).end();
    const requestedRole = req.body.role === 'admin' ? 'admin' : 'student';
    const email = requestedRole === 'admin' ? 'admin@learnsphere.local' : 'student@learnsphere.local';
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: requestedRole === 'admin' ? 'Demo Admin' : 'Demo Student',
        email,
        role: requestedRole
      });
    }
    setAuthCookie(res, signAuthToken(user));
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80, 'Name is too long')
    }).strict();
    const { name } = schema.parse(req.body);
    const user = await User.findByIdAndUpdate(req.user._id, { $set: { name } }, {
      new: true, runValidators: true
    }).select('-__v');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) { next(error); }
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

router.post('/logout', (req, res) => {
  res.clearCookie('learnsphere_token', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ message: 'Logged out' });
});

export default router;
