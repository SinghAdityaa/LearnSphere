import mongoose from 'mongoose';
const schema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }, lesson: { type: mongoose.Schema.Types.ObjectId, required: true }, body: { type: String, default: '', maxlength: 10000 } }, { timestamps: true });
schema.index({ user: 1, course: 1, lesson: 1 }, { unique: true });
export default mongoose.model('Note', schema);
