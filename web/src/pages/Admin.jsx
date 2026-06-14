import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Spinner } from '../components/common.jsx';
import Modal from '../components/Modal.jsx';
import Icon from '../components/Icon.jsx';
import CourseManager from '../components/CourseManager.jsx';
import {
  CATEGORIES,
  DIRECTIONS,
  FORMATS,
  directionRu,
  categoryRuLabel,
  formatRuLabel,
  formatDate,
} from '../lib/ui.js';

const TABS = [
  { id: 'overview', label: 'Обзор', icon: 'bar-chart' },
  { id: 'opportunities', label: 'Возможности', icon: 'target' },
  { id: 'courses', label: 'Курсы', icon: 'graduation-cap' },
  { id: 'users', label: 'Пользователи', icon: 'users' },
];

export default function Admin() {
  const [tab, setTab] = useState('overview');
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Админ-панель</h1>
      <p className="mt-1 text-slate-500">Управление контентом платформы. Так Mentoria масштабируется без пересборки сайта.</p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              tab === t.id
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Icon name={t.icon} size={16} /> {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'overview' && <Overview />}
        {tab === 'opportunities' && <OpportunitiesAdmin />}
        {tab === 'courses' && <CourseManager scope="admin" />}
        {tab === 'users' && <UsersAdmin />}
      </div>
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get('/admin/stats').then((d) => setStats(d.stats));
  }, []);
  if (!stats) return <Spinner />;
  const cards = [
    ['users', stats.users, 'Пользователей'],
    ['user', stats.students, 'Учеников'],
    ['graduation-cap', stats.teachers ?? 0, 'Учителей'],
    ['target', stats.opportunities, 'Возможностей'],
    ['book-open', stats.courses, 'Курсов'],
    ['layers', stats.lessons, 'Уроков'],
    ['file-text', stats.enrollments, 'Записей на курсы'],
    ['check-circle', stats.lessonsCompleted, 'Уроков пройдено'],
  ];
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map(([icon, value, label]) => (
        <div key={label} className="card p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
            <Icon name={icon} size={20} />
          </span>
          <div className="mt-3 font-display text-3xl font-extrabold">{value}</div>
          <div className="text-sm text-slate-500">{label}</div>
        </div>
      ))}
    </div>
  );
}

const emptyOpp = {
  title: '',
  category: 'Competition',
  direction: 'Business',
  format: 'online',
  deadline: '',
  description: '',
  requirements: '',
  applyUrl: '',
  gradeMin: 8,
  gradeMax: 12,
  tags: '',
  location: 'Online',
  organizer: 'Mentoria',
};

function OpportunitiesAdmin() {
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyOpp);

  const load = () => api.get('/opportunities').then((d) => setItems(d.items));
  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setForm(emptyOpp);
    setEditing('new');
  };
  const openEdit = (o) => {
    setForm({ ...o, deadline: o.deadline ? o.deadline.slice(0, 10) : '' });
    setEditing(o.id);
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    const payload = { ...form, deadline: form.deadline || null };
    if (editing === 'new') await api.post('/opportunities', payload);
    else await api.put(`/opportunities/${editing}`, payload);
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Удалить эту возможность?')) return;
    await api.del(`/opportunities/${id}`);
    load();
  };

  if (!items) return <Spinner />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">Всего: {items.length}</p>
        <button onClick={openNew} className="btn-primary">
          <Icon name="plus" size={16} /> Добавить возможность
        </button>
      </div>

      <div className="card divide-y divide-slate-100 dark:divide-slate-800">
        {items.map((o) => (
          <div key={o.id} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <div className="truncate font-semibold">{o.title}</div>
              <div className="mt-0.5 flex flex-wrap gap-1.5 text-xs text-slate-500">
                <span>{directionRu(o.direction)}</span>
                <span>· {categoryRuLabel(o.category)}</span>
                <span>· {formatRuLabel(o.format)}</span>
                {o.deadline && <span>· до {formatDate(o.deadline)}</span>}
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <button onClick={() => openEdit(o)} className="icon-btn h-9 w-9" aria-label="Редактировать">
                <Icon name="pencil" size={16} />
              </button>
              <button onClick={() => remove(o.id)} className="icon-btn h-9 w-9 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30" aria-label="Удалить">
                <Icon name="trash" size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal title={editing === 'new' ? 'Новая возможность' : 'Редактировать'} onClose={() => setEditing(null)} wide>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="label">Название</label>
              <input className="input" value={form.title} onChange={set('title')} required />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <label className="label">Направление</label>
                <select className="input" value={form.direction} onChange={set('direction')}>
                  {DIRECTIONS.map((d) => (
                    <option key={d} value={d}>{directionRu(d)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Категория</label>
                <select className="input" value={form.category} onChange={set('category')}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{categoryRuLabel(c)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Формат</label>
                <select className="input" value={form.format} onChange={set('format')}>
                  {FORMATS.map((f) => (
                    <option key={f} value={f}>{formatRuLabel(f)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="label">Дедлайн</label>
                <input className="input" type="date" value={form.deadline} onChange={set('deadline')} />
              </div>
              <div>
                <label className="label">Класс от</label>
                <input className="input" type="number" min={8} max={12} value={form.gradeMin} onChange={set('gradeMin')} />
              </div>
              <div>
                <label className="label">Класс до</label>
                <input className="input" type="number" min={8} max={12} value={form.gradeMax} onChange={set('gradeMax')} />
              </div>
              <div>
                <label className="label">Локация</label>
                <input className="input" value={form.location} onChange={set('location')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Организатор</label>
                <input className="input" value={form.organizer} onChange={set('organizer')} />
              </div>
              <div>
                <label className="label">Ссылка на заявку</label>
                <input className="input" value={form.applyUrl} onChange={set('applyUrl')} placeholder="https://" />
              </div>
            </div>
            <div>
              <label className="label">Описание</label>
              <textarea className="input min-h-[90px]" value={form.description} onChange={set('description')} required />
            </div>
            <div>
              <label className="label">Требования</label>
              <input className="input" value={form.requirements} onChange={set('requirements')} />
            </div>
            <div>
              <label className="label">Теги (через запятую)</label>
              <input className="input" value={form.tags} onChange={set('tags')} placeholder="startup,pitch,business" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn-outline">Отмена</button>
              <button className="btn-primary">Сохранить</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function UsersAdmin() {
  const [users, setUsers] = useState(null);
  useEffect(() => {
    api.get('/admin/users').then((d) => setUsers(d.users));
  }, []);
  if (!users) return <Spinner />;
  const roleClass = (r) =>
    r === 'admin'
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
      : r === 'teacher'
        ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200'
        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
          <tr>
            <th className="p-3">Имя</th>
            <th className="p-3">Email</th>
            <th className="p-3">Роль</th>
            <th className="p-3">Класс</th>
            <th className="p-3">Монеты</th>
            <th className="p-3">Курсы</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((u) => (
            <tr key={u.id}>
              <td className="p-3 font-medium">{u.name}</td>
              <td className="p-3 text-slate-500">{u.email}</td>
              <td className="p-3"><span className={`chip ${roleClass(u.role)}`}>{u.role}</span></td>
              <td className="p-3">{u.grade || '—'}</td>
              <td className="p-3">{u.coins ?? '—'}</td>
              <td className="p-3">{u.enrollments}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
