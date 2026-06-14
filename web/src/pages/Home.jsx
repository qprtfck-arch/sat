import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useApp } from '../lib/store.jsx';
import { api } from '../lib/api.js';
import OpportunityCard from '../components/OpportunityCard.jsx';
import CourseCard from '../components/CourseCard.jsx';
import Icon from '../components/Icon.jsx';

const features = [
  {
    icon: 'compass',
    title: 'Каталог возможностей',
    text: 'Конкурсы, олимпиады, стипендии, стажировки и летние школы — с фильтрами по направлению, классу и дедлайну.',
  },
  {
    icon: 'graduation-cap',
    title: 'Асинхронные курсы',
    text: 'Учись когда удобно: уроки, материалы, мини-тесты и прогресс-бар. Без привязки к живым занятиям.',
  },
  {
    icon: 'sparkles',
    title: 'AI-рекомендации',
    text: 'Платформа подбирает возможности и курсы под твои интересы, предметы и цели.',
  },
  {
    icon: 'bar-chart',
    title: 'Личный кабинет',
    text: 'Избранное, прогресс по курсам, приближающиеся дедлайны и сертификаты — всё в одном месте.',
  },
];

const steps = [
  { n: 1, title: 'Создай профиль', text: 'Регистрация за минуту и быстрый онбординг.' },
  { n: 2, title: 'Выбери интересы', text: 'Класс, направления, предметы и цели.' },
  { n: 3, title: 'Получи подборку', text: 'Рекомендованные возможности и курсы.' },
  { n: 4, title: 'Учись и расти', text: 'Сохраняй, отслеживай дедлайны, проходи курсы.' },
];

export default function Home() {
  const { user, t } = useApp();
  const [opps, setOpps] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get('/opportunities?sort=deadline').then((d) => setOpps((d.items || []).slice(0, 3))).catch(() => {});
    api.get('/courses').then((d) => setCourses((d.items || []).slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div>
      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-white to-transparent dark:from-brand-950/40 dark:via-slate-950" />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
          <span className="badge mb-5 inline-flex animate-fade-in">
            <Icon name="sparkles" size={14} /> {t('hero.tag')}
          </span>
          <h1 className="mx-auto max-w-3xl animate-fade-up text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            {t('hero.title')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl animate-fade-up text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            {t('hero.subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/opportunities" className="btn-primary px-5 py-3 text-base">
              <Icon name="search" size={18} /> {t('hero.cta1')}
            </Link>
            <Link to="/courses" className="btn-outline px-5 py-3 text-base">
              <Icon name="graduation-cap" size={18} /> {t('hero.cta2')}
            </Link>
            {!user && (
              <Link to="/register" className="btn-ghost px-5 py-3 text-base">
                {t('hero.cta3')} <Icon name="arrow-right" size={18} />
              </Link>
            )}
          </div>

          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-4">
            {[
              ['12+', 'возможностей'],
              ['3', 'курса с уроками'],
              ['100%', 'асинхронно'],
            ].map(([num, label]) => (
              <div key={label} className="card p-4">
                <div className="font-display text-2xl font-extrabold text-brand-600">{num}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* features */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                <Icon name={f.icon} size={24} />
              </span>
              <h3 className="font-display font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-center text-2xl font-bold tracking-tight">Как это работает</h2>
        <div className="stagger mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="card relative p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 font-display text-lg font-bold text-white">
                {s.n}
              </div>
              <h3 className="mt-3 font-display font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* featured opportunities */}
      {opps.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Скоро дедлайн</h2>
            <Link to="/opportunities" className="inline-flex items-center gap-0.5 text-sm font-semibold text-brand-600 hover:gap-1.5">
              Все возможности <Icon name="arrow-right" size={16} />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {opps.map((o) => (
              <OpportunityCard key={o.id} opp={o} saved={false} onToggleSave={() => {}} />
            ))}
          </div>
        </section>
      )}

      {/* featured courses */}
      {courses.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Популярные курсы</h2>
            <Link to="/courses" className="inline-flex items-center gap-0.5 text-sm font-semibold text-brand-600 hover:gap-1.5">
              Все курсы <Icon name="arrow-right" size={16} />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="card relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-700 p-10 text-center text-white">
          <h2 className="text-3xl font-extrabold">Готов начать?</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Создай профиль, получи персональную подборку и начни учиться уже сегодня.
          </p>
          <Link
            to={user ? '/dashboard' : '/register'}
            className="btn mt-6 bg-white px-6 py-3 text-base text-brand-700 hover:bg-brand-50"
          >
            {user ? 'В личный кабинет' : 'Присоединиться к Mentoria'} <Icon name="arrow-right" size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
