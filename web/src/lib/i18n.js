// Lightweight i18n for the app shell (bonus: multilingual interface).
export const LANGS = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
  { code: 'kz', label: 'KZ' },
];

const dict = {
  ru: {
    'nav.opportunities': 'Возможности',
    'nav.courses': 'Курсы',
    'nav.dashboard': 'Кабинет',
    'nav.assistant': 'AI-ассистент',
    'nav.rewards': 'Награды',
    'nav.roadmap': 'Roadmap',
    'nav.teach': 'Преподавание',
    'nav.admin': 'Админ',
    'nav.login': 'Войти',
    'nav.signup': 'Регистрация',
    'nav.logout': 'Выйти',
    'hero.tag': 'EdTech-платформа Mentoria',
    'hero.title': 'Возможности и курсы — в одном месте',
    'hero.subtitle':
      'Находи конкурсы, олимпиады, стипендии и стажировки. Учись в своём темпе через асинхронные курсы Mentoria.',
    'hero.cta1': 'Найти возможности',
    'hero.cta2': 'Начать обучение',
    'hero.cta3': 'Присоединиться к Mentoria',
  },
  en: {
    'nav.opportunities': 'Opportunities',
    'nav.courses': 'Courses',
    'nav.dashboard': 'Dashboard',
    'nav.assistant': 'AI Assistant',
    'nav.rewards': 'Rewards',
    'nav.roadmap': 'Roadmap',
    'nav.teach': 'Teaching',
    'nav.admin': 'Admin',
    'nav.login': 'Log in',
    'nav.signup': 'Sign up',
    'nav.logout': 'Log out',
    'hero.tag': 'Mentoria EdTech platform',
    'hero.title': 'Opportunities and courses — in one place',
    'hero.subtitle':
      'Discover competitions, olympiads, scholarships and internships. Learn at your own pace with async Mentoria courses.',
    'hero.cta1': 'Find opportunities',
    'hero.cta2': 'Start learning',
    'hero.cta3': 'Join Mentoria',
  },
  kz: {
    'nav.opportunities': 'Мүмкіндіктер',
    'nav.courses': 'Курстар',
    'nav.dashboard': 'Кабинет',
    'nav.assistant': 'AI-көмекші',
    'nav.rewards': 'Марапаттар',
    'nav.roadmap': 'Roadmap',
    'nav.teach': 'Оқыту',
    'nav.admin': 'Әкімші',
    'nav.login': 'Кіру',
    'nav.signup': 'Тіркелу',
    'nav.logout': 'Шығу',
    'hero.tag': 'Mentoria EdTech платформасы',
    'hero.title': 'Мүмкіндіктер мен курстар — бір жерде',
    'hero.subtitle':
      'Байқаулар, олимпиадалар, стипендиялар мен тағылымдамаларды тап. Mentoria курстарымен өз қарқыныңмен оқы.',
    'hero.cta1': 'Мүмкіндіктерді табу',
    'hero.cta2': 'Оқуды бастау',
    'hero.cta3': 'Mentoria-ға қосылу',
  },
};

export function translate(lang, key) {
  return (dict[lang] && dict[lang][key]) || dict.ru[key] || key;
}
