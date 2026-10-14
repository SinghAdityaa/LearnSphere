
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,  
  Layers3,
  Play,
  Search,
  ShieldCheck
} from 'lucide-react';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [paths, setPaths] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [search, setSearch] = useState('');
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState('');
  const [pathsError, setPathsError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadCourses() {
      try {
        const { data } = await api.get('/courses');

        if (active) {
          setCourses(
            Array.isArray(data.courses)
              ? data.courses.filter(course => course.isPublished !== false)
              : []
          );
        }
      } catch {
        if (active) {
          setCoursesError('Courses could not be loaded right now.');
        }
      } finally {
        if (active) setCoursesLoading(false);
      }
    }

    async function loadPaths() {
      try {
        const { data } = await api.get('/paths');
        if (active) {
          setPaths(Array.isArray(data.paths) ? data.paths : []);
        }
      } catch {
        if (active) setPathsError('Learning paths are unavailable.');
      }
    }

    loadCourses();
    loadPaths();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setDashboard(null);
      return;
    }

    let active = true;

    api.get('/me/dashboard')
      .then(({ data }) => {
        if (active) setDashboard(data);
      })
      .catch(() => {
        if (active) setDashboard(null);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const categories = useMemo(() => {
    const counts = new Map();

    courses.forEach(course => {
      if (!course.category) return;

      counts.set(
        course.category,
        (counts.get(course.category) || 0) + 1
      );
    });

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1]);
  }, [courses]);

  const featuredCourses = useMemo(
    () => courses.slice(0, 3),
    [courses]
  );

  const visiblePaths = useMemo(
    () => paths.filter(path =>
      path.courses?.some(course => course?.isPublished !== false)
    ).slice(0, 3),
    [paths]
  );

  const continueCourse = dashboard?.enrollments?.find(
    item => item.course && (item.progress?.percent || 0) < 100
  );

  const submitSearch = event => {
    event.preventDefault();

    const query = search.trim();
    navigate('/courses', {
      state: query ? { search: query } : undefined
    });
  };

  return (
    <div className="home-v2">

      {/* HERO */}

      <section className="home-hero">
        <div className="section-shell home-hero-grid">

          <div className="home-hero-content">
            <span className="eyebrow">LearnSphere Learning Platform</span>

            <h1>
              Build skills that
              <span> move you forward.</span>
            </h1>

            <p>
              Explore structured courses, learn at your own pace,
              test your understanding and keep track of what
              you've completed.
            </p>

            <form className="home-search" onSubmit={submitSearch}>
              <Search size={20} aria-hidden="true" />
              <input
                type="search"
                aria-label="Search courses"
                placeholder="Search for React, JavaScript, Node.js..."
                value={search}
                onChange={event => setSearch(event.target.value)}
              />
              <button type="submit">Search</button>
            </form>

            <div className="home-hero-actions">
              <Link className="button primary" to="/courses">
                Explore courses <ArrowRight size={18} />
              </Link>

              <Link
                className="button secondary"
                to={user ? '/dashboard' : '/login'}
              >
                {user ? 'My dashboard' : 'Get started'}
              </Link>
            </div>

            <div className="home-hero-benefits">
              <span><CheckCircle2 size={17} /> Free courses available</span>
              <span><CheckCircle2 size={17} /> Saved progress</span>
              <span><CheckCircle2 size={17} /> Course assessments</span>
            </div>
          </div>

          <div className="home-hero-aside">
            <div className="home-preview">

              <div className="home-preview-top">
                <span className="home-preview-icon">
                  <GraduationCap size={23} />
                </span>
                <div>
                  <small>YOUR LEARNING SPACE</small>
                  <h2>
                    {user
                      ? `Welcome back${user.name ? `, ${user.name.split(' ')[0]}` : ''}`
                      : 'Start learning today'}
                  </h2>
                </div>
              </div>

              {continueCourse ? (
                <div className="home-resume-card">
                  <span className="eyebrow">Continue learning</span>
                  <h3>{continueCourse.course.title}</h3>
                  <div className="progress-line">
                    <span
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, continueCourse.progress?.percent || 0)
                        )}%`
                      }}
                    />
                  </div>
                  <p>
                    {continueCourse.progress?.percent || 0}% complete
                  </p>
                  <Link
                    className="button primary"
                    to={`/learn/${continueCourse.course._id}`}
                  >
                    <Play size={16} /> Resume course
                  </Link>
                </div>
              ) : (
                <div className="home-resume-card">
                  <span className="eyebrow">Course discovery</span>
                  <h3>Find your next course</h3>
                  <p>
                    Browse available courses and choose a subject
                    you want to learn.
                  </p>
                  <Link className="button primary" to="/courses">
                    Browse catalog <ArrowRight size={16} />
                  </Link>
                </div>
              )}

              <div className="home-preview-links">
                <Link to="/courses">
                  <BookOpen size={20} />
                  <span>Courses</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/paths">
                  <Layers3 size={20} />
                  <span>Learning paths</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to={user ? '/dashboard' : '/login'}>
                  <ClipboardCheck size={20} />
                  <span>Learning dashboard</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* FEATURED COURSES */}

      <section className="section-shell home-section">
        <div className="home-section-heading">
          <div>
            <span className="eyebrow">Course catalog</span>
            <h2>Explore available courses</h2>
            <p>
              Browse courses published on LearnSphere and
              find something worth learning.
            </p>
          </div>

          <Link className="home-view-all" to="/courses">
            View all courses <ArrowRight size={18} />
          </Link>
        </div>

        {coursesLoading ? (
          <div className="home-course-skeletons" aria-label="Loading courses">
            {[1, 2, 3].map(item => (
              <div className="home-skeleton" key={item}>
                <div className="home-skeleton-image" />
                <div className="home-skeleton-line" />
                <div className="home-skeleton-line short" />
              </div>
            ))}
          </div>
        ) : coursesError ? (
          <div className="empty-state" role="alert">
            {coursesError}
            <button
              className="button secondary"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : featuredCourses.length ? (
          <div className="course-grid home-featured-grid">
            {featuredCourses.map(course => (
              <CourseCard
                key={course._id}
                course={course}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            No published courses are available yet.
          </div>
        )}
      </section>

      {/* CATEGORIES */}

      <section className="home-soft-section">
        <div className="section-shell home-section">
          <div className="home-section-heading">
            <div>
              <span className="eyebrow">Browse by subject</span>
              <h2>Find your area of interest</h2>
              <p>
                Explore subjects based on courses currently
                available in the catalog.
              </p>
            </div>
          </div>

          {categories.length ? (
            <div className="home-category-grid">
              {categories.map(([category, count]) => (
                <Link
                  key={category}
                  className="home-category-card"
                  to="/courses"
                  state={{ category }}
                >
                  <span className="home-category-icon">
                    <BookOpenCheck size={23} />
                  </span>
                  <div>
                    <h3>{category}</h3>
                    <p>
                      {count} {count === 1 ? 'course' : 'courses'}
                    </p>
                  </div>
                  <ArrowRight size={18} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              {coursesLoading
                ? 'Loading subjects...'
                : coursesError
                  ? 'Subjects could not be loaded.'
                  : 'Subjects will appear when courses are published.'}
            </div>
          )}
        </div>
      </section>

      {/* LEARNING PATHS */}

      <section className="section-shell home-section">
        <div className="home-section-heading">
          <div>
            <span className="eyebrow">Guided learning</span>
            <h2>Follow a learning path</h2>
            <p>
              Study related courses in a recommended order
              instead of choosing every next step yourself.
            </p>
          </div>

          <Link className="home-view-all" to="/paths">
            All learning paths <ArrowRight size={18} />
          </Link>
        </div>

        {visiblePaths.length ? (
          <div className="home-path-grid">
            {visiblePaths.map(path => (
              <article className="home-path-card" key={path._id}>
                <div className="home-path-icon">
                  <Layers3 size={23} />
                </div>

                <h3>{path.title}</h3>
                <p>{path.description}</p>

                <span className="home-path-count">
                  {path.courses?.filter(
                    course => course?.isPublished !== false
                  ).length || 0} courses
                </span>

                <Link className="text-link" to="/paths">
                  View learning path <ArrowRight size={17} />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            {pathsError
              ? pathsError
              : 'Learning paths will appear here once published.'}
          </div>
        )}
      </section>

      {/* PLATFORM FEATURES */}

      <section className="home-soft-section">
        <div className="section-shell home-section">
          <div className="home-section-heading">
            <div>
              <span className="eyebrow">Learning tools</span>
              <h2>Everything you need to keep learning</h2>
              <p>
                LearnSphere keeps your courses, assessments
                and progress connected to your account.
              </p>
            </div>
          </div>

          <div className="home-benefit-grid">
            <article>
              <BookOpenCheck size={25} />
              <h3>Structured lessons</h3>
              <p>
                Follow modules and lessons organized around
                each course topic.
              </p>
            </article>

            <article>
              <CheckCircle2 size={25} />
              <h3>Saved progress</h3>
              <p>
                Track completed lessons and continue
                learning from your dashboard.
              </p>
            </article>

            <article>
              <ClipboardCheck size={25} />
              <h3>Assessments</h3>
              <p>
                Check your understanding through
                course quizzes.
              </p>
            </article>

            <article>
              <GraduationCap size={25} />
              <h3>Certificates</h3>
              <p>
                Earn certificates after meeting the
                course completion requirements.
              </p>
            </article>

            <article>
              <Layers3 size={25} />
              <h3>Learning paths</h3>
              <p>
                Explore a guided sequence of
                related courses.
              </p>
            </article>

            <article>
              <ShieldCheck size={25} />
              <h3>Google sign-in</h3>
              <p>
                Access your learning account using
                Google authentication.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}

      <section className="section-shell home-bottom-section">
        <div className="home-bottom-content">
          <div>
            <span className="eyebrow">Get started</span>
            <h2>Choose a course and start learning.</h2>
            <p>
              Browse the catalog, enroll in a course
              and follow your progress from one place.
            </p>
          </div>

          <Link className="button primary" to="/courses">
            Browse courses <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </div>
  );
}
