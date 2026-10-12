import { Router } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import Course from '../models/Course.js';
import { canEnrollFree } from '../utils/courseAccess.js';
import Enrollment from '../models/Enrollment.js';
import Note from '../models/Note.js';
import Whiteboard from '../models/Whiteboard.js';
const router = Router();
router.use(requireAuth);
async function allowed(req, res) {
  if (!mongoose.isValidObjectId(req.params.courseId)) { res.status(400).json({ message: 'Invalid course' }); return null; }
  const enrolled = await Enrollment.exists({ user: req.user._id, course: req.params.courseId });
  if (!enrolled) { res.status(403).json({ message: 'Enroll in the course first' }); return null; }
  const course = await Course.findById(req.params.courseId);
  if (!course || !canEnrollFree(course)) { res.status(403).json({ message: 'Free course access required' }); return null; }
  return course;
}
router.get('/:courseId/notes/:lessonId', async (req,res,next) => { try { const course = await allowed(req,res); if (!course) return; if (!mongoose.isValidObjectId(req.params.lessonId) || !course.modules.some(m => m.lessons.some(l => String(l._id) === req.params.lessonId))) return res.status(404).json({message:'Lesson not found'}); const note = await Note.findOne({user:req.user._id,course:course._id,lesson:req.params.lessonId}); res.json({body:note?.body || ''}); } catch(e){next(e);} });
router.put('/:courseId/notes/:lessonId', async (req,res,next) => { try { const course = await allowed(req,res); if (!course) return; if (!mongoose.isValidObjectId(req.params.lessonId) || !course.modules.some(m => m.lessons.some(l => String(l._id) === req.params.lessonId))) return res.status(404).json({message:'Lesson not found'}); const {body} = z.object({body:z.string().max(10000)}).parse(req.body); const note = await Note.findOneAndUpdate({user:req.user._id,course:course._id,lesson:req.params.lessonId},{body},{upsert:true,new:true,runValidators:true}); res.json({note}); } catch(e){next(e);} });
router.get('/:courseId/whiteboard', async (req,res,next) => { try { const course=await allowed(req,res); if(!course)return; const board=await Whiteboard.findOne({user:req.user._id,course:course._id}); res.json({strokes:board?.strokes || []}); }catch(e){next(e);} });
router.put('/:courseId/whiteboard', async (req,res,next) => { try { const course=await allowed(req,res); if(!course)return; const {strokes}=z.object({strokes:z.array(z.object({points:z.array(z.tuple([z.number().min(0).max(1),z.number().min(0).max(1)])).min(1).max(1500),color:z.enum(['#183b60','#c2410c','#15803d']),width:z.number().min(1).max(12)})).max(250)}).parse(req.body); const board=await Whiteboard.findOneAndUpdate({user:req.user._id,course:course._id},{strokes},{upsert:true,new:true,runValidators:true}); res.json({updatedAt:board.updatedAt}); }catch(e){next(e);} });
export default router;
