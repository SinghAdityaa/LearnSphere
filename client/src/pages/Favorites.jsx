import { useEffect, useState } from 'react';
import CourseCard from '../components/CourseCard';
import api from '../services/api';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () => api.get('/me/favorites').then(({ data }) => setFavorites(data.favorites)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const remove = async (courseId) => { await api.delete(`/me/favorites/${courseId}`); await load(); };

  return <section className="section-shell page-section"><div className="section-heading"><span className="eyebrow">Saved courses</span><h1>Your favorites</h1><p>Keep interesting courses here until you are ready to enroll.</p></div>{loading ? <div className="empty-state">Loading favorites…</div> : favorites.length ? <div className="course-grid">{favorites.map(item => item.course && <CourseCard key={item._id} course={item.course} favorite onFavorite={remove} />)}</div> : <div className="empty-state">You have not saved any courses yet.</div>}</section>;
}
