import { ArrowRight, BookOpen, Clock3, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CourseCard({ course, favorite = false, onFavorite }) {
  const lessons = course.modules?.reduce((total, module) => total + module.lessons.length, 0) || course.lessonCount || 0;
  const minutes = course.modules?.reduce((total, module) => total + module.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0), 0) || 0;

  return (
    <article className="course-card">
      <div className="course-image-wrap">
        <img className="course-image" src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'} alt="" />
        {onFavorite && (
          <button className={favorite ? 'favorite-button active' : 'favorite-button'} onClick={() => onFavorite(course._id)} aria-label="Toggle favorite">
            <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
      <div className="course-card-body">
        <div className="course-meta-row">
          <span className="badge">{course.category}</span>
          <span className="level-text">{course.accessType==='paid'?`₹${course.priceInr} · Paid`:'Free'} · {course.level}</span>
        </div>
        <h3>{course.title}</h3>
        <p>{course.description}</p>
        <div className="course-stats">
          <span><BookOpen size={16} /> {lessons} lessons</span>
          <span><Clock3 size={16} /> {minutes || '—'} min</span>
        </div>
        <Link className="text-link" to={`/courses/${course.slug || course._id}`}>View course <ArrowRight size={16} /></Link>
      </div>
    </article>
  );
}
