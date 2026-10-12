import { Award, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function Certificate() {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get(`/certificates/${id}`).then(({ data }) => setCertificate(data.certificate)).catch(err => setError(err.response?.data?.message || 'Certificate not found')); }, [id]);

  const download = async () => {
    const response = await api.get(`/certificates/${id}/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(response.data);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `learnsphere-certificate-${certificate.certificateId}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (error) return <div className="page-center">{error}</div>;
  if (!certificate) return <div className="page-center">Loading certificate…</div>;

  return <section className="section-shell certificate-page"><div className="certificate-sheet"><Award size={54} /><span className="eyebrow">LearnSphere</span><h1>Certificate of Completion</h1><p>This certifies that</p><h2>{certificate.user.name}</h2><p>has successfully completed</p><h3>{certificate.course.title}</h3><div className="certificate-meta"><span>Certificate ID<br /><strong>{certificate.certificateId}</strong></span><span>Issued<br /><strong>{new Date(certificate.issuedAt).toLocaleDateString()}</strong></span></div></div><button className="button primary" onClick={download}><Download size={18} /> Download PDF</button></section>;
}
