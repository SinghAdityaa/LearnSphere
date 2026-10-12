import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Favorite from '../models/Favorite.js';
import Progress from '../models/Progress.js';
import Certificate from '../models/Certificate.js';
import { canEnrollFree } from '../utils/courseAccess.js';

const router = Router();
router.use(requireAuth);

router.get('/dashboard', async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id }).populate('course', 'title slug category level thumbnail accessType priceInr isPublished');
    const progress = await Progress.find({ user: req.user._id });
    const progressByCourse = Object.fromEntries(progress.map(p => [p.course.toString(), p]));
    const items = enrollments.map(e => ({
      enrollmentId: e._id,
      course: e.course,
      progress: progressByCourse[e.course._id.toString()] || { percent: 0, completedLessons: [] }
    }));
    const certificates = await Certificate.find({ user: req.user._id }).populate('course', 'title slug category level thumbnail accessType priceInr isPublished').sort({ issuedAt: -1 });
    res.json({ enrollments: items, certificates });
  } catch (error) { next(error); }
});

router.post('/enrollments', async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findOne({ _id: courseId, isPublished: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!canEnrollFree(course)) return res.status(403).json({ message: 'Paid enrollment is not available yet. This course cannot be unlocked until secure checkout is launched.' });
    const enrollment = await Enrollment.findOneAndUpdate(
      { user: req.user._id, course: courseId },
      { $setOnInsert: { enrolledAt: new Date() } },
      { upsert: true, new: true }
    );
    await Progress.findOneAndUpdate(
      { user: req.user._id, course: courseId },
      { $setOnInsert: { completedLessons: [], percent: 0 } },
      { upsert: true, new: true }
    );
    res.status(201).json({ enrollment });
  } catch (error) { next(error); }
});

router.get('/enrollments/:courseId', async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: req.params.courseId });
    const progress = await Progress.findOne({ user: req.user._id, course: req.params.courseId });
    const course = await Course.findById(req.params.courseId).select('isPublished accessType');
    res.json({ enrolled: Boolean(enrollment && canEnrollFree(course)), progress: canEnrollFree(course) ? progress : null });
  } catch (error) { next(error); }
});

router.patch('/progress/:courseId/:lessonId', async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const enrolled = await Enrollment.exists({ user: req.user._id, course: courseId });
    if (!enrolled || !canEnrollFree(course)) return res.status(403).json({ message: 'Free course enrollment required' });

    const allLessonIds = course.modules.flatMap(m => m.lessons.map(l => l._id.toString()));
    if (!allLessonIds.includes(lessonId)) return res.status(404).json({ message: 'Lesson not found' });

    let progress = await Progress.findOne({ user: req.user._id, course: courseId });
    if (!progress) progress = new Progress({ user: req.user._id, course: courseId, completedLessons: [] });
    const current = new Set(progress.completedLessons.map(String));
    if (req.body.completed === false) current.delete(lessonId); else current.add(lessonId);
    progress.completedLessons = [...current];
    progress.lastLesson = lessonId;
    progress.percent = allLessonIds.length ? Math.round((current.size / allLessonIds.length) * 100) : 0;
    await progress.save();
    res.json({ progress });
  } catch (error) { next(error); }
});

router.get('/favorites', async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).populate('course', 'title slug category level thumbnail accessType priceInr isPublished').sort({ createdAt: -1 });
    res.json({ favorites });
  } catch (error) { next(error); }
});

router.post('/favorites/:courseId', async (req, res, next) => {
  try {
    await Favorite.findOneAndUpdate(
      { user: req.user._id, course: req.params.courseId },
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ message: 'Saved to favorites' });
  } catch (error) { next(error); }
});

router.delete('/favorites/:courseId', async (req, res, next) => {
  try {
    await Favorite.deleteOne({ user: req.user._id, course: req.params.courseId });
    res.json({ message: 'Removed from favorites' });
  } catch (error) { next(error); }
});

export default router;
