
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  TrendingUp
} from 'lucide-react';

import DashboardCharts from './DashboardCharts';

const clamp = value =>
  Math.min(100, Math.max(0, Number(value) || 0));

export default function DashboardOverview({
  enrollments = [],
  certificates = []
}) {
  const completed = enrollments.filter(item =>
    clamp(item.progress?.percent ?? item.progressPercent) === 100
  ).length;

  const average = enrollments.length
    ? Math.round(
        enrollments.reduce(
          (sum, item) =>
            sum + clamp(item.progress?.percent ?? item.progressPercent),
          0
        ) / enrollments.length
      )
    : 0;

  const resume = enrollments.find(item => {
    const percent = clamp(
      item.progress?.percent ?? item.progressPercent
    );
    return item.course && percent < 100;
  });

  const cards = [
    {
      title: 'Enrolled courses',
      value: enrollments.length,
      icon: BookOpen
    },
    {
      title: 'Completed courses',
      value: completed,
      icon: CheckCircle2
    },
    {
      title: 'Certificates',
      value: certificates.length,
      icon: GraduationCap
    },
    {
      title: 'Average progress',
      value: `${average}%`,
      icon: TrendingUp
    }
  ];

  return (
    <section className="dash-v2-overview">
      <div className="dash-v2-heading">
        <div>
          <span className="eyebrow">Learning overview</span>
          <h2>Your progress at a glance</h2>
          <p>
            Track your learning progress and pick up
            where you left off.
          </p>
        </div>
      </div>

      <div className="dash-v2-stats">
        {cards.map(card => {
          const Icon = card.icon;

          return (
            <article className="dash-v2-stat" key={card.title}>
              <span className="dash-v2-stat-icon">
                <Icon size={22} />
              </span>
              <span className="dash-v2-stat-label">
                {card.title}
              </span>
              <strong>{card.value}</strong>
            </article>
          );
        })}
      </div>

      <DashboardCharts enrollments={enrollments} />

      <div className="dash-v2-resume">
        <div>
          <span className="eyebrow">Continue learning</span>
          <h3>
            {resume?.course?.title || 'Ready for your next course?'}
          </h3>
          <p>
            {resume
              ? `${clamp(
                  resume.progress?.percent ?? resume.progressPercent
                )}% complete. Continue working through your lessons.`
              : 'Explore the course catalog and start learning.'}
          </p>
        </div>

        {resume?.course?._id ? (
          <Link
            className="button primary"
            to={`/learn/${resume.course._id}`}
          >
            Resume course <ArrowRight size={17} />
          </Link>
        ) : (
          <Link className="button primary" to="/courses">
            Browse courses <ArrowRight size={17} />
          </Link>
        )}
      </div>
    </section>
  );
}
