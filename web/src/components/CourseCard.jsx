import { Link } from 'react-router-dom';
import { ProgressBar } from './common.jsx';
import Icon from './Icon.jsx';
import { directionRu, courseIconName } from '../lib/ui.js';

const levelRu = { Beginner: 'Начальный', Intermediate: 'Средний', Advanced: 'Продвинутый' };

export default function CourseCard({ course }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="card group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div
        className="flex h-28 items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${course.color}1f, ${course.color}4d)` }}
      >
        <span
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70 shadow-sm backdrop-blur dark:bg-slate-900/60"
          style={{ color: course.color }}
        >
          <Icon name={courseIconName(course)} size={28} strokeWidth={2} />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap gap-1.5 text-xs">
          <span className="badge">{levelRu[course.level] || course.level}</span>
          {course.direction && (
            <span className="chip bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {directionRu(course.direction)}
            </span>
          )}
        </div>
        <h3 className="font-display text-base font-semibold leading-snug group-hover:text-brand-600">
          {course.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500">{course.description}</p>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Icon name="layers" size={13} /> {course.lessonCount} уроков
            </span>
            {course.enrolled ? (
              <span className="font-semibold text-brand-600">{course.progressPercent}%</span>
            ) : (
              <span>Не начат</span>
            )}
          </div>
          {course.enrolled && <ProgressBar percent={course.progressPercent} color={course.color} />}
        </div>
      </div>
    </Link>
  );
}
