
import {
  BookOpen,
  Check,
  Clock3,
  LockKeyhole,
  MessageCircle,
  PlayCircle
} from 'lucide-react';

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import CourseDiscussion from '../components/CourseDiscussion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CourseDetails() {
  const { identifier } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentChecked, setEnrollmentChecked] = useState(false);

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  useEffect(() => {
    let active = true;

    async function loadCourse() {
      setLoading(true);
      setError('');
      setCourse(null);
      setEnrolled(false);
      setProgress(null);
      setEnrollmentChecked(false);

      try {
        const { data } = await api.get(`/courses/${identifier}`);

        if (!active) return;

        const loadedCourse = data.course;
        setCourse(loadedCourse);

        if (user && !isAdmin) {
          try {
            const status = await api.get(
              `/me/enrollments/${loadedCourse._id}`
            );

            if (!active) return;

            setEnrolled(Boolean(status.data.enrolled));
            setProgress(status.data.progress || null);
          } catch (err) {
            if (!active) return;

            setError(
              err.response?.data?.message ||
              'Could not check your enrollment status.'
            );
          }
        }
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
          'Could not load the course. Please try again.'
        );
      } finally {
        if (active) {
          setLoading(false);
          setEnrollmentChecked(true);
        }
      }
    }

    loadCourse();

    return () => {
      active = false;
    };
  }, [identifier, user?._id, user?.id, isAdmin]);

  const totals = useMemo(() => {
    if (!course) return { lessons: 0, minutes: 0 };

    return (course.modules || []).reduce(
      (acc, module) => {
        const lessons = module.lessons || [];

        acc.lessons += lessons.length;
        acc.minutes += lessons.reduce(
          (sum, lesson) => sum + (Number(lesson.duration) || 0),
          0
        );

        return acc;
      },
      { lessons: 0, minutes: 0 }
    );
  }, [course]);

  async function enroll() {
    if (!course || course.accessType === 'paid') return;

    if (!user) {
      navigate('/login');
      return;
    }

    setEnrolling(true);
    setError('');

    try {
      await api.post('/me/enrollments', {
        courseId: course._id
      });

      setEnrolled(true);
      navigate(`/learn/${course._id}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Enrollment failed. Please try again.'
      );
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return (
      <div className="page-center" role="status">
        Loading course...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="page-center" role="alert">
        {error || 'Course not found.'}
      </div>
    );
  }

  const isPaid = course.accessType === 'paid';
  const canDiscuss = Boolean(
    user && enrollmentChecked && (enrolled || isAdmin)
  );

  return (
    <section className="page-section">

      {/* COURSE HERO */}

      <div className="course-hero">
        <div className="section-shell course-hero-grid">
          <div>
            <span className="eyebrow light">
              {course.category} · {course.level}
            </span>

            <h1>{course.title}</h1>
            <p>{course.description}</p>

            <div className="course-hero-meta">
              <span>
                <BookOpen size={18} />
                {totals.lessons} lessons
              </span>

              <span>
                <Clock3 size={18} />
                {totals.minutes} minutes
              </span>

              <span>
                Instructor: {course.instructor}
              </span>
            </div>

            {error && (
              <div role="alert" className="alert error">
                {error}
              </div>
            )}

            <p className="access-label">
              {isPaid
                ? `Paid course · ₹${course.priceInr} · Enrollment coming later`
                : 'Free course'}
            </p>

            {enrolled ? (
              <Link
                className="button light"
                to={`/learn/${course._id}`}
              >
                <PlayCircle size={18} />
                Continue learning
                {progress?.percent
                  ? ` (${progress.percent}%)`
                  : ''}
              </Link>
            ) : isPaid ? (
              <button className="button light" disabled>
                Paid enrollment coming soon
              </button>
            ) : (
              <button
                className="button light"
                onClick={enroll}
                disabled={enrolling}
              >
                {enrolling ? 'Enrolling...' : 'Enroll for free'}
              </button>
            )}
          </div>

          {course.thumbnail && (
            <img src={course.thumbnail} alt="" />
          )}
        </div>
      </div>

      {/* COURSE CONTENT */}

      <div className="section-shell course-content-grid">
        <div>
          <span className="eyebrow">Syllabus</span>
          <h2>Course content</h2>

          <div className="syllabus-list">
            {(course.modules || []).map((module, moduleIndex) => (
              <article
                className="module-card"
                key={module._id || moduleIndex}
              >
                <div className="module-title">
                  <span>
                    {String(moduleIndex + 1).padStart(2, '0')}
                  </span>

                  <div>
                    <h3>{module.title}</h3>
                    <small>
                      {module.lessons?.length || 0} lessons
                    </small>
                  </div>
                </div>

                <div className="lesson-list">
                  {(module.lessons || []).map((lesson, lessonIndex) => (
                    <div key={lesson._id || lessonIndex}>
                      <Check size={16} />
                      <span>{lesson.title}</span>
                      <small>{lesson.duration || 0} min</small>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          {/* COURSE DISCUSSION */}

          {canDiscuss ? (
            <CourseDiscussion courseId={course._id} />
          ) : (
            <div className="course-discussion-locked">
              <span className="course-discussion-locked-icon">
                {user
                  ? <LockKeyhole size={24} />
                  : <MessageCircle size={24} />}
              </span>

              <div>
                <h3>Course discussions</h3>
                <p>
                  {user
                    ? 'Enroll in this course to ask questions and participate in discussions.'
                    : 'Sign in and enroll to join course discussions.'}
                </p>
              </div>

              {!user ? (
                <Link className="button primary" to="/login">
                  Sign in
                </Link>
              ) : !enrolled && !isPaid ? (
                <button
                  className="button primary"
                  onClick={enroll}
                  disabled={enrolling}
                >
                  {enrolling ? 'Enrolling...' : 'Enroll for free'}
                </button>
              ) : null}
            </div>
          )}
        </div>

        {/* COURSE SIDEBAR */}

        <aside className="sticky-summary">
          <h3>What you get</h3>

          <ul>
            <li>Structured video lessons</li>
            <li>Progress saved to your account</li>
            <li>Final assessment</li>
            <li>Downloadable certificate after passing</li>
          </ul>

          {enrolled ? (
            <Link
              className="button primary full"
              to={`/learn/${course._id}`}
            >
              Open course
            </Link>
          ) : isPaid ? (
            <button className="button primary full" disabled>
              Checkout coming soon
            </button>
          ) : (
            <button
              className="button primary full"
              onClick={enroll}
              disabled={enrolling}
            >
              {enrolling ? 'Enrolling...' : 'Enroll for free'}
            </button>
          )}
        </aside>
      </div>
    </section>
  );
}
