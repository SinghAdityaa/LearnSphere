
import 'dotenv/config';

import { connectDb } from '../src/config/db.js';
import Course from '../src/models/Course.js';
import Quiz from '../src/models/Quiz.js';

const courses = [
  {
    title: 'React Fundamentals',
    slug: 'react-fundamentals',
    description:
      'Build a strong React foundation with components, props, state, effects, forms, routing and reusable UI patterns.',
    category: 'Web Development',
    level: 'Beginner',
    instructor: 'LearnSphere Team',
    accessType: 'free',
    priceInr: 0,
    thumbnail:
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80',
    tags: ['react', 'javascript', 'frontend'],
    isPublished: true,
    modules: [
      {
        title: 'React Essentials',
        lessons: [
          {
            title: 'Welcome to React',
            duration: 12,
            videoUrl: 'https://www.youtube.com/embed/SqcY0GlETPk',
            content:
              'Understand the component model and how React updates the user interface.',
            isPreview: true
          },
          {
            title: 'Components and Props',
            duration: 18,
            videoUrl: 'https://www.youtube.com/embed/SqcY0GlETPk',
            content: 'Create reusable components and pass data with props.'
          },
          {
            title: 'State and Events',
            duration: 20,
            videoUrl: 'https://www.youtube.com/embed/SqcY0GlETPk',
            content:
              'Manage interactive state and respond to user events.'
          }
        ]
      },
      {
        title: 'Building Real Interfaces',
        lessons: [
          {
            title: 'useEffect and Data Fetching',
            duration: 24,
            videoUrl: 'https://www.youtube.com/embed/SqcY0GlETPk',
            content: 'Work with effects and fetch data from APIs.'
          },
          {
            title: 'Forms and Validation',
            duration: 20,
            videoUrl: 'https://www.youtube.com/embed/SqcY0GlETPk',
            content:
              'Create controlled forms and validate user input.'
          }
        ]
      }
    ],
    quiz: {
      title: 'React Fundamentals Assessment',
      passPercentage: 70,
      questions: [
        {
          text: 'What is used to store component-local changing data?',
          options: ['props', 'state', 'CSS', 'routes'],
          correctIndex: 1
        },
        {
          text: 'Which hook is commonly used for side effects?',
          options: ['useMemo', 'useRef', 'useEffect', 'useId'],
          correctIndex: 2
        },
        {
          text: 'Props are primarily used to...',
          options: [
            'pass data to components',
            'compile JSX',
            'connect MongoDB',
            'style HTML'
          ],
          correctIndex: 0
        }
      ]
    }
  },

  {
    title: 'JavaScript for Modern Web Apps',
    slug: 'javascript-modern-web-apps',
    description:
      'Master the JavaScript concepts you need for modern frontend and Node.js development, including async code and modules.',
    category: 'Programming',
    level: 'Intermediate',
    instructor: 'LearnSphere Team',
    accessType: 'free',
    priceInr: 0,
    thumbnail:
      'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=1200&q=80',
    tags: ['javascript', 'es6', 'async'],
    isPublished: true,
    modules: [
      {
        title: 'Core JavaScript',
        lessons: [
          {
            title: 'Modern Syntax',
            duration: 19,
            videoUrl: 'https://www.youtube.com/embed/PkZNo7MFNFg',
            content:
              'Use let/const, destructuring, spread and template literals.',
            isPreview: true
          },
          {
            title: 'Arrays and Objects',
            duration: 22,
            videoUrl: 'https://www.youtube.com/embed/PkZNo7MFNFg',
            content:
              'Transform data with map, filter, reduce and object utilities.'
          }
        ]
      },
      {
        title: 'Async JavaScript',
        lessons: [
          {
            title: 'Promises',
            duration: 18,
            videoUrl: 'https://www.youtube.com/embed/PkZNo7MFNFg',
            content:
              'Understand promise states and chaining.'
          },
          {
            title: 'Async/Await and Fetch',
            duration: 25,
            videoUrl: 'https://www.youtube.com/embed/PkZNo7MFNFg',
            content:
              'Call APIs and handle asynchronous failures cleanly.'
          }
        ]
      }
    ],
    quiz: {
      title: 'Modern JavaScript Assessment',
      passPercentage: 70,
      questions: [
        {
          text: 'Which method creates a new array by transforming each item?',
          options: ['map', 'push', 'find', 'sort'],
          correctIndex: 0
        },
        {
          text: 'async functions return a...',
          options: ['string', 'Promise', 'DOM node', 'number'],
          correctIndex: 1
        },
        {
          text: 'Which keyword declares a block-scoped value that can be reassigned?',
          options: ['var', 'let', 'static', 'class'],
          correctIndex: 1
        }
      ]
    }
  },

  {
    title: 'Node.js & Express API Basics',
    slug: 'node-express-api-basics',
    description:
      'Create clean REST APIs with Express, middleware, routing, validation, error handling and MongoDB integration.',
    category: 'Backend',
    level: 'Beginner',
    instructor: 'LearnSphere Team',
    accessType: 'free',
    priceInr: 0,
    thumbnail:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    tags: ['node', 'express', 'api', 'mongodb'],
    isPublished: true,
    modules: [
      {
        title: 'Express Foundations',
        lessons: [
          {
            title: 'REST and Express Setup',
            duration: 16,
            videoUrl: 'https://www.youtube.com/embed/Oe421EPjeBE',
            content:
              'Understand REST conventions and start an Express server.',
            isPreview: true
          },
          {
            title: 'Routes and Middleware',
            duration: 21,
            videoUrl: 'https://www.youtube.com/embed/Oe421EPjeBE',
            content:
              'Separate routes and reuse middleware.'
          },
          {
            title: 'MongoDB with Mongoose',
            duration: 27,
            videoUrl: 'https://www.youtube.com/embed/Oe421EPjeBE',
            content:
              'Model data and persist it using Mongoose.'
          }
        ]
      }
    ],
    quiz: {
      title: 'Express API Assessment',
      passPercentage: 70,
      questions: [
        {
          text: 'Which HTTP method is normally used to create a resource?',
          options: ['GET', 'POST', 'DELETE', 'HEAD'],
          correctIndex: 1
        },
        {
          text: 'Express middleware can access...',
          options: [
            'req, res, next',
            'only HTML',
            'only MongoDB',
            'only CSS'
          ],
          correctIndex: 0
        },
        {
          text: 'Mongoose is commonly used with...',
          options: ['Redis', 'MongoDB', 'SQLite only', 'CSS'],
          correctIndex: 1
        }
      ]
    }
  }
];

async function seedSamples() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing in server/.env');
  }

  // Prevent accidentally importing into the wrong database.
  if (process.env.SEED_CONFIRM !== 'learnsphere') {
    throw new Error(
      'Set SEED_CONFIRM=learnsphere to confirm the sample course import.'
    );
  }

  await connectDb();

  console.log('Connected to MongoDB.');
  console.log('Starting safe sample course import...');

  let added = 0;
  let skipped = 0;

  for (const item of courses) {
    const { quiz, ...courseData } = item;

    const existingCourse = await Course.findOne({
      slug: courseData.slug
    });

    if (existingCourse) {
      console.log(`SKIPPED: ${courseData.title} already exists.`);
      skipped++;
      continue;
    }

    const course = await Course.create(courseData);

    await Quiz.create({
      course: course._id,
      ...quiz
    });

    console.log(`ADDED: ${course.title}`);
    added++;
  }

  console.log('\nSample import completed.');
  console.log(`Courses added: ${added}`);
  console.log(`Courses skipped: ${skipped}`);

  process.exit(0);
}

seedSamples().catch((error) => {
  console.error('Sample import failed:', error.message);
  process.exit(1);
});
