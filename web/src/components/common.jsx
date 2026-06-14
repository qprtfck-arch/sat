import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../lib/store.jsx';
import Icon from './Icon.jsx';

export function Spinner({ label = 'Загрузка…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-20 text-slate-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      {label}
    </div>
  );
}

export function ProgressBar({ percent = 0, color = '#6366f1' }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function Empty({ icon = 'compass', title, hint, children }) {
  return (
    <div className="card flex flex-col items-center gap-3 p-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-900/40 dark:text-brand-300">
        <Icon name={icon} size={26} />
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
      {hint && <p className="max-w-md text-sm leading-relaxed text-slate-500">{hint}</p>}
      {children}
    </div>
  );
}

export function Section({ title, action, children, subtitle }) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useApp();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}
