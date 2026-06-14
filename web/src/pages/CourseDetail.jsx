import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useApp } from '../lib/store.jsx';
import { Spinner, ProgressBar } from '../components/common.jsx';
import Icon from '../components/Icon.jsx';
import { directionRu, courseIconName } from '../lib/ui.js';

const levelRu = { Beginner: 'Начальный', Intermediate: 'Средний', Advanced: 'Продвинутый' };

function Quiz({ quiz, savedScore, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(savedScore != null ? { score: savedScore } : null);

  if (!quiz?.length) {
    return (
      <button onClick={() => onComplete(null)} className="btn-primary mt-4">
        <Icon name="check" size={18} /> Отметить урок пройденным
      </button>
    );
  }

  const submit = () => {
    let correct = 0;
    quiz.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });
    const score = Math.round((correct / quiz.length) * 100);
    setResult({ score });
    onComplete(score);
  };

  const allAnswered = quiz.every((_, i) => answers[i] != null);

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
      <h3 className="mb-4 flex items-center gap-2 font-display font-semibold">
        <Icon name="file-text" size={18} /> Мини-тест
      </h3>
      <div className="space-y-5">
        {quiz.map((q, i) => (
          <div key={i}>
            <p className="mb-2 font-medium">
              {i + 1}. {q.question}
            </p>
            <div className="grid gap-2">
              {q.options.map((opt, oi) => {
                const selected = answers[i] === oi;
                const showCorrect = result && oi === q.answer;
                const showWrong = result && selected && oi !== q.answer;
                return (
                  <button
                    key={oi}
                    onClick={() => !result && setAnswers((a) => ({ ...a, [i]: oi }))}
                    disabled={!!result}
                    className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm transition ${
                      showCorrect
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                        : showWrong
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/30'
                          : selected
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30'
                            : 'border-slate-200 bg-white hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900'
                    }`}
                  >
                    <span>{opt}</span>
                    {showCorrect && <Icon name="check" size={16} className="text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {result ? (
        <div className="mt-5 rounded-xl bg-white p-4 text-center dark:bg-slate-900">
          <div className="font-display text-2xl font-extrabold text-brand-600">{result.score}%</div>
          <p className="text-sm text-slate-500">
            {result.score >= 70 ? 'Отличный результат! Урок засчитан.' : 'Урок засчитан. Можешь перечитать материал.'}
          </p>
        </div>
      ) : (
        <button onClick={submit} disabled={!allAnswered} className="btn-primary mt-5">
          Проверить и завершить урок
        </button>
      )}
    </div>
  );
}

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useApp();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  const load = () =>
    api
      .get(`/courses/${id}`)
      .then((d) => setCourse(d.course))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, [id, user]);

  if (loading) return <Spinner />;
  if (!course)
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-slate-500">Курс не найден.</p>
        <Link to="/courses" className="btn-primary mt-4">
          К курсам
        </Link>
      </div>
    );

  const lesson = course.lessons[activeIdx];

  const enroll = async () => {
    if (!user) return navigate('/login', { state: { from: `/courses/${id}` } });
    await api.post(`/courses/${id}/enroll`);
    load();
  };

  const completeLesson = async (score) => {
    if (!user) return navigate('/login', { state: { from: `/courses/${id}` } });
    await api.post(`/lessons/${lesson.id}/complete`, { quizScore: score });
    await load();
    if (activeIdx < course.lessons.length - 1) setTimeout(() => setActiveIdx((i) => i + 1), 600);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <Icon name="chevron-left" size={16} /> Все курсы
      </Link>

      {/* header */}
      <div
        className="card mt-4 overflow-hidden p-7"
        style={{ background: `linear-gradient(135deg, ${course.color}14, transparent)` }}
      >
        <div className="flex items-start gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${course.color}22`, color: course.color }}
          >
            <Icon name={courseIconName(course)} size={32} strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap gap-1.5 text-xs">
              <span className="badge">{levelRu[course.level] || course.level}</span>
              {course.direction && (
                <span className="chip bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {directionRu(course.direction)}
                </span>
              )}
              <span className="chip bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {course.lessons.length} уроков
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">{course.title}</h1>
            <p className="mt-1.5 leading-relaxed text-slate-600 dark:text-slate-300">{course.description}</p>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Прогресс: {course.completedLessons}/{course.lessons.length}
            </span>
            <span className="font-semibold">{course.progressPercent}%</span>
          </div>
          <ProgressBar percent={course.progressPercent} color={course.color} />
        </div>

        {course.completed && (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/30">
            <span className="text-emerald-600">
              <Icon name="trophy" size={26} />
            </span>
            <div>
              <div className="font-semibold text-emerald-700 dark:text-emerald-300">
                Курс пройден! Сертификат доступен в личном кабинете.
              </div>
              <Link to="/dashboard" className="inline-flex items-center gap-0.5 text-sm text-emerald-600 hover:underline">
                Перейти в кабинет <Icon name="chevron-right" size={14} />
              </Link>
            </div>
          </div>
        )}

        {!course.enrolled && (
          <button onClick={enroll} className="btn-primary mt-5 px-6 py-3">
            <Icon name="rocket" size={18} /> Записаться на курс
          </button>
        )}
      </div>

      {/* body: lessons + content */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* lesson list */}
        <aside className="card h-fit p-3">
          <div className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Программа курса
          </div>
          <div className="space-y-1">
            {course.lessons.map((l, i) => (
              <button
                key={l.id}
                onClick={() => setActiveIdx(i)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  i === activeIdx
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                    l.progress.completed
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-500 dark:bg-slate-700'
                  }`}
                >
                  {l.progress.completed ? <Icon name="check" size={14} strokeWidth={2.5} /> : i + 1}
                </span>
                <span className="flex-1 leading-tight">{l.title}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* lesson content */}
        <div className="card p-6">
          <div className="mb-1 flex items-center gap-2 text-sm text-slate-400">
            Урок {activeIdx + 1} из {course.lessons.length}
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Icon name="clock" size={13} /> {lesson.durationMin} мин
            </span>
          </div>
          <h2 className="text-xl font-bold">{lesson.title}</h2>

          {/* video placeholder */}
          <div className="mt-4 flex aspect-video items-center justify-center rounded-2xl bg-slate-900 text-white">
            {lesson.videoUrl ? (
              <iframe
                className="h-full w-full rounded-2xl"
                src={lesson.videoUrl}
                title={lesson.title}
                allowFullScreen
              />
            ) : (
              <div className="text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white">
                  <Icon name="play" size={28} fill="currentColor" strokeWidth={0} />
                </span>
                <div className="mt-3 text-sm text-slate-300">Видео-урок (плейсхолдер)</div>
              </div>
            )}
          </div>

          <p className="mt-5 whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-300">
            {lesson.content}
          </p>

          {lesson.progress.completed && (
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              <Icon name="check-circle" size={16} /> Урок пройден
              {lesson.progress.quizScore != null ? ` · тест ${lesson.progress.quizScore}%` : ''}
            </div>
          )}

          <Quiz
            key={lesson.id}
            quiz={lesson.quiz}
            savedScore={lesson.progress.completed ? lesson.progress.quizScore : null}
            onComplete={completeLesson}
          />

          <div className="mt-6 flex justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              className="btn-ghost"
              disabled={activeIdx === 0}
              onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
            >
              <Icon name="chevron-left" size={16} /> Предыдущий
            </button>
            <button
              className="btn-ghost"
              disabled={activeIdx === course.lessons.length - 1}
              onClick={() => setActiveIdx((i) => Math.min(course.lessons.length - 1, i + 1))}
            >
              Следующий <Icon name="chevron-right" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
