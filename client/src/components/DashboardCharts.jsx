
import { useMemo } from 'react';

const clamp = value =>
  Math.min(100, Math.max(0, Number(value) || 0));

export default function DashboardCharts({ enrollments = [] }) {
  const stats = useMemo(() => {
    const percentages = enrollments.map(item =>
      clamp(item.progress?.percent ?? item.progressPercent ?? 0)
    );

    const average = percentages.length
      ? Math.round(
          percentages.reduce((sum, value) => sum + value, 0) /
          percentages.length
        )
      : 0;

    return {
      average,
      completed: percentages.filter(value => value === 100).length,
      inProgress: percentages.filter(
        value => value > 0 && value < 100
      ).length,
      notStarted: percentages.filter(value => value === 0).length
    };
  }, [enrollments]);

  const distribution = [
    { label: 'Completed', value: stats.completed, color: '#117a50' },
    { label: 'In progress', value: stats.inProgress, color: '#0f62a8' },
    { label: 'Not started', value: stats.notStarted, color: '#cbd5e1' }
  ];

  return (
    <div className="dash-v2-charts">
      <article className="dash-v2-panel">
        <h3>Overall learning progress</h3>
        <p>Average completion across enrolled courses</p>

        <div
          className="dash-v2-ring"
          style={{ '--progress': `${stats.average}%` }}
          role="progressbar"
          aria-valuenow={stats.average}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Average course completion"
        >
          <div>
            <strong>{stats.average}%</strong>
            <span>Completed</span>
          </div>
        </div>

        <div className="dash-v2-chart-caption">
          Based on {enrollments.length} enrolled courses
        </div>
      </article>

      <article className="dash-v2-panel">
        <h3>Course completion overview</h3>
        <p>Your enrolled courses by progress status</p>

        <div className="dash-v2-distribution">
          {distribution.map(item => (
            <div className="dash-v2-distribution-row" key={item.label}>
              <div className="dash-v2-distribution-label">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
              <div className="dash-v2-track">
                <span
                  style={{
                    width: enrollments.length
                      ? `${(item.value / enrollments.length) * 100}%`
                      : '0%',
                    background: item.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
