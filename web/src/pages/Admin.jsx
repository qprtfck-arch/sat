import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Spinner } from '../components/common.jsx';
import Icon from '../components/Icon.jsx';
import {
  CATEGORIES,
  DIRECTIONS,
  FORMATS,
  directionRu,
  categoryRuLabel,
  formatRuLabel,
  formatDate,
  courseIconName,
} from '../lib/ui.js';

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`card max-h-[90vh] w-full animate-fade-up overflow-y-auto p-6 ${wide ? 'max-w-3xl' : 'max-w-lg'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="icon-btn" aria-label="Закрыть">
            <Icon name="x" size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

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
        {tab === 'courses' && <CoursesAdmin />}
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
    ['target', stats.opportunities, 'Возможностей'],
    ['graduation-cap', stats.courses, 'Курсов'],
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
              <button type="button" onClick={() => setEditing(null)} className="btn-outline">
                Отмена
              </button>
              <button className="btn-primary">Сохранить</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

const emptyCourse = {
  title: '',
  description: '',
  level: 'Beginner',
  subject: '',
  direction: 'STEM',
  tags: '',
  emoji: '📘',
  color: '#6366f1',
};

function CoursesAdmin() {
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCourse);
  const [managing, setManaging] = useState(null);

  const load = () => api.get('/courses').then((d) => setItems(d.items));
  useEffect(() => {
    load();
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const openNew = () => {
    setForm(emptyCourse);
    setEditing('new');
  };
  const openEdit = (c) => {
    setForm({ ...c });
    setEditing(c.id);
  };
  const save = async (e) => {
    e.preventDefault();
    if (editing === 'new') await api.post('/courses', form);
    else await api.put(`/courses/${editing}`, form);
    setEditing(null);
    load();
  };
  const remove = async (id) => {
    if (!confirm('Удалить курс вместе с уроками?')) return;
    await api.del(`/courses/${id}`);
    load();
  };

  if (!items) return <Spinner />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">Всего: {items.length}</p>
        <button onClick={openNew} className="btn-primary">
          <Icon name="plus" size={16} /> Добавить курс
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((c) => (
          <div key={c.id} className="card p-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${c.color}22`, color: c.color }}
              >
                <Icon name={courseIconName(c)} size={22} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{c.title}</div>
                <div className="text-xs text-slate-500">{c.lessonCount} уроков · {c.level}</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setManaging(c.id)} className="btn-outline !px-3 !py-1.5 text-xs">
                <Icon name="layers" size={14} /> Уроки
              </button>
              <button onClick={() => openEdit(c)} className="btn-outline !px-3 !py-1.5 text-xs">
                <Icon name="pencil" size={14} /> Изм.
              </button>
              <button onClick={() => remove(c.id)} className="btn-ghost !px-3 !py-1.5 text-xs text-red-500">
                <Icon name="trash" size={14} /> Удал.
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal title={editing === 'new' ? 'Новый курс' : 'Редактировать курс'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="label">Название</label>
              <input className="input" value={form.title} onChange={set('title')} required />
            </div>
            <div>
              <label className="label">Описание</label>
              <textarea className="input min-h-[80px]" value={form.description} onChange={set('description')} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Уровень</label>
                <select className="input" value={form.level} onChange={set('level')}>
                  <option value="Beginner">Начальный</option>
                  <option value="Intermediate">Средний</option>
                  <option value="Advanced">Продвинутый</option>
                </select>
              </div>
              <div>
                <label className="label">Направление</label>
                <select className="input" value={form.direction} onChange={set('direction')}>
                  {DIRECTIONS.map((d) => (
                    <option key={d} value={d}>{directionRu(d)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Предмет</label>
                <input className="input" value={form.subject} onChange={set('subject')} placeholder="Math" />
              </div>
              <div>
                <label className="label">Цвет</label>
                <input className="input h-11" type="color" value={form.color} onChange={set('color')} />
              </div>
              <div className="col-span-2">
                <label className="label">Теги</label>
                <input className="input" value={form.tags} onChange={set('tags')} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn-outline">
                Отмена
              </button>
              <button className="btn-primary">Сохранить</button>
            </div>
          </form>
        </Modal>
      )}

      {managing && <LessonsManager courseId={managing} onClose={() => { setManaging(null); load(); }} />}
    </div>
  );
}

function LessonsManager({ courseId, onClose }) {
  const [course, setCourse] = useState(null);
  const [form, setForm] = useState(null);

  const load = () => api.get(`/courses/${courseId}`).then((d) => setCourse(d.course));
  useEffect(() => {
    load();
  }, [courseId]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const newLesson = () =>
    setForm({ title: '', content: '', videoUrl: '', durationMin: 10, quiz: '[]' });
  const editLesson = (l) =>
    setForm({
      id: l.id,
      title: l.title,
      content: l.content,
      videoUrl: l.videoUrl,
      durationMin: l.durationMin,
      quiz: JSON.stringify(l.quiz || [], null, 2),
    });

  const saveLesson = async (e) => {
    e.preventDefault();
    let quiz;
    try {
      quiz = JSON.parse(form.quiz || '[]');
    } catch {
      alert('Некорректный JSON в тесте');
      return;
    }
    const payload = { ...form, quiz };
    if (form.id) await api.put(`/courses/lessons/${form.id}`, payload);
    else await api.post(`/courses/${courseId}/lessons`, payload);
    setForm(null);
    load();
  };

  const removeLesson = async (id) => {
    if (!confirm('Удалить урок?')) return;
    await api.del(`/courses/lessons/${id}`);
    load();
  };

  return (
    <Modal title={course ? `Уроки: ${course.title}` : 'Уроки'} onClose={onClose} wide>
      {!course ? (
        <Spinner />
      ) : form ? (
        <form onSubmit={saveLesson} className="space-y-4">
          <div>
            <label className="label">Название урока</label>
            <input className="input" value={form.title} onChange={set('title')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Длительность (мин)</label>
              <input className="input" type="number" value={form.durationMin} onChange={set('durationMin')} />
            </div>
            <div>
              <label className="label">Видео (URL embed, опц.)</label>
              <input className="input" value={form.videoUrl} onChange={set('videoUrl')} placeholder="https://" />
            </div>
          </div>
          <div>
            <label className="label">Содержание</label>
            <textarea className="input min-h-[100px]" value={form.content} onChange={set('content')} />
          </div>
          <div>
            <label className="label">Тест (JSON)</label>
            <textarea
              className="input min-h-[120px] font-mono text-xs"
              value={form.quiz}
              onChange={set('quiz')}
              placeholder='[{"question":"...","options":["A","B"],"answer":0}]'
            />
            <p className="mt-1 text-xs text-slate-400">
              Формат: массив объектов {`{question, options[], answer}`}, answer — индекс правильного ответа.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setForm(null)} className="btn-outline">
              Назад
            </button>
            <button className="btn-primary">Сохранить урок</button>
          </div>
        </form>
      ) : (
        <div>
          <button onClick={newLesson} className="btn-primary mb-4">
            <Icon name="plus" size={16} /> Добавить урок
          </button>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {course.lessons.map((l, i) => (
              <div key={l.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <div className="font-medium">
                    {i + 1}. {l.title}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Icon name="clock" size={12} /> {l.durationMin} мин · {l.quiz?.length || 0} вопрос(ов)
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => editLesson(l)} className="icon-btn h-9 w-9" aria-label="Редактировать">
                    <Icon name="pencil" size={16} />
                  </button>
                  <button onClick={() => removeLesson(l.id)} className="icon-btn h-9 w-9 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30" aria-label="Удалить">
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </div>
            ))}
            {course.lessons.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">Уроков пока нет.</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function UsersAdmin() {
  const [users, setUsers] = useState(null);
  useEffect(() => {
    api.get('/admin/users').then((d) => setUsers(d.users));
  }, []);
  if (!users) return <Spinner />;
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
          <tr>
            <th className="p-3">Имя</th>
            <th className="p-3">Email</th>
            <th className="p-3">Роль</th>
            <th className="p-3">Класс</th>
            <th className="p-3">Курсы</th>
            <th className="p-3">Избранное</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((u) => (
            <tr key={u.id}>
              <td className="p-3 font-medium">{u.name}</td>
              <td className="p-3 text-slate-500">{u.email}</td>
              <td className="p-3">
                <span className={`chip ${u.role === 'admin' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                  {u.role}
                </span>
              </td>
              <td className="p-3">{u.grade || '—'}</td>
              <td className="p-3">{u.enrollments}</td>
              <td className="p-3">{u.saved}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
