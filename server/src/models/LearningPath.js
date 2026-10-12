import mongoose from 'mongoose';
const schema = new mongoose.Schema({ title: { type: String, required: true, trim: true }, description: { type: String, default: '' }, courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], isPublished: { type: Boolean, default: false } }, { timestamps: true });
export default mongoose.model('LearningPath', schema);
