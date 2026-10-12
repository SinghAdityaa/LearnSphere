import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import courseRoutes from './routes/course.routes.js';
import studentRoutes from './routes/student.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import certificateRoutes from './routes/certificate.routes.js';
import adminRoutes from './routes/admin.routes.js';
import workspaceRoutes from './routes/workspace.routes.js';
import pathRoutes from './routes/path.routes.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(x => x.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.get('Origin');
  // Browsers include Origin on cross-origin mutations; reject foreign or missing origins in production.
  if ((origin && !allowedOrigins.includes(origin)) || (process.env.NODE_ENV === 'production' && !origin)) {
    return res.status(403).json({ message: 'Request origin not permitted' });
  }
  next();
});
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'LearnSphere API' }));
app.use(['/api/auth', '/api/me', '/api/workspace', '/api/quizzes', '/api/admin'], (req, res, next) => { res.set('Cache-Control', 'private, no-store'); next(); });
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/me', studentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/paths', pathRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
