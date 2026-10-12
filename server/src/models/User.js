import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: { type: String, sparse: true, unique: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true, unique: true },
  avatar: String,
  role: { type: String, enum: ['student', 'admin'], default: 'student' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
