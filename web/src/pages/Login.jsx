import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../lib/store.jsx';
import Icon from '../components/Icon.jsx';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(email, password);
      const dest = location.state?.from || (user.onboarded ? '/dashboard' : '/onboarding');
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const quick = (em, pw) => {
    setEmail(em);
    setPassword(pw);
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
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
          <h1 className="text-xl font-bold">С возвращением</h1>
          <p className="mt-1 text-sm text-slate-500">Войди, чтобы продолжить обучение.</p>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">
              <Icon name="alert-circle" size={16} /> {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Пароль</label>
              <div className="relative">
                <input
                  id="password"
                  className="input pr-11"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
              {busy ? 'Входим…' : 'Войти'}
            </button>
          </form>

          <div className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800/50">
            <div className="mb-2 font-semibold text-slate-600 dark:text-slate-300">
              Демо-аккаунты (клик — подставит):
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => quick('student@mentoria.io', 'student123')}
                className="flex items-center gap-2 text-left hover:text-brand-600"
              >
                <Icon name="user" size={15} /> Ученик — student@mentoria.io / student123
              </button>
              <button
                type="button"
                onClick={() => quick('admin@mentoria.io', 'admin123')}
                className="flex items-center gap-2 text-left hover:text-brand-600"
              >
                <Icon name="settings" size={15} /> Админ — admin@mentoria.io / admin123
              </button>
            </div>
          </div>

          <p className="mt-5 text-center text-sm text-slate-500">
            Нет аккаунта?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
