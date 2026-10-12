import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Students() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ students: [], total: 0, pages: 1 });
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get('/admin/students', { params: { search: query, page, limit: 10 } })
      .then(({ data }) => { if (active) { setData(data); setError(''); } })
      .catch(err => { if (active) setError(err.response?.data?.message || 'Unable to load students'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query, page]);
  useEffect(() => {
    if (!selected) return;
    let active = true;
    setDetail(null);
    api.get(`/admin/students/${selected}`)
      .then(({ data }) => { if (active) { setDetail(data); setError(''); } })
      .catch(err => { if (active) setError(err.response?.data?.message || 'Unable to load student details'); });
    return () => { active = false; };
  }, [selected]);
  return <section className="section-shell page-section student-admin">
    <div className="section-heading"><span className="eyebrow">Admin workspace</span><h1>Students</h1><p>View registered students, their enrollments, progress and certificates. Only administrators can access this page.</p></div>
    <form className="student-search" onSubmit={e => { e.preventDefault(); setPage(1); setQuery(search.trim()); }}>
      <label htmlFor="student-search">Search by name or email</label>
      <div className="student-search-controls"><input id="student-search" value={search} maxLength={100} onChange={e => setSearch(e.target.value)} placeholder="Find a student" /><button className="button primary" type="submit">Search</button></div>
    </form>
    {error && <p role="alert" className="alert error">{error}</p>}
    <div className="panel student-directory"><h2>Registered students <small>({data.total})</small></h2>
      {loading ? <p>Loading students...</p> : data.students.length === 0 ? <p>No students found.</p> : <div className="student-table-wrap"><table className="student-table"><thead><tr><th>Student</th><th>Joined</th><th>Enrolled</th><th>Certificates</th><th></th></tr></thead><tbody>
        {data.students.map(student => <tr key={student._id}><td><strong>{student.name}</strong><span>{student.email}</span></td><td>{new Date(student.createdAt).toLocaleDateString()}</td><td>{student.enrollmentCount}</td><td>{student.certificateCount}</td><td><button className="button secondary small" onClick={() => setSelected(student._id)}>View</button></td></tr>)}
      </tbody></table></div>}
      <div className="student-pagination"><button className="button secondary small" disabled={page === 1} onClick={() => setPage(n => n - 1)}>Previous</button><span>Page {page} of {data.pages}</span><button className="button secondary small" disabled={page >= data.pages} onClick={() => setPage(n => n + 1)}>Next</button></div>
    </div>
    {selected && <div className="panel student-detail"><div className="editor-top"><h2>Student details</h2><button className="button secondary small" onClick={() => { setSelected(null); setDetail(null); }}>Close</button></div>
      {!detail ? <p>Loading details...</p> : <><p><strong>{detail.student.name}</strong> ({detail.student.email})</p><h3>Enrolled courses</h3>
      {detail.enrollments.length === 0 ? <p>No enrollments yet.</p> : <div className="student-enrollments">{detail.enrollments.map(e => <div key={e.id}><strong>{e.course?.title || 'Removed course'}</strong><span>{e.progressPercent}% complete</span></div>)}</div>}
      <h3>Certificates</h3>{detail.certificates.length === 0 ? <p>No certificates yet.</p> : detail.certificates.map(c => <p key={c.certificateId}>{c.courseTitle} · {new Date(c.issuedAt).toLocaleDateString()}</p>)}
      </>}
    </div>}
  </section>;
}
