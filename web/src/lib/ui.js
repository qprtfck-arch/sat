export const DIRECTIONS = [
  'Business',
  'STEM',
  'Programming',
  'Finance',
  'Science',
  'Social Impact',
];

export const CATEGORIES = [
  'Competition',
  'Olympiad',
  'Scholarship',
  'Internship',
  'Summer School',
  'Volunteer',
  'Research',
];

export const FORMATS = ['online', 'offline', 'hybrid'];

export const SUBJECTS = [
  'Math',
  'English',
  'Physics',
  'Biology',
  'Economics',
  'Computer Science',
  'SAT/IELTS',
];

export const GOALS = [
  { id: 'university', label: 'Поступление в университет' },
  { id: 'olympiad', label: 'Олимпиады и конкурсы' },
  { id: 'scholarship', label: 'Стипендии' },
  { id: 'skills', label: 'Новые навыки' },
  { id: 'career', label: 'Карьера и стажировки' },
];

const directionMeta = {
  Business: { ru: 'Бизнес', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200' },
  STEM: { ru: 'STEM', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200' },
  Programming: {
    ru: 'Программирование',
    color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200',
  },
  Finance: {
    ru: 'Финансы',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  },
  Science: {
    ru: 'Наука',
    color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-200',
  },
  'Social Impact': {
    ru: 'Соц. влияние',
    color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
  },
};

const categoryRu = {
  Competition: 'Конкурс',
  Olympiad: 'Олимпиада',
  Scholarship: 'Стипендия',
  Internship: 'Стажировка',
  'Summer School': 'Летняя школа',
  Volunteer: 'Волонтёрство',
  Research: 'Исследование',
};

const formatRu = { online: 'Онлайн', offline: 'Офлайн', hybrid: 'Гибрид' };

export const directionRu = (d) => directionMeta[d]?.ru || d;
export const directionColor = (d) =>
  directionMeta[d]?.color || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
export const categoryRuLabel = (c) => categoryRu[c] || c;
export const formatRuLabel = (f) => formatRu[f] || f;

// Map a course to a consistent SVG icon (instead of emoji covers).
export function courseIconName(course) {
  const hay = `${course.subject || ''} ${course.direction || ''} ${course.tags || ''} ${course.title || ''}`.toLowerCase();
  if (/english|англ|ielts|язык|language/.test(hay)) return 'globe';
  if (/math|математ|алгебр/.test(hay)) return 'target';
  if (/econ|эконом|business|бизнес|finance|финанс/.test(hay)) return 'trending-up';
  if (/program|coding|код|разработ|ai|ml|data/.test(hay)) return 'bot';
  if (/phys|физ|bio|биол|science|наук/.test(hay)) return 'lightbulb';
  return 'book-open';
}

// Map a direction to its icon.
export function directionIcon(d) {
  return (
    {
      Business: 'briefcase',
      STEM: 'target',
      Programming: 'bot',
      Finance: 'trending-up',
      Science: 'lightbulb',
      'Social Impact': 'users',
    }[d] || 'sparkles'
  );
}

export function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function daysLeft(d) {
  if (!d) return null;
  return Math.ceil((new Date(d) - Date.now()) / 86400000);
}

export function deadlineLabel(d) {
  const left = daysLeft(d);
  if (left == null) return { text: 'Без дедлайна', tone: 'slate' };
  if (left < 0) return { text: 'Завершено', tone: 'slate' };
  if (left === 0) return { text: 'Сегодня дедлайн', tone: 'red' };
  if (left <= 7) return { text: `Осталось ${left} дн.`, tone: 'red' };
  if (left <= 21) return { text: `Осталось ${left} дн.`, tone: 'amber' };
  return { text: `Осталось ${left} дн.`, tone: 'green' };
}
