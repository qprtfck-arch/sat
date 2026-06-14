import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useApp } from '../lib/store.jsx';
import CourseCard from '../components/CourseCard.jsx';
import { GridSkeleton, Empty } from '../components/common.jsx';

export default function Courses() {
  const { user } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/courses')
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Курсы Mentoria</h1>
        <p className="mt-1 text-slate-500">
          Асинхронные курсы с уроками, материалами, мини-тестами и отслеживанием прогресса.
        </p>
      </div>

      {loading ? (
        <GridSkeleton count={3} />
      ) : items.length === 0 ? (
        <Empty icon="book-open" title="Курсов пока нет" hint="Загляни позже — мы добавляем новые курсы." />
      ) : (
        <div className="stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
