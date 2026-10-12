import { Link } from 'react-router-dom';

export default function Footer() {
  return <footer className="site-footer"><div className="section-shell footer-inner"><div><strong>LearnSphere</strong><span>Full-stack learning platform starter</span></div><nav><Link to="/courses">Courses</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></nav></div></footer>;
}
