import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Spinner } from './common.jsx';
import Modal from './Modal.jsx';
import Icon from './Icon.jsx';
import { DIRECTIONS, directionRu, courseIconName } from '../lib/ui.js';

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

// Reusable course + lesson manager. scope="admin" → all courses; scope="mine" → teacher's own.
export default function CourseManager({ scope = 'admin' }) {
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCourse);
  const [managing, setManaging] = useState(null);

  const endpoint = scope === 'mine' ? '/courses/mine' : '/courses';
  const load = () => api.get(endpoint).then((d) => setItems(d.items));
  useEffect(() => {
    load();
  }, [scope]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const openNew = () => {
    setForm(emptyCourse);
    setEditing('new');
  };
  const openEdit = (c) => {
    setForm({ ...emptyCourse, ...c });
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

      {items.length === 0 ? (
        <p className="card p-8 text-center text-sm text-slate-500">
          Курсов пока нет. Нажми «Добавить курс», чтобы создать первый.
        </p>
      ) : (
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
                  <div className="text-xs text-slate-500">
                    {c.lessonCount} уроков · {c.level}
                    {c.enrollments != null ? ` · ${c.enrollments} записей` : ''}
                  </div>
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
      )}

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
              <button type="button" onClick={() => setEditing(null)} className="btn-outline">Отмена</button>
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
  const newLesson = () => setForm({ title: '', content: '', videoUrl: '', durationMin: 10, quiz: '[]' });
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
              Формат: массив {`{question, options[], answer}`}, answer — индекс правильного.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setForm(null)} className="btn-outline">Назад</button>
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
                  <div className="font-medium">{i + 1}. {l.title}</div>
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
