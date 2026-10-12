import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Enrollment from '../models/Enrollment.js';
import Certificate from '../models/Certificate.js';
import Course from '../models/Course.js';
import Progress from '../models/Progress.js';
import { completionEligibility, scoreAnswers } from '../utils/completion.js';
import { canEnrollFree } from '../utils/courseAccess.js';

const router = Router();
router.use(requireAuth);

router.get('/course/:courseId', async (req, res, next) => {
  try {
    const enrolled = await Enrollment.exists({ user: req.user._id, course: req.params.courseId });
    if (!enrolled || !canEnrollFree(await Course.findById(req.params.courseId))) return res.status(403).json({ message: 'Free course enrollment required' });
    const quiz = await Quiz.findOne({ course: req.params.courseId });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found for this course' });
    res.json({ quiz });
  } catch (error) { next(error); }
});

router.post('/:quizId/submit', async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).select('+questions.correctIndex');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    const enrolled = await Enrollment.exists({ user: req.user._id, course: quiz.course });
    if (!enrolled || !canEnrollFree(await Course.findById(quiz.course))) return res.status(403).json({ message: 'Free course enrollment required' });
    const answers = z.object({answers:z.array(z.number().int().min(-1).max(20)).max(100)}).parse(req.body).answers;
    if (!quiz.questions.length || answers.length !== quiz.questions.length) return res.status(400).json({message:'Answer every question'});
    const { score, total, percentage, passed } = scoreAnswers(quiz.questions, answers, quiz.passPercentage);
    const attempt = await QuizAttempt.create({
      user: req.user._id,
      quiz: quiz._id,
      score,
      total,
      percentage,
      passed,
      answers
    });
    let certificate = null;
    const course = await Course.findById(quiz.course);
    const progress = await Progress.findOne({ user: req.user._id, course: quiz.course });
    const allLessonIds = course?.modules.flatMap(m => m.lessons.map(l => String(l._id))) || [];
    const completedIds = new Set((progress?.completedLessons || []).map(String));
    const lessonsDone = completionEligibility(allLessonIds, [...completedIds], passed);
    if (passed && lessonsDone) {
      certificate = await Certificate.findOneAndUpdate(
        { user: req.user._id, course: quiz.course },
        { $setOnInsert: { issuedAt: new Date() } },
        { upsert: true, new: true }
      );
    }
    res.json({ attempt, certificate, lessonsDone, certificateMessage: passed && !lessonsDone ? 'Pass recorded. Complete all lessons to unlock your certificate.' : null });
  } catch (error) { next(error); }
});

router.get('/attempts/course/:courseId', async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId }).select('_id');
    const attempts = await QuizAttempt.find({ user: req.user._id, quiz: { $in: quizzes.map(q => q._id) } }).sort({ createdAt: -1 });
    res.json({ attempts });
  } catch (error) { next(error); }
});

export default router;
