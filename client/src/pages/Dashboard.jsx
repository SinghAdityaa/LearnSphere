import { Award, BookOpen, Play, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ enrollments: [], certificates: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/me/dashboard').then(({ data }) => setData(data)).catch(err => setError(err.response?.data?.message || 'Could not load dashboard.')).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="page-center">Loading dashboard…</div>;
  if (error) return <div className="page-center" role="alert">{error} Please refresh to try again.</div>;
  const inProgress = data.enrollments.filter(item => item.progress.percent < 100).length;

  return (
    <section className="section-shell page-section">
      <div className="dashboard-welcome"><div><span className="eyebrow">Student dashboard</span><h1>Welcome, {user.name}.</h1><p>Keep your current courses moving and pick up from your saved progress.</p></div><Link className="button primary" to="/courses">Browse courses</Link></div>
      <div className="summary-grid">
        <article><BookOpen /><span>Enrolled courses</span><strong>{data.enrollments.length}</strong></article>
        <article><TrendingUp /><span>In progress</span><strong>{inProgress}</strong></article>
        <article><Award /><span>Certificates</span><strong>{data.certificates.length}</strong></article>
      </div>
      <div className="dashboard-section-head"><div><span className="eyebrow">Continue learning</span><h2>Your courses</h2></div></div>
      {data.enrollments.length ? <div className="learning-list">
        {data.enrollments.map(({ course, progress }) => (
          <article key={course._id} className="learning-row">
            <img src={course.thumbnail} alt="" />
            <div className="learning-row-main"><span className="badge">{course.category}</span><h3>{course.title}</h3><div className="progress-line"><span style={{ width: `${progress.percent || 0}%` }} /></div><small>{progress.percent || 0}% complete</small></div>
            <Link className="button secondary" to={`/learn/${course._id}`}><Play size={17} /> Continue</Link>
          </article>
        ))}
      </div> : <div className="empty-state">You have not enrolled in a course yet. <Link to="/courses">Explore the catalog</Link>.</div>}
      <div className="dashboard-section-head"><div><span className="eyebrow">Achievements</span><h2>Certificates</h2></div></div>
      {data.certificates.length ? <div className="certificate-grid">{data.certificates.map(item => <Link key={item._id} to={`/certificate/${item._id}`} className="certificate-mini"><Award /><div><strong>{item.course.title}</strong><span>Issued {new Date(item.issuedAt).toLocaleDateString()}</span></div></Link>)}</div> : <div className="empty-state">Pass a course assessment to earn your first certificate.</div>}
    </section>
  );
}
