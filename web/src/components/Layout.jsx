import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../lib/store.jsx';
import { LANGS } from '../lib/i18n.js';
import Icon from './Icon.jsx';

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display font-extrabold tracking-tight">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
        M
      </span>
      <span className="text-lg">
        Mentoria<span className="text-brand-600"> Hub</span>
      </span>
    </Link>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useApp();
  const dark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      className="icon-btn"
      title={dark ? 'Светлая тема' : 'Тёмная тема'}
      aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'}
    >
      <Icon name={dark ? 'sun' : 'moon'} />
    </button>
  );
}

function LangToggle() {
  const { lang, setLang } = useApp();
  return (
    <div
      className="flex overflow-hidden rounded-lg border border-slate-200 text-xs dark:border-slate-700"
      role="group"
      aria-label="Выбор языка"
    >
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          className={`px-2.5 py-1.5 font-semibold transition ${
            lang === l.code
              ? 'bg-brand-600 text-white'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

const NAV_ICONS = {
  '/opportunities': 'compass',
  '/courses': 'book-open',
  '/assistant': 'sparkles',
  '/dashboard': 'bar-chart',
  '/rewards': 'gift',
  '/teach': 'graduation-cap',
  '/admin': 'settings',
};

function CoinsBadge({ coins }) {
  return (
    <Link
      to="/rewards"
      className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-2.5 py-1.5 text-sm font-bold text-amber-600 transition hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300"
      title="Mentoria Coins"
    >
      <Icon name="coins" size={16} /> {coins ?? 0}
    </Link>
  );
}

export default function Layout() {
  const { user, logout, t } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const navItems = [
    { to: '/opportunities', label: t('nav.opportunities') },
    { to: '/courses', label: t('nav.courses') },
    { to: '/assistant', label: t('nav.assistant') },
  ];
  if (user) navItems.push({ to: '/dashboard', label: t('nav.dashboard') });
  if (user) navItems.push({ to: '/rewards', label: t('nav.rewards') });
  if (user?.role === 'teacher' || user?.role === 'admin')
    navItems.push({ to: '/teach', label: t('nav.teach') });
  if (user?.role === 'admin') navItems.push({ to: '/admin', label: t('nav.admin') });

  const linkClass = ({ isActive }) =>
    `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
    }`;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Logo />

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((n) => (
              <NavLink key={n.to} to={n.to} className={linkClass}>
                <Icon name={NAV_ICONS[n.to]} size={16} />
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <LangToggle />
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2">
                <CoinsBadge coins={user.coins} />
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-2.5 py-1.5 text-sm dark:border-slate-700"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                  <span className="max-w-[120px] truncate font-medium">{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="icon-btn" aria-label={t('nav.logout')} title={t('nav.logout')}>
                  <Icon name="log-out" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn-primary">
                  {t('nav.signup')}
                </Link>
              </>
            )}
          </div>

          <button
            className="icon-btn md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Меню"
            aria-expanded={open}
          >
            <Icon name={open ? 'x' : 'menu'} size={22} />
          </button>
        </div>

        {open && (
          <div className="border-t border-slate-200 px-4 py-3 md:hidden dark:border-slate-800">
            <div className="flex flex-col gap-1">
              {navItems.map((n) => (
                <NavLink key={n.to} to={n.to} className={linkClass} onClick={() => setOpen(false)}>
                  <Icon name={NAV_ICONS[n.to]} size={16} />
                  {n.label}
                </NavLink>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <LangToggle />
              <ThemeToggle />
            </div>
            <div className="mt-3 flex gap-2">
              {user ? (
                <button onClick={handleLogout} className="btn-outline flex-1">
                  <Icon name="log-out" size={16} />
                  {t('nav.logout')}
                </button>
              ) : (
                <>
                  <Link to="/login" className="btn-outline flex-1" onClick={() => setOpen(false)}>
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" className="btn-primary flex-1" onClick={() => setOpen(false)}>
                    {t('nav.signup')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 py-8 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-brand-600 text-xs font-bold text-white">
              M
            </span>
            Mentoria Hub — MVP для хакатона
          </div>
          <div>Возможности + асинхронные курсы в одном месте</div>
        </div>
      </footer>
    </div>
  );
}
