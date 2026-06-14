import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useApp } from '../lib/store.jsx';
import OpportunityCard from '../components/OpportunityCard.jsx';
import { GridSkeleton, Empty } from '../components/common.jsx';
import Icon from '../components/Icon.jsx';
import {
  CATEGORIES,
  DIRECTIONS,
  FORMATS,
  directionRu,
  categoryRuLabel,
  formatRuLabel,
} from '../lib/ui.js';

export default function Opportunities() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());

  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [direction, setDirection] = useState('');
  const [format, setFormat] = useState('');
  const [grade, setGrade] = useState('');
  const [sort, setSort] = useState('deadline');

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (category) p.set('category', category);
    if (direction) p.set('direction', direction);
    if (format) p.set('format', format);
    if (grade) p.set('grade', grade);
    if (sort) p.set('sort', sort);
    return p.toString();
  }, [q, category, direction, format, grade, sort]);

  useEffect(() => {
    setLoading(true);
    const ctrl = setTimeout(() => {
      api
        .get(`/opportunities?${query}`)
        .then((d) => setItems(d.items || []))
        .finally(() => setLoading(false));
    }, 200); // debounce search
    return () => clearTimeout(ctrl);
  }, [query]);

  useEffect(() => {
    if (user) api.get('/saved').then((d) => setSavedIds(new Set(d.ids || []))).catch(() => {});
  }, [user]);

  const toggleSave = async (opp) => {
    if (!user) return navigate('/login', { state: { from: '/opportunities' } });
    const isSaved = savedIds.has(opp.id);
    const next = new Set(savedIds);
    if (isSaved) {
      next.delete(opp.id);
      setSavedIds(next);
      await api.del(`/saved/${opp.id}`).catch(() => {});
    } else {
      next.add(opp.id);
      setSavedIds(next);
      await api.post(`/saved/${opp.id}`).catch(() => {});
    }
  };

  const reset = () => {
    setQ('');
    setCategory('');
    setDirection('');
    setFormat('');
    setGrade('');
    setSort('deadline');
  };

  const hasFilters = q || category || direction || format || grade;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Каталог возможностей</h1>
        <p className="mt-1 text-slate-500">
          Конкурсы, олимпиады, стипендии, стажировки и летние школы для учеников 8–12 классов.
        </p>
      </div>

      {/* filters */}
      <div className="card mb-6 p-4">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon name="search" size={18} />
            </span>
            <input
              className="input pl-10"
              type="search"
              placeholder="Поиск по названию, описанию, тегам…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <select className="input" value={direction} onChange={(e) => setDirection(e.target.value)}>
              <option value="">Все направления</option>
              {DIRECTIONS.map((d) => (
                <option key={d} value={d}>
                  {directionRu(d)}
                </option>
              ))}
            </select>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Все категории</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {categoryRuLabel(c)}
                </option>
              ))}
            </select>
            <select className="input" value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="">Любой формат</option>
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {formatRuLabel(f)}
                </option>
              ))}
            </select>
            <select className="input" value={grade} onChange={(e) => setGrade(e.target.value)}>
              <option value="">Любой класс</option>
              {[8, 9, 10, 11, 12].map((g) => (
                <option key={g} value={g}>
                  {g} класс
                </option>
              ))}
            </select>
            <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="deadline">По дедлайну</option>
              <option value="new">Сначала новые</option>
            </select>
          </div>
          {hasFilters && (
            <button onClick={reset} className="self-start text-sm font-medium text-brand-600 hover:underline">
              Сбросить фильтры
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <GridSkeleton count={6} />
      ) : items.length === 0 ? (
        <Empty icon="search" title="Ничего не найдено" hint="Попробуй изменить фильтры или поисковый запрос." />
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-500">Найдено: <span className="nums">{items.length}</span></p>
          <div className="stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((o) => (
              <OpportunityCard key={o.id} opp={o} saved={savedIds.has(o.id)} onToggleSave={toggleSave} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
