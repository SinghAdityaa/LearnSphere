import { CheckCircle2, Circle, FileText, ListChecks } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import LearningTools from '../components/LearningTools';

export default function Learn() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get(`/courses/${courseId}/content`), api.get(`/me/enrollments/${courseId}`)])
      .then(([courseRes, statusRes]) => {
        if (!statusRes.data.enrolled) return navigate(`/courses/${courseRes.data.course.slug}`);
        setCourse(courseRes.data.course);
        setProgress(statusRes.data.progress || { completedLessons: [], percent: 0 });
        const first = courseRes.data.course.modules.flatMap(m => m.lessons)[0];
        const lastId = statusRes.data.progress?.lastLesson;
        setCurrentLessonId(lastId || first?._id || null);
      })
      .catch(err => setError(err.response?.data?.message || 'Could not load course'));
  }, [courseId, navigate]);

  const lessons = useMemo(() => course?.modules.flatMap(module => module.lessons.map(lesson => ({ ...lesson, moduleTitle: module.title }))) || [], [course]);
  const lesson = lessons.find(item => item._id === currentLessonId) || lessons[0];
  const completed = new Set((progress?.completedLessons || []).map(String));

  const markComplete = async () => {
    const { data } = await api.patch(`/me/progress/${courseId}/${lesson._id}`, { completed: !completed.has(lesson._id) });
    setProgress(data.progress);
  };

  if (error) return <div className="page-center">{error}</div>;
  if (!course || !lesson) return <div className="page-center">Loading learning workspace…</div>;

  return (
    <section className="learning-workspace">
      <aside className="lesson-sidebar">
        <div className="lesson-sidebar-head"><span className="eyebrow">Course</span><h2>{course.title}</h2><div className="progress-line"><span style={{ width: `${progress?.percent || 0}%` }} /></div><small>{progress?.percent || 0}% complete</small></div>
        <div className="lesson-nav">
          {course.modules.map(module => <div key={module._id} className="lesson-nav-module"><h3>{module.title}</h3>{module.lessons.map(item => <button key={item._id} className={item._id === lesson._id ? 'lesson-nav-item active' : 'lesson-nav-item'} onClick={() => setCurrentLessonId(item._id)}>{completed.has(item._id) ? <CheckCircle2 size={18} /> : <Circle size={18} />}<span>{item.title}</span></button>)}</div>)}
        </div>
      </aside>
      <div className="lesson-main">
        <div className="lesson-main-top"><Link to="/dashboard">← Dashboard</Link><Link className="button secondary small" to={`/quiz/${course._id}`}><ListChecks size={16} /> Take assessment</Link></div>
        <div className="video-frame">{lesson.videoUrl ? <iframe src={lesson.videoUrl} title={lesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <div>No video added for this lesson.</div>}</div>
        <article className="lesson-content"><span className="eyebrow">{lesson.moduleTitle}</span><h1>{lesson.title}</h1><p>{lesson.content || 'Lesson notes will appear here.'}</p>
          {lesson.resources?.length > 0 && <div className="resources"><h3>Resources</h3>{lesson.resources.map(resource => <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer"><FileText size={18} />{resource.name}</a>)}</div>}
          <LearningTools key={`${courseId}-${lesson._id}`} courseId={courseId} lessonId={lesson._id} />
          <button className={completed.has(lesson._id) ? 'button success' : 'button primary'} onClick={markComplete}>{completed.has(lesson._id) ? <><CheckCircle2 size={18} /> Completed</> : 'Mark lesson complete'}</button>
        </article>
      </div>
    </section>
  );
}
