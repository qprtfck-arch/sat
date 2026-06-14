import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { Spinner } from '../components/common.jsx';
import Icon from '../components/Icon.jsx';

export default function Roadmap() {
  const [quests, setQuests] = useState(null);
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(true);

  const generate = async () => {
    setLoading(true);
    try {
      const r = await api.post('/ai/roadmap');
      setQuests(r.quests || []);
      setSource(r.source);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generate();
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Мой AI-Roadmap</h1>
          <p className="mt-1 text-slate-500">
            Персональная цепочка квестов из возможностей под твой профиль и цели.
          </p>
        </div>
        <button onClick={generate} className="btn-outline" disabled={loading}>
          <Icon name="sparkles" size={16} /> Сгенерировать заново
        </button>
      </div>

      {source && (
        <span className="badge mb-4 inline-flex">
          {source === 'ai' ? 'Сгенерировано Gemini' : 'Офлайн-генерация'}
        </span>
      )}

      {loading ? (
        <Spinner label="Строим маршрут…" />
      ) : (
        <div className="relative space-y-4 pl-8">
          <div className="absolute bottom-4 left-3 top-4 w-0.5 bg-brand-200 dark:bg-brand-900" />
          {quests.map((q, i) => (
            <div key={q.quest_id} className="relative">
              <span className="absolute -left-[1.35rem] flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white ring-4 ring-white dark:ring-slate-950">
                {i + 1}
              </span>
              <div className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display font-semibold">{q.title}</h3>
                  <span className="chip shrink-0 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
                    <Icon name="coins" size={13} /> +{q.reward_coins}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{q.description}</p>
                {q.opportunity && (
                  <Link
                    to={`/opportunities/${q.opportunity.id}`}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:gap-1.5"
                  >
                    <Icon name="compass" size={15} /> {q.opportunity.title} <Icon name="arrow-right" size={14} />
                  </Link>
                )}
              </div>
            </div>
          ))}
          {quests.length === 0 && (
            <p className="text-sm text-slate-500">Не удалось построить маршрут. Заполни интересы в онбординге.</p>
          )}
        </div>
      )}
    </div>
  );
}
