import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useApp } from '../lib/store.jsx';
import { Spinner } from '../components/common.jsx';
import Icon from '../components/Icon.jsx';
import {
  directionRu,
  directionColor,
  categoryRuLabel,
  formatRuLabel,
  formatDate,
  deadlineLabel,
} from '../lib/ui.js';

export default function OpportunityDetail() {
  const { id } = useParams();
  const { user } = useApp();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get(`/opportunities/${id}`)
      .then((d) => setItem(d.item))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user) api.get('/saved').then((d) => setSaved((d.ids || []).includes(id))).catch(() => {});
  }, [user, id]);

  const toggleSave = async () => {
    if (!user) return navigate('/login', { state: { from: `/opportunities/${id}` } });
    if (saved) {
      setSaved(false);
      await api.del(`/saved/${id}`).catch(() => {});
    } else {
      setSaved(true);
      await api.post(`/saved/${id}`).catch(() => {});
    }
  };

  if (loading) return <Spinner />;
  if (!item)
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-slate-500">Возможность не найдена.</p>
        <Link to="/opportunities" className="btn-primary mt-4">
          К каталогу
        </Link>
      </div>
    );

  const dl = deadlineLabel(item.deadline);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/opportunities" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <Icon name="chevron-left" size={16} /> Назад к каталогу
      </Link>

      <div className="card mt-4 p-7">
        <div className="flex flex-wrap gap-1.5">
          <span className={`chip ${directionColor(item.direction)}`}>{directionRu(item.direction)}</span>
          <span className="chip bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {categoryRuLabel(item.category)}
          </span>
          <span className="chip bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {formatRuLabel(item.format)}
          </span>
        </div>

        <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">{item.title}</h1>
        <p className="mt-1 text-sm text-slate-500">Организатор: {item.organizer}</p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Info label="Дедлайн" value={formatDate(item.deadline) || 'Без дедлайна'} />
          <Info label="Формат" value={formatRuLabel(item.format)} />
          <Info label="Локация" value={item.location} />
          <Info label="Класс" value={`${item.gradeMin}–${item.gradeMax}`} />
          <Info label="Статус" value={dl.text} />
        </div>

        <div className="mt-6">
          <h2 className="mb-2 font-semibold">Описание</h2>
          <p className="whitespace-pre-line text-slate-600 dark:text-slate-300">{item.description}</p>
        </div>

        {item.requirements && (
          <div className="mt-5">
            <h2 className="mb-2 font-semibold">Требования</h2>
            <p className="text-slate-600 dark:text-slate-300">{item.requirements}</p>
          </div>
        )}

        <div className="mt-7 flex flex-wrap gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
          <a
            href={item.applyUrl || '#'}
            target="_blank"
            rel="noreferrer"
            className="btn-primary px-6 py-3"
          >
            <Icon name="send" size={18} /> Подать заявку
          </a>
          <button onClick={toggleSave} className="btn-outline px-6 py-3" aria-pressed={saved}>
            <Icon name="heart" size={18} fill={saved ? 'currentColor' : 'none'} className={saved ? 'text-rose-500' : ''} />
            {saved ? 'В избранном' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}
