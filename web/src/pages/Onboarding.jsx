import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../lib/store.jsx';
import { DIRECTIONS, SUBJECTS, GOALS, directionRu } from '../lib/ui.js';

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`chip border px-3 py-1.5 text-sm transition ${
        active
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-slate-300 text-slate-600 hover:border-brand-400 dark:border-slate-700 dark:text-slate-300'
      }`}
    >
      {children}
    </button>
  );
}

export default function Onboarding() {
  const { user, updateProfile } = useApp();
  const navigate = useNavigate();
  const [grade, setGrade] = useState(user?.grade || '');
  const [interests, setInterests] = useState(user?.interests || []);
  const [subjects, setSubjects] = useState(user?.subjects || []);
  const [goals, setGoals] = useState(user?.goals || []);
  const [busy, setBusy] = useState(false);

  const toggle = (list, setList, value) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const submit = async () => {
    setBusy(true);
    try {
      await updateProfile({ grade, interests, subjects, goals, onboarded: true });
      navigate('/dashboard', { replace: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <span className="badge mb-3 inline-block">Шаг настройки профиля</span>
        <h1 className="text-3xl font-extrabold tracking-tight">Расскажи о себе</h1>
        <p className="mt-2 text-slate-500">
          Это поможет подобрать возможности и курсы именно под тебя.
        </p>
      </div>

      <div className="card space-y-8 p-7">
        <div>
          <h2 className="mb-3 font-semibold">В каком ты классе?</h2>
          <div className="flex flex-wrap gap-2">
            {[8, 9, 10, 11, 12].map((g) => (
              <Chip key={g} active={Number(grade) === g} onClick={() => setGrade(g)}>
                {g} класс
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-1 font-semibold">Какие направления интересны?</h2>
          <p className="mb-3 text-sm text-slate-500">Можно выбрать несколько</p>
          <div className="flex flex-wrap gap-2">
            {DIRECTIONS.map((d) => (
              <Chip key={d} active={interests.includes(d)} onClick={() => toggle(interests, setInterests, d)}>
                {directionRu(d)}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-semibold">Любимые предметы</h2>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <Chip key={s} active={subjects.includes(s)} onClick={() => toggle(subjects, setSubjects, s)}>
                {s}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-semibold">Твои цели</h2>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => (
              <Chip key={g.id} active={goals.includes(g.id)} onClick={() => toggle(goals, setGoals, g.id)}>
                {g.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-800">
          <button onClick={() => navigate('/dashboard')} className="btn-ghost">
            Пропустить
          </button>
          <button onClick={submit} className="btn-primary px-6" disabled={busy}>
            {busy ? 'Сохраняем…' : 'Готово — показать подборку'}
          </button>
        </div>
      </div>
    </div>
  );
}
