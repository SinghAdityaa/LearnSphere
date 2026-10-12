import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Favorite from '../models/Favorite.js';
import Progress from '../models/Progress.js';
import Certificate from '../models/Certificate.js';
import Note from '../models/Note.js';
import Whiteboard from '../models/Whiteboard.js';

const router = Router();
router.use(requireAuth, requireAdmin);

const courseSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  category: z.string().min(2),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
  thumbnail: z.string().url().optional().or(z.literal('')),
  instructor: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  accessType: z.enum(['free', 'paid']).optional(),
  priceInr: z.number().int().nonnegative().max(1000000).optional(),
  modules: z.array(z.object({
    title: z.string().min(1),
    lessons: z.array(z.object({
      title: z.string().min(1),
      duration: z.number().nonnegative().optional(),
      videoUrl: z.string().optional(),
      content: z.string().optional(),
      isPreview: z.boolean().optional(),
      resources: z.array(z.object({ name: z.string(), url: z.string() })).optional()
    }))
  })).optional()
});

router.get('/overview', async (req, res, next) => {
  try {
    const [users, courses, enrollments, attempts] = await Promise.all([
      User.countDocuments(), Course.countDocuments(), Enrollment.countDocuments(), QuizAttempt.countDocuments()
    ]);
    res.json({ users, courses, enrollments, quizAttempts: attempts });
  } catch (error) { next(error); }
});

// Admin-only student directory. Return only fields needed for administration.
router.get('/students', async (req, res, next) => {
  try {
    const query = z.object({
      search: z.string().trim().max(100).optional().default(''),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(10)
    }).parse(req.query);
    const filter = { role: 'student' };
    if (query.search) {
      const safe = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [{ name: { $regex: safe, $options: 'i' } }, { email: { $regex: safe, $options: 'i' } }];
    }
    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter).select('name email avatar createdAt').sort({ createdAt: -1, _id: -1 })
        .skip((query.page - 1) * query.limit).limit(query.limit).lean()
    ]);
    const ids = users.map(user => user._id);
    const [enrollmentStats, certificateStats] = await Promise.all([
      Enrollment.aggregate([{ $match: { user: { $in: ids } } }, { $group: { _id: '$user', count: { $sum: 1 } } }]),
      Certificate.aggregate([{ $match: { user: { $in: ids } } }, { $group: { _id: '$user', count: { $sum: 1 } } }])
    ]);
    const enrolled = new Map(enrollmentStats.map(row => [String(row._id), row.count]));
    const earned = new Map(certificateStats.map(row => [String(row._id), row.count]));
    res.json({ students: users.map(user => ({ ...user, enrollmentCount: enrolled.get(String(user._id)) || 0, certificateCount: earned.get(String(user._id)) || 0 })), total, page: query.page, pages: Math.max(1, Math.ceil(total / query.limit)) });
  } catch (error) { next(error); }
});

router.get('/students/:id', async (req, res, next) => {
  try {
    if (!/^[0-9a-f]{24}$/i.test(req.params.id)) return res.status(400).json({ message: 'Invalid student ID' });
    const student = await User.findOne({ _id: req.params.id, role: 'student' }).select('name email avatar createdAt').lean();
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const [enrollments, progress, certificates] = await Promise.all([
      Enrollment.find({ user: student._id }).populate('course', 'title slug').sort({ enrolledAt: -1 }).lean(),
      Progress.find({ user: student._id }).select('course percent completedLessons updatedAt').lean(),
      Certificate.find({ user: student._id }).populate('course', 'title').select('course certificateId issuedAt').lean()
    ]);
    const savedProgress = new Map(progress.map(item => [String(item.course), item]));
    res.json({ student, enrollments: enrollments.map(item => ({ id: item._id, course: item.course ? { id: item.course._id, title: item.course.title, slug: item.course.slug } : null, enrolledAt: item.enrolledAt, progressPercent: savedProgress.get(String(item.course?._id))?.percent || 0 })), certificates: certificates.map(item => ({ certificateId: item.certificateId, courseTitle: item.course?.title || 'Removed course', issuedAt: item.issuedAt })) });
  } catch (error) { next(error); }
});

router.get('/courses', async (req, res, next) => {
  try { res.json({ courses: await Course.find().sort({ createdAt: -1 }) }); }
  catch (error) { next(error); }
});

router.post('/courses', async (req, res, next) => {
  try {
    const parsed = courseSchema.parse(req.body);
    if (parsed.accessType === 'paid' && (!parsed.priceInr || parsed.priceInr < 1)) return res.status(400).json({ message: 'Paid courses require a positive price in INR' });
    if (parsed.accessType !== 'paid' && (parsed.priceInr || 0) !== 0) return res.status(400).json({ message: 'Free courses must have price 0' });
    const course = await Course.create(parsed);
    res.status(201).json({ course });
  } catch (error) { next(error); }
});

router.patch('/courses/:id', async (req, res, next) => {
  try {
    const parsed = courseSchema.partial().parse(req.body);
    const current = await Course.findById(req.params.id);
    if (!current) return res.status(404).json({ message: 'Course not found' });
    const accessType = parsed.accessType ?? current.accessType;
    const priceInr = parsed.priceInr ?? current.priceInr;
    if (accessType === 'paid' && (!priceInr || priceInr < 1)) return res.status(400).json({ message: 'Paid courses require a positive price in INR' });
    if (accessType === 'free' && priceInr !== 0) return res.status(400).json({ message: 'Free courses must have price 0' });
    const course = await Course.findByIdAndUpdate(req.params.id, parsed, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ course });
  } catch (error) { next(error); }
});

router.delete('/courses/:id', async (req, res, next) => {
  try {
    await Promise.all([
      Course.findByIdAndDelete(req.params.id),
      Enrollment.deleteMany({ course: req.params.id }),
      Quiz.deleteMany({ course: req.params.id }), Favorite.deleteMany({ course: req.params.id }), Progress.deleteMany({ course: req.params.id }), Certificate.deleteMany({ course: req.params.id }), Note.deleteMany({ course: req.params.id }), Whiteboard.deleteMany({ course: req.params.id })
    ]);
    res.json({ message: 'Course deleted' });
  } catch (error) { next(error); }
});

router.put('/courses/:courseId/quiz', async (req, res, next) => {
  try {
    const input = z.object({ title:z.string().min(3).max(140), passPercentage:z.number().min(1).max(100), questions:z.array(z.object({text:z.string().min(3),options:z.array(z.string().min(1)).min(2).max(6),correctIndex:z.number().int().min(0)}).refine(q=>q.correctIndex<q.options.length,'Correct answer must be a valid option')).min(1).max(100) }).parse(req.body);
    if (!await Course.exists({_id:req.params.courseId})) return res.status(404).json({message:'Course not found'});
    const quiz = await Quiz.findOneAndUpdate(
      { course: req.params.courseId },
      { ...input, course: req.params.courseId },
      { upsert: true, new: true, runValidators: true }
    );
    res.json({ quiz });
  } catch (error) { next(error); }
});

router.get('/courses/:courseId/quiz', async(req,res,next)=>{try{const quiz=await Quiz.findOne({course:req.params.courseId}).select('+questions.correctIndex');res.json({quiz});}catch(e){next(e)}});
export default router;
