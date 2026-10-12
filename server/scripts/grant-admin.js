import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: npm run grant-admin -- your-google-email@example.com');
  process.exit(1);
}
try {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing');
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email, googleId: { $exists: true, $nin: [null, ''] } });
  if (!user) throw new Error('No Google-linked account found. Sign in with Google before running this command.');
  user.role = 'admin';
  await user.save();
  console.log(`Admin role granted to existing Google account: ${email}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
