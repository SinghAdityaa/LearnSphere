import { Router } from 'express';
import Course from '../models/Course.js';
import { publicCourse } from '../utils/courseAccess.js';
import { requireAuth } from '../middleware/auth.js';
import Enrollment from '../models/Enrollment.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { search = '', category = '', level = '' } = req.query;
    if ([search, category, level].some(v => typeof v !== 'string' || v.length > 100)) return res.status(400).json({ message: 'Invalid search filters' });
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const filter = { isPublished: true };
    if (search) filter.$or = [
      { title: { $regex: escapedSearch, $options: 'i' } },
      { description: { $regex: escapedSearch, $options: 'i' } },
      { tags: { $elemMatch: { $regex: escapedSearch, $options: 'i' } } }
    ];
    if (category) filter.category = category;
    if (level) filter.level = level;
    const courses = await Course.find(filter).sort({ createdAt: -1 });
    res.json({ courses: courses.map(publicCourse) });
  } catch (error) { next(error); }
});

router.get('/:identifier', async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const course = await Course.findOne({
      isPublished: true,
      $or: [{ slug: identifier }, ...(identifier.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: identifier }] : [])]
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ course: publicCourse(course) });
  } catch (error) { next(error); }
});

// Never serve full course material through a public route.
router.get('/:courseId/content', requireAuth, async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course || !course.isPublished) return res.status(404).json({ message: 'Course unavailable' });
    const enrolled = await Enrollment.exists({ user: req.user._id, course: course._id });
    if (!enrolled) return res.status(403).json({ message: 'Enrollment required' });
    // Existing unpaid enrollments in previously free courses are not payment proof.
    if (course.accessType === 'paid') return res.status(403).json({ message: 'Paid course delivery is not enabled yet' });
    res.set('Cache-Control', 'private, no-store');
    res.json({ course });
  } catch (error) { next(error); }
});

export default router;
