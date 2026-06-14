import { useState } from 'react';
import { api } from '../lib/api.js';
import { useApp } from '../lib/store.jsx';
import OpportunityCard from '../components/OpportunityCard.jsx';
import CourseCard from '../components/CourseCard.jsx';
import Icon from '../components/Icon.jsx';

const suggestions = [
  'Бизнес-конкурсы и стартапы',
  'Олимпиады по математике',
  'Подготовка к IELTS',
  'Программирование и AI',
  'Стипендии для поступления',
];

export default function Assistant() {
  const { user } = useApp();
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [thread, setThread] = useState([
    {
      role: 'bot',
      text:
        'Привет! Я AI-ассистент Mentoria. Опиши, что тебе интересно — направление, предмет или цель, — и я подберу возможности и курсы.',
    },
  ]);

  const ask = async (text) => {
    const q = (text ?? query).trim();
    if (!q || busy) return;
    setThread((t) => [...t, { role: 'user', text: q }]);
    setQuery('');
    setBusy(true);
    try {
      const res = await api.post('/assistant', { query: q });
      setThread((t) => [
        ...t,
        { role: 'bot', text: res.reply, opportunities: res.opportunities, courses: res.courses },
      ]);
    } catch (e) {
      setThread((t) => [...t, { role: 'bot', text: 'Упс, что-то пошло не так. Попробуй ещё раз.' }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
          <Icon name="bot" size={28} />
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">AI-ассистент Mentoria</h1>
        <p className="mt-1 text-slate-500">
          Персональные рекомендации возможностей и курсов{user ? '' : ' (войди для учёта профиля)'}.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => ask(s)}
            className="chip border border-slate-300 px-3 py-1.5 text-sm transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-700"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-5">
        {thread.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex gap-2'}>
            {m.role === 'bot' && (
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-300">
                <Icon name="bot" size={18} />
              </span>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                m.role === 'user' ? 'bg-brand-600 text-white' : 'card'
              }`}
            >
              <span className="leading-relaxed">{m.text}</span>
              {m.opportunities?.length > 0 && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {m.opportunities.map((o) => (
                    <OpportunityCard key={o.id} opp={o} saved={false} onToggleSave={() => {}} />
                  ))}
                </div>
              )}
              {m.courses?.length > 0 && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {m.courses.map((c) => (
                    <CourseCard
                      key={c.id}
                      course={{ ...c, lessonCount: 0, enrolled: false, progressPercent: 0 }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-300">
              <Icon name="bot" size={18} />
            </span>
            Подбираю…
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
        className="sticky bottom-4 mt-6 flex gap-2"
      >
        <input
          className="input"
          placeholder="Например: хочу участвовать в хакатоне по программированию"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Запрос ассистенту"
        />
        <button className="btn-primary px-5" disabled={busy} aria-label="Отправить">
          <Icon name="send" size={18} /> <span className="hidden sm:inline">Спросить</span>
        </button>
      </form>
    </div>
  );
}
