import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useApp } from '../lib/store.jsx';
import { Spinner, ProgressBar, Empty, Section } from '../components/common.jsx';
import OpportunityCard from '../components/OpportunityCard.jsx';
import CourseCard from '../components/CourseCard.jsx';
import Icon from '../components/Icon.jsx';
import { formatDate, deadlineLabel, courseIconName } from '../lib/ui.js';

const toneClass = {
  red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
  green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

function StatCard({ icon, value, label, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
    rose: 'bg-rose-50 text-rose-500 dark:bg-rose-900/30 dark:text-rose-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  };
  return (
    <div className="card p-5">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon name={icon} size={20} />
      </span>
      <div className="mt-3 font-display text-3xl font-extrabold nums">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}

function SectionTitle({ icon, children }) {
  return (
    <span className="flex items-center gap-2">
      <Icon name={icon} size={20} className="text-brand-500" /> {children}
    </span>
  );
}

export default function Dashboard() {
  const { user } = useApp();
  const [data, setData] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());

  const load = () =>
    api.get('/dashboard').then((d) => {
      setData(d);
      setSavedIds(new Set((d.saved || []).map((s) => s.id)));
    });

  useEffect(() => {
    load();
  }, []);

  const unsave = async (opp) => {
    const next = new Set(savedIds);
    next.delete(opp.id);
    setSavedIds(next);
    await api.del(`/saved/${opp.id}`).catch(() => {});
    load();
  };

  if (!data) return <Spinner />;

  const { stats, saved, courses, deadlines, certificates, recommendedOpportunities, recommendedCourses } = data;

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Привет, {user.name?.split(' ')[0]}</h1>
          <p className="mt-1 text-slate-500">Твой прогресс, избранное и рекомендации.</p>
        </div>
        <Link to="/onboarding" className="btn-outline">
          <Icon name="settings" size={16} /> Настроить интересы
        </Link>
      </div>

      {/* stats */}
      <div className="stagger grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon="heart" tone="rose" value={stats.savedCount} label="В избранном" />
        <StatCard icon="graduation-cap" tone="brand" value={stats.enrolledCount} label="Курсов начато" />
        <StatCard icon="check-circle" tone="emerald" value={stats.lessonsCompleted} label="Уроков пройдено" />
        <StatCard icon="trophy" tone="amber" value={stats.completedCourses} label="Курсов завершено" />
      </div>

      {/* deadlines */}
      <Section title={<SectionTitle icon="calendar">Приближающиеся дедлайны</SectionTitle>} subtitle="По сохранённым возможностям">
        {deadlines.length === 0 ? (
          <Empty icon="calendar" title="Дедлайнов нет" hint="Сохрани возможности — и здесь появится календарь дедлайнов.">
            <Link to="/opportunities" className="btn-primary mt-2">
              К каталогу
            </Link>
          </Empty>
        ) : (
          <div className="card divide-y divide-slate-100 dark:divide-slate-800">
            {deadlines.map((d) => {
              const dl = deadlineLabel(d.deadline);
              return (
                <Link
                  key={d.id}
                  to={`/opportunities/${d.id}`}
                  className="flex items-center justify-between gap-4 p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                      <span className="font-display text-lg font-extrabold leading-none">{d.daysLeft}</span>
                      <span className="text-[10px]">дн.</span>
                    </div>
                    <div>
                      <div className="font-semibold">{d.title}</div>
                      <div className="text-sm text-slate-500">{formatDate(d.deadline)}</div>
                    </div>
                  </div>
                  <span className={`chip ${toneClass[dl.tone]}`}>{dl.text}</span>
                </Link>
              );
            })}
          </div>
        )}
      </Section>

      {/* enrolled courses */}
      <Section
        title={<SectionTitle icon="graduation-cap">Мои курсы</SectionTitle>}
        action={
          <Link to="/courses" className="inline-flex items-center gap-0.5 text-sm font-semibold text-brand-600 hover:gap-1.5">
            Все курсы <Icon name="arrow-right" size={16} />
          </Link>
        }
      >
        {courses.length === 0 ? (
          <Empty icon="book-open" title="Ты ещё не записан на курсы" hint="Выбери курс и начни учиться в своём темпе.">
            <Link to="/courses" className="btn-primary mt-2">
              Выбрать курс
            </Link>
          </Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {courses.map((c) => (
              <Link
                key={c.id}
                to={`/courses/${c.id}`}
                className="card flex items-center gap-4 p-4 transition hover:shadow-card-hover"
              >
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${c.color}22`, color: c.color }}
                >
                  <Icon name={courseIconName(c)} size={26} strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{c.title}</div>
                  <div className="mb-1.5 text-xs text-slate-500">
                    {c.completedLessons}/{c.lessonCount} уроков · {c.progressPercent}%
                  </div>
                  <ProgressBar percent={c.progressPercent} color={c.color} />
                </div>
                {c.completed && <Icon name="trophy" size={22} className="text-amber-500" />}
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* certificates */}
      {certificates.length > 0 && (
        <Section title={<SectionTitle icon="award">Сертификаты</SectionTitle>} subtitle="За полностью пройденные курсы">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((c) => (
              <div
                key={c.courseId}
                className="card border-2 border-dashed border-amber-300 bg-amber-50 p-5 text-center dark:border-amber-700 dark:bg-amber-900/20"
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
                  <Icon name="award" size={26} />
                </span>
                <div className="mt-2 text-xs uppercase tracking-wide text-amber-600">Сертификат Mentoria</div>
                <div className="mt-1 font-display font-bold">{c.title}</div>
                <div className="mt-1 text-sm text-slate-500">{c.student}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* saved */}
      <Section title={<SectionTitle icon="bookmark">Сохранённые возможности</SectionTitle>}>
        {saved.length === 0 ? (
          <Empty icon="bookmark" title="Пока пусто" hint="Нажми на иконку сердца у возможности, чтобы сохранить её сюда.">
            <Link to="/opportunities" className="btn-primary mt-2">
              К каталогу
            </Link>
          </Empty>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((o) => (
              <OpportunityCard key={o.id} opp={o} saved onToggleSave={unsave} />
            ))}
          </div>
        )}
      </Section>

      {/* recommendations */}
      {(recommendedOpportunities.length > 0 || recommendedCourses.length > 0) && (
        <Section title={<SectionTitle icon="sparkles">Рекомендации для тебя</SectionTitle>} subtitle="На основе твоих интересов и целей">
          {recommendedOpportunities.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedOpportunities.map((o) => (
                <OpportunityCard key={o.id} opp={o} saved={savedIds.has(o.id)} onToggleSave={() => {}} />
              ))}
            </div>
          )}
          {recommendedCourses.length > 0 && (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedCourses.map((c) => (
                <CourseCard key={c.id} course={{ ...c, lessonCount: 0, enrolled: false, progressPercent: 0 }} />
              ))}
            </div>
          )}
        </Section>
      )}
    </div>
  );
}
