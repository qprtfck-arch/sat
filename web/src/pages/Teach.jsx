import { useApp } from '../lib/store.jsx';
import CourseManager from '../components/CourseManager.jsx';
import Icon from '../components/Icon.jsx';

export default function Teach() {
  const { user } = useApp();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
          <Icon name="graduation-cap" size={24} />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Портал преподавателя</h1>
          <p className="mt-1 text-slate-500">
            Создавай курсы и уроки Mentoria. Здесь — только твои курсы{user?.role === 'admin' ? ' (как админ видишь все)' : ''}.
          </p>
        </div>
      </div>

      <CourseManager scope={user?.role === 'admin' ? 'admin' : 'mine'} />
    </div>
  );
}
