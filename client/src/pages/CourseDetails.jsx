import { BookOpen, Check, Clock3, PlayCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get(`/courses/${identifier}`)
      .then(async ({ data }) => {
        setCourse(data.course);
        if (user) {
          const status = await api.get(`/me/enrollments/${data.course._id}`);
          setEnrolled(status.data.enrolled);
          setProgress(status.data.progress);
        }
      })
      .catch(err => setError(err.response?.data?.message || 'Could not load the course. Please try again.'))
      .finally(() => setLoading(false));
  }, [identifier, user]);

  const totals = useMemo(() => {
    if (!course) return { lessons: 0, minutes: 0 };
    return course.modules.reduce((acc, module) => {
      acc.lessons += module.lessons.length;
      acc.minutes += module.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
      return acc;
    }, { lessons: 0, minutes: 0 });
  }, [course]);

  const enroll = async () => {
    if (course.accessType === 'paid') return;
    if (!user) return navigate('/login');
    setEnrolling(true);
    setError('');
    try {
      await api.post('/me/enrollments', { courseId: course._id });
      setEnrolled(true);
      navigate(`/learn/${course._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed. Please try again.');
    } finally { setEnrolling(false); }
  };

  if (loading) return <div className="page-center">Loading course…</div>;
  if (!course) return <div className="page-center">{error || "Course not found."}</div>;

  return (
    <section className="page-section">
      <div className="course-hero">
        <div className="section-shell course-hero-grid">
          <div>
            <span className="eyebrow light">{course.category} · {course.level}</span>
            <h1>{course.title}</h1>
            <p>{course.description}</p>
            <div className="course-hero-meta"><span><BookOpen size={18} /> {totals.lessons} lessons</span><span><Clock3 size={18} /> {totals.minutes} minutes</span><span>Instructor: {course.instructor}</span></div>
            {error && <div role="alert" className="alert error">{error}</div>}
            <p className="access-label">{course.accessType==='paid'?`Paid course · ₹${course.priceInr} · Enrollment coming later`:'Free course'}</p>
            {enrolled ? <Link className="button light" to={`/learn/${course._id}`}><PlayCircle size={18} /> Continue learning {progress?.percent ? `(${progress.percent}%)` : ''}</Link> : course.accessType==='paid'?<button className="button light" disabled>Paid enrollment coming soon</button>:<button className="button light" onClick={enroll} disabled={enrolling}>{enrolling ? 'Enrolling…' : 'Enroll for free'}</button>}
          </div>
          <img src={course.thumbnail} alt="" />
        </div>
      </div>
      <div className="section-shell course-content-grid">
        <div>
          <span className="eyebrow">Syllabus</span>
          <h2>Course content</h2>
          <div className="syllabus-list">
            {course.modules.map((module, moduleIndex) => (
              <article className="module-card" key={module._id}>
                <div className="module-title"><span>{String(moduleIndex + 1).padStart(2, '0')}</span><div><h3>{module.title}</h3><small>{module.lessons.length} lessons</small></div></div>
                <div className="lesson-list">{module.lessons.map(lesson => <div key={lesson._id}><Check size={16} /><span>{lesson.title}</span><small>{lesson.duration} min</small></div>)}</div>
              </article>
            ))}
          </div>
        </div>
        <aside className="sticky-summary">
          <h3>What you get</h3>
          <ul><li>Structured video lessons</li><li>Progress saved to your account</li><li>Final assessment</li><li>Downloadable certificate after passing</li></ul>
          {enrolled ? <Link className="button primary full" to={`/learn/${course._id}`}>Open course</Link> : course.accessType==='paid'?<button className="button primary full" disabled>Checkout coming soon</button>:<button className="button primary full" onClick={enroll} disabled={enrolling}>{enrolling ? 'Enrolling…' : 'Enroll for free'}</button>}
        </aside>
      </div>
    </section>
  );
}
