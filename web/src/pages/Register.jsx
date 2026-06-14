import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../lib/store.jsx';
import Icon from '../components/Icon.jsx';

export default function Register() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form);
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2 font-display font-extrabold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            M
          </span>
          <span className="text-xl">
            Mentoria<span className="text-brand-600"> Hub</span>
          </span>
        </Link>

        <div className="card p-7">
          <h1 className="text-xl font-bold">Создай профиль</h1>
          <p className="mt-1 text-sm text-slate-500">
            Бесплатно. Доступ к возможностям и курсам сразу после регистрации.
          </p>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">
              <Icon name="alert-circle" size={16} /> {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label className="label" htmlFor="name">Имя</label>
              <input id="name" className="input" autoComplete="name" value={form.name} onChange={set('name')} placeholder="Как тебя зовут?" required />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" className="input" type="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="label" htmlFor="password">Пароль</label>
              <div className="relative">
                <input
                  id="password"
                  className="input pr-11"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Минимум 6 символов"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showPw ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  <Icon name={showPw ? 'eye-off' : 'eye'} size={18} />
                </button>
              </div>
            </div>
            <button className="btn-primary w-full py-3" disabled={busy}>
              {busy ? 'Создаём…' : 'Зарегистрироваться'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:underline">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
