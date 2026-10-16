import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Courses() {
  const location = useLocation();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
const [search, setSearch] = useState(
  () => location.state?.search || ''
);

const [category, setCategory] = useState(
  () => location.state?.category || ''
);

useEffect(() => {
  setSearch(location.state?.search || '');
  setCategory(location.state?.category || '');
}, [location.state]);
  const [level, setLevel] = useState('');

  useEffect(() => {
    api.get('/courses').then(({ data }) => setCourses(data.courses)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    api.get('/me/favorites').then(({ data }) => setFavorites(new Set(data.favorites.map(f => f.course?._id).filter(Boolean))));
  }, [user]);

  const categories = useMemo(() => [...new Set(courses.map(c => c.category))], [courses]);
  const visible = courses.filter(course => {
    const haystack = `${course.title} ${course.description} ${course.tags?.join(' ')}`.toLowerCase();
    return haystack.includes(search.toLowerCase()) && (!category || course.category === category) && (!level || course.level === level);
  });

  const toggleFavorite = async (courseId) => {
    if (!user) return window.location.assign('/login');
    const next = new Set(favorites);
    if (next.has(courseId)) {
      await api.delete(`/me/favorites/${courseId}`);
      next.delete(courseId);
    } else {
      await api.post(`/me/favorites/${courseId}`);
      next.add(courseId);
    }
    setFavorites(next);
  };

  return (
    <section className="section-shell page-section">
      <div className="section-heading row-heading">
        <div><span className="eyebrow">Course catalog</span><h1>Choose what you want to learn next.</h1></div>
        <p></p>
      </div>
      <div className="filters-panel">
        <label className="search-field"><Search size={18} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses, tags or topics" /></label>
        <select value={category} onChange={e => setCategory(e.target.value)}><option value="">All categories</option>{categories.map(item => <option key={item}>{item}</option>)}</select>
        <select value={level} onChange={e => setLevel(e.target.value)}><option value="">All levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select>
      </div>
      {loading ? <div className="empty-state">Loading courses…</div> : visible.length ? (
        <div className="course-grid">{visible.map(course => <CourseCard key={course._id} course={course} favorite={favorites.has(course._id)} onFavorite={toggleFavorite} />)}</div>
      ) : <div className="empty-state">No courses match those filters.</div>}
    </section>
  );
}
