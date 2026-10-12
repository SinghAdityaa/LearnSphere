import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: Number, default: 10 },
  videoUrl: String,
  content: String,
  resources: [{ name: String, url: String }],
  isPreview: { type: Boolean, default: false }
}, { _id: true });

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [lessonSchema]
}, { _id: true });

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  thumbnail: String,
  instructor: { type: String, default: 'LearnSphere Team' },
  tags: [String],
  modules: [moduleSchema],
  isPublished: { type: Boolean, default: false },
  accessType: { type: String, enum: ['free', 'paid'], default: 'free', required: true },
  priceInr: { type: Number, default: 0, min: 0 } // Display-only until verified checkout is built
}, { timestamps: true });

courseSchema.virtual('lessonCount').get(function () {
  return (this.modules ?? []).reduce((total, module) => total + (module.lessons?.length ?? 0), 0);
});
courseSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Course', courseSchema);
