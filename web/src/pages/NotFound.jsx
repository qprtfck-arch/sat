import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-28 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-900/40 dark:text-brand-300">
        <Icon name="compass" size={32} />
      </span>
      <h1 className="mt-4 text-3xl font-extrabold">Страница не найдена</h1>
      <p className="mt-2 text-slate-500">Похоже, такой страницы нет. Вернись на главную и продолжи путь.</p>
      <Link to="/" className="btn-primary mt-6">
        На главную
      </Link>
    </div>
  );
}
