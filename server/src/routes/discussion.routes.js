
import { Router } from 'express';
import mongoose from 'mongoose';

import Discussion from '../models/Discussion.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const validId = id => mongoose.isValidObjectId(id);
const currentUserId = req => req.user?._id || req.user?.id;
const isAdmin = req =>
  String(req.user?.role || '').toLowerCase() === 'admin';

// Never expose student emails in discussion responses.
const authorFields = 'name';

const publicPost = post => ({
  _id: post._id,
  course: post.course,
  parent: post.parent,
  content: post.content,
  isResolved: post.isResolved,
  author: post.author,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt
});

async function canParticipate(req, courseId) {
  const userId = currentUserId(req);

  if (!userId || !validId(userId)) return false;
  if (isAdmin(req)) return true;

  return Boolean(
    await Enrollment.exists({
      user: userId,
      course: courseId
    })
  );
}

async function getCourse(req, res) {
  if (!validId(req.params.courseId)) {
    res.status(400).json({ message: 'Invalid course ID.' });
    return null;
  }

  const course = await Course.findById(req.params.courseId)
    .select('_id isPublished');

  if (!course || (!course.isPublished && !isAdmin(req))) {
    res.status(404).json({ message: 'Course not found.' });
    return null;
  }

  return course;
}

const escapeRegex = value =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Get questions with search, filters, and reply counts.
router.get(
  '/courses/:courseId/discussions',
  requireAuth,
  async (req, res, next) => {
    try {
      const course = await getCourse(req, res);
      if (!course) return;

      if (!(await canParticipate(req, course._id))) {
        return res.status(403).json({
          message: 'Enroll in this course to access discussions.'
        });
      }

      const rawPage = Number.parseInt(req.query.page, 10);
      const page = Number.isSafeInteger(rawPage) && rawPage > 0
        ? rawPage
        : 1;

      const limit = 10;

      const search = typeof req.query.search === 'string'
        ? req.query.search.trim()
        : '';

      if (search.length > 100) {
        return res.status(400).json({
          message: 'Search must be 100 characters or fewer.'
        });
      }

      const status = typeof req.query.status === 'string'
        ? req.query.status
        : 'all';

      if (!['all', 'resolved', 'unanswered'].includes(status)) {
        return res.status(400).json({
          message: 'Invalid discussion filter.'
        });
      }

      const filter = {
        course: course._id,
        parent: null
      };

      if (status === 'resolved') {
        filter.isResolved = true;
      }

      if (status === 'unanswered') {
        filter.isResolved = false;
      }

      if (search) {
        filter.content = {
          $regex: escapeRegex(search),
          $options: 'i'
        };
      }

      const total = await Discussion.countDocuments(filter);
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const safePage = Math.min(page, totalPages);

      const posts = await Discussion.find(filter)
        .populate('author', authorFields)
        .sort({ createdAt: -1, _id: -1 })
        .skip((safePage - 1) * limit)
        .limit(limit)
        .lean();

      const ids = posts.map(post => post._id);

      let replies = [];

      if (ids.length > 0) {
        replies = await Discussion.find({
          course: course._id,
          parent: { $in: ids }
        })
          .populate('author', authorFields)
          .sort({ createdAt: 1 })
          .lean();
      }

      const grouped = new Map();

      for (const reply of replies) {
        const key = String(reply.parent);

        if (!grouped.has(key)) {
          grouped.set(key, []);
        }

        grouped.get(key).push(publicPost(reply));
      }

      res.json({
        posts: posts.map(post => {
          const postReplies = grouped.get(String(post._id)) || [];

          return {
            ...publicPost(post),
            replyCount: postReplies.length,
            replies: postReplies
          };
        }),
        pagination: {
          page: safePage,
          total,
          totalPages,
          limit
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Create a question or reply.
router.post(
  '/courses/:courseId/discussions',
  requireAuth,
  async (req, res, next) => {
    try {
      const course = await getCourse(req, res);
      if (!course) return;

      if (!(await canParticipate(req, course._id))) {
        return res.status(403).json({
          message: 'You must be enrolled to post.'
        });
      }

      const content = req.body?.content;

      if (
        typeof content !== 'string' ||
        content.trim().length < 3 ||
        content.trim().length > 3000
      ) {
        return res.status(400).json({
          message: 'Write between 3 and 3000 characters.'
        });
      }

      let parent = null;

      if (req.body?.parent != null) {
        if (!validId(req.body.parent)) {
          return res.status(400).json({
            message: 'Invalid parent discussion.'
          });
        }

        const parentPost = await Discussion.findOne({
          _id: req.body.parent,
          course: course._id,
          parent: null
        });

        if (!parentPost) {
          return res.status(404).json({
            message: 'Question not found.'
          });
        }

        parent = parentPost._id;
      }

      const post = await Discussion.create({
        course: course._id,
        author: currentUserId(req),
        parent,
        content: content.trim()
      });

      await post.populate('author', authorFields);

      res.status(201).json({
        post: publicPost(post)
      });
    } catch (error) {
      next(error);
    }
  }
);

// Edit a question or reply.
router.patch(
  '/discussions/:id',
  requireAuth,
  async (req, res, next) => {
    try {
      if (!validId(req.params.id)) {
        return res.status(400).json({
          message: 'Invalid discussion ID.'
        });
      }

      const post = await Discussion.findById(req.params.id);

      if (!post) {
        return res.status(404).json({
          message: 'Post not found.'
        });
      }

      const ownsPost =
        String(post.author) === String(currentUserId(req));

      if (!ownsPost && !isAdmin(req)) {
        return res.status(403).json({
          message: 'Not permitted.'
        });
      }

      const hasContent = req.body?.content !== undefined;
      const hasResolved = req.body?.isResolved !== undefined;

      if (!hasContent && !hasResolved) {
        return res.status(400).json({
          message: 'No changes provided.'
        });
      }

      if (hasContent) {
        if (
          typeof req.body.content !== 'string' ||
          req.body.content.trim().length < 3 ||
          req.body.content.trim().length > 3000
        ) {
          return res.status(400).json({
            message: 'Write between 3 and 3000 characters.'
          });
        }

        post.content = req.body.content.trim();
      }

      if (hasResolved) {
        if (post.parent) {
          return res.status(400).json({
            message: 'Only questions can be resolved.'
          });
        }

        if (typeof req.body.isResolved !== 'boolean') {
          return res.status(400).json({
            message: 'isResolved must be a boolean.'
          });
        }

        post.isResolved = req.body.isResolved;
      }

      await post.save();
      await post.populate('author', authorFields);

      res.json({
        post: publicPost(post)
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete a question or reply.
router.delete(
  '/discussions/:id',
  requireAuth,
  async (req, res, next) => {
    try {
      if (!validId(req.params.id)) {
        return res.status(400).json({
          message: 'Invalid discussion ID.'
        });
      }

      const post = await Discussion.findById(req.params.id);

      if (!post) {
        return res.status(404).json({
          message: 'Post not found.'
        });
      }

      const ownsPost =
        String(post.author) === String(currentUserId(req));

      if (!ownsPost && !isAdmin(req)) {
        return res.status(403).json({
          message: 'Not permitted.'
        });
      }

      await Discussion.deleteMany({
        $or: [
          { _id: post._id },
          { parent: post._id }
        ]
      });

      res.json({
        message: 'Discussion deleted.'
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
