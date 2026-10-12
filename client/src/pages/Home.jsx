import { ArrowRight, BookOpenCheck, CheckCircle2, Gauge, GraduationCap, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      <section className="hero section-shell">
        <div className="hero-copy">
          <span className="eyebrow">Full-stack learning experience</span>
          <h1>Learn practical skills, track your progress, and finish what you start.</h1>
          <p>Explore structured courses, study lesson by lesson, take assessments, and earn downloadable certificates from one clean dashboard.</p>
          <div className="hero-actions">
            <Link className="button primary" to="/courses">Explore courses <ArrowRight size={18} /></Link>
            <Link className="button secondary" to="/login">Student sign in</Link>
          </div>
          <div className="hero-points">
            <span><CheckCircle2 size={18} /> Persistent learning progress</span>
            <span><CheckCircle2 size={18} /> Secure role-based access</span>
            <span><CheckCircle2 size={18} /> Quizzes and certificates</span>
          </div>
        </div>
        <div className="hero-panel">
          <div className="hero-panel-card featured">
            <span className="icon-box"><GraduationCap /></span>
            <div>
              <small>Student experience</small>
              <strong>Courses, progress, quizzes, certificates</strong>
            </div>
          </div>
          <div className="hero-panel-grid">
            <div className="mini-card"><BookOpenCheck /><strong>Structured lessons</strong><span>Modules, video and resources</span></div>
            <div className="mini-card"><Gauge /><strong>Progress tracking</strong><span>Resume where you stopped</span></div>
            <div className="mini-card"><ShieldCheck /><strong>Admin tools</strong><span>Publish and manage courses</span></div>
          </div>
        </div>
      </section>

      <section className="section-shell feature-section">
        <div className="section-heading narrow">
          <span className="eyebrow">Built for real learning</span>
          <h2>Everything important stays connected to your account.</h2>
          <p>No browser-only progress. Enrollment, completed lessons, quiz attempts, favorites and certificates are stored by the backend.</p>
        </div>
        <div className="feature-grid">
          <article><span>01</span><h3>Discover</h3><p>Search courses by topic, category and level, then review the full syllabus before enrolling.</p></article>
          <article><span>02</span><h3>Learn</h3><p>Watch lessons, open resources, mark work complete and continue from your latest lesson.</p></article>
          <article><span>03</span><h3>Prove</h3><p>Complete server-scored assessments and download a certificate after passing.</p></article>
        </div>
      </section>
    </>
  );
}
