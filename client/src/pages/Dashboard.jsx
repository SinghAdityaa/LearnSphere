
import { Award, ArrowRight, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DashboardOverview from '../components/DashboardOverview';

const getProgress = progress => {
  const percent = Number(progress?.percent) || 0;
  return Math.min(100, Math.max(0, percent));
};

export default function Dashboard() {
  const { user } = useAuth();

  const [data, setData] = useState({
    enrollments: [],
    certificates: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const response = await api.get('/me/dashboard');

        if (!active) return;

        setData({
          enrollments: Array.isArray(response.data?.enrollments)
            ? response.data.enrollments
            : [],
          certificates: Array.isArray(response.data?.certificates)
            ? response.data.certificates
            : []
        });
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
          'Could not load your dashboard.'
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="page-center" role="status">
        Loading your dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-center stack" role="alert">
        <h2>Dashboard unavailable</h2>
        <p>{error}</p>
        <button
          className="button primary"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  const { enrollments, certificates } = data;

  return (
    <section className="section-shell page-section dash-v2-page">

      {/* WELCOME */}

      <div className="dashboard-welcome">
        <div>
          <span className="eyebrow">Student dashboard</span>

          <h1>
            Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}.
          </h1>

          <p>
            Your learning progress, enrolled courses and
            certificates are all in one place.
          </p>
        </div>

        <Link className="button primary" to="/courses">
          Explore courses <ArrowRight size={17} />
        </Link>
      </div>

      {/* ADVANCED DASHBOARD */}

      <DashboardOverview
        enrollments={enrollments}
        certificates={certificates}
      />

      {/* ENROLLED COURSES */}

      <div className="dashboard-section-head dash-v2-section-heading">
        <div>
          <span className="eyebrow">Your learning</span>
          <h2>Enrolled courses</h2>
          <p>
            Continue your lessons and monitor
            your progress in each course.
          </p>
        </div>

        <Link className="text-link" to="/courses">
          Browse catalog <ArrowRight size={17} />
        </Link>
      </div>

      {enrollments.length ? (
        <div className="learning-list">
          {enrollments.map((item, index) => {
            const course = item.course;

            if (!course) return null;

            const percent = getProgress(item.progress);

            return (
              <article
                key={item._id || course._id || index}
                className="learning-row"
              >
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <div className="dash-v2-course-placeholder">
                    <Play size={26} />
                  </div>
                )}

                <div className="learning-row-main">
                  <span className="badge">
                    {course.category || 'Course'}
                  </span>

                  <h3>{course.title}</h3>

                  <div
                    className="progress-line"
                    role="progressbar"
                    aria-label={`${course.title} completion`}
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span style={{ width: `${percent}%` }} />
                  </div>

                  <small>
                    {percent === 100
                      ? 'Course completed'
                      : `${percent}% complete`}
                  </small>
                </div>

                <Link
                  className="button secondary"
                  to={`/learn/${course._id}`}
                >
                  <Play size={17} />
                  {percent === 100 ? 'Review' : 'Continue'}
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state dash-v2-empty">
          <h3>No enrolled courses yet</h3>
          <p>
            Explore the catalog and enroll in a course
            to start tracking your learning.
          </p>
          <Link className="button primary" to="/courses">
            Explore courses <ArrowRight size={17} />
          </Link>
        </div>
      )}

      {/* CERTIFICATES */}

      <div className="dashboard-section-head dash-v2-section-heading">
        <div>
          <span className="eyebrow">Achievements</span>
          <h2>Your certificates</h2>
          <p>
            View certificates you've earned
            by completing course assessments.
          </p>
        </div>
      </div>

      {certificates.length ? (
        <div className="certificate-grid">
          {certificates.map(item => (
            <Link
              key={item._id}
              to={`/certificate/${item._id}`}
              className="certificate-mini"
            >
              <Award size={28} />

              <div>
                <strong>
                  {item.course?.title || 'Course certificate'}
                </strong>

                <span>
                  {item.issuedAt
                    ? `Issued ${new Date(
                        item.issuedAt
                      ).toLocaleDateString()}`
                    : 'Certificate earned'}
                </span>
              </div>

              <ArrowRight
                size={17}
                className="dash-v2-certificate-arrow"
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state dash-v2-empty">
          <Award size={30} />
          <h3>No certificates yet</h3>
          <p>
            Complete the required assessments
            to earn your first certificate.
          </p>
        </div>
      )}

    </section>
  );
}
