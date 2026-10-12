import 'dotenv/config';
import app from './src/app.js';
import { connectDb } from './src/config/db.js';

const port = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is required. Copy .env.example to .env first.');
  process.exit(1);
}

if (process.env.NODE_ENV === 'production' && (process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.includes('replace-with'))) {
  console.error('Set a strong, unique JWT_SECRET before deploying.');
  process.exit(1);
}

connectDb()
  .then(() => app.listen(port, () => console.log(`LearnSphere API running on http://localhost:${port}`)))
  .catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  });
