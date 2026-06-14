import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const hash = (p) => bcrypt.hashSync(p, 10);
const daysFromNow = (n) => new Date(Date.now() + n * 86400000);

async function main() {
  console.log('🌱 Seeding Mentoria Hub...');

  // wipe (order matters due to FKs)
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.savedOpportunity.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.user.deleteMany();

  // ---- users ----
  const admin = await prisma.user.create({
    data: {
      email: 'admin@mentoria.io',
      password: hash('admin123'),
      name: 'Mentoria Admin',
      role: 'admin',
      onboarded: true,
    },
  });

  const student = await prisma.user.create({
    data: {
      email: 'student@mentoria.io',
      password: hash('student123'),
      name: 'Алина Серикова',
      role: 'student',
      grade: 10,
      interests: 'Business,STEM,Programming',
      subjects: 'English,Math,Computer Science',
      goals: 'university,olympiad',
      onboarded: true,
    },
  });

  // ---- opportunities (12) ----
  const opportunities = [
    {
      title: 'Global Youth Business Challenge 2026',
      category: 'Competition',
      direction: 'Business',
      format: 'online',
      deadline: daysFromNow(21),
      description:
        'Международный кейс-чемпионат, где команды решают реальную бизнес-задачу и питчат решение жюри из предпринимателей.',
      requirements: 'Команда 2–4 человека, презентация на английском',
      applyUrl: 'https://example.com/apply',
      gradeMin: 9,
      gradeMax: 12,
      tags: 'startup,case,pitch,entrepreneurship',
      location: 'Online',
      organizer: 'Junior Achievement',
    },
    {
      title: 'Mentoria STEM Olympiad',
      category: 'Olympiad',
      direction: 'STEM',
      format: 'hybrid',
      deadline: daysFromNow(35),
      description:
        'Командная олимпиада по математике, физике и информатике с отборочным онлайн-туром и финалом в Алматы.',
      requirements: 'Ученики 8–11 классов',
      applyUrl: 'https://example.com/apply',
      gradeMin: 8,
      gradeMax: 11,
      tags: 'math,physics,informatics,olympiad',
      location: 'Алматы / Online',
      organizer: 'Mentoria',
    },
    {
      title: 'Future Coders Hackathon',
      category: 'Competition',
      direction: 'Programming',
      format: 'online',
      deadline: daysFromNow(12),
      description:
        '48-часовой хакатон для школьников: за выходные собираешь работающий прототип приложения с менторской поддержкой.',
      requirements: 'Базовые знания любого языка программирования',
      applyUrl: 'https://example.com/apply',
      gradeMin: 9,
      gradeMax: 12,
      tags: 'coding,web,ai,hackathon,programming',
      location: 'Online',
      organizer: 'TechMinds',
    },
    {
      title: 'Women in Tech Scholarship',
      category: 'Scholarship',
      direction: 'Programming',
      format: 'online',
      deadline: daysFromNow(45),
      description:
        'Стипендия на онлайн-буткемп по разработке для девушек, мечтающих о карьере в IT.',
      requirements: 'Девушки 10–12 классов, мотивационное эссе',
      applyUrl: 'https://example.com/apply',
      gradeMin: 10,
      gradeMax: 12,
      tags: 'scholarship,it,women,coding',
      location: 'Online',
      organizer: 'CodeForAll',
    },
    {
      title: 'Harvard Summer School Pre-College',
      category: 'Summer School',
      direction: 'STEM',
      format: 'offline',
      deadline: daysFromNow(60),
      description:
        'Летняя программа уровня pre-college: настоящие университетские курсы, кампус и международное окружение.',
      requirements: 'Английский B2+, средний балл 4.5+',
      applyUrl: 'https://example.com/apply',
      gradeMin: 10,
      gradeMax: 12,
      tags: 'summer,university,research,usa',
      location: 'Cambridge, USA',
      organizer: 'Harvard',
    },
    {
      title: 'Eco Impact Volunteer Program',
      category: 'Volunteer',
      direction: 'Social Impact',
      format: 'offline',
      deadline: daysFromNow(18),
      description:
        'Волонтёрская программа по экологии: проекты по переработке и озеленению, сертификат и реальные часы волонтёрства.',
      requirements: 'Возраст 14+',
      applyUrl: 'https://example.com/apply',
      gradeMin: 8,
      gradeMax: 12,
      tags: 'volunteer,ecology,community,social',
      location: 'Астана',
      organizer: 'Green Future',
    },
    {
      title: 'National Math Olympiad',
      category: 'Olympiad',
      direction: 'STEM',
      format: 'offline',
      deadline: daysFromNow(28),
      description:
        'Республиканская олимпиада по математике — путь в сборную страны и сильное портфолио для поступления.',
      requirements: 'Победа в школьном этапе',
      applyUrl: 'https://example.com/apply',
      gradeMin: 8,
      gradeMax: 11,
      tags: 'math,olympiad,competition',
      location: 'Региональные центры',
      organizer: 'МОН РК',
    },
    {
      title: 'FinLiteracy Bootcamp for Teens',
      category: 'Internship',
      direction: 'Finance',
      format: 'online',
      deadline: daysFromNow(9),
      description:
        'Двухнедельная стажировка-интенсив по личным финансам, инвестициям и финтеху с практическими кейсами от банка.',
      requirements: 'Мотивационная анкета',
      applyUrl: 'https://example.com/apply',
      gradeMin: 9,
      gradeMax: 12,
      tags: 'finance,investing,fintech,money',
      location: 'Online',
      organizer: 'FinHub',
    },
    {
      title: 'Young Researchers Conference',
      category: 'Research',
      direction: 'Science',
      format: 'hybrid',
      deadline: daysFromNow(50),
      description:
        'Конференция, где школьники представляют собственные исследовательские проекты и получают обратную связь от учёных.',
      requirements: 'Тезисы проекта (1 страница)',
      applyUrl: 'https://example.com/apply',
      gradeMin: 9,
      gradeMax: 12,
      tags: 'research,science,biology,physics',
      location: 'Алматы / Online',
      organizer: 'SciClub',
    },
    {
      title: 'Startup Weekend for Students',
      category: 'Competition',
      direction: 'Business',
      format: 'offline',
      deadline: daysFromNow(15),
      description:
        'За один уикенд от идеи до MVP и питча перед инвесторами. Лучшие команды получают грант на развитие.',
      requirements: 'Возраст 15+',
      applyUrl: 'https://example.com/apply',
      gradeMin: 9,
      gradeMax: 12,
      tags: 'startup,business,pitch,entrepreneurship',
      location: 'Астана',
      organizer: 'Astana Hub',
    },
    {
      title: 'IELTS Prep Scholarship',
      category: 'Scholarship',
      direction: 'STEM',
      format: 'online',
      deadline: daysFromNow(7),
      description:
        'Стипендия на полный курс подготовки к IELTS с носителями языка и пробными экзаменами.',
      requirements: 'Входное тестирование',
      applyUrl: 'https://example.com/apply',
      gradeMin: 10,
      gradeMax: 12,
      tags: 'english,ielts,scholarship,language',
      location: 'Online',
      organizer: 'British Council',
    },
    {
      title: 'AI for Good Datathon',
      category: 'Competition',
      direction: 'Programming',
      format: 'online',
      deadline: daysFromNow(40),
      description:
        'Соревнование по анализу данных и ML, где участники решают социально значимые задачи с помощью AI.',
      requirements: 'Знание Python (базовое)',
      applyUrl: 'https://example.com/apply',
      gradeMin: 10,
      gradeMax: 12,
      tags: 'ai,ml,data,python,programming,social',
      location: 'Online',
      organizer: 'DataKind',
    },
  ];

  for (const o of opportunities) await prisma.opportunity.create({ data: o });

  // ---- courses with lessons + quizzes ----
  const courses = [
    {
      title: 'Английский для академического успеха',
      description:
        'Прокачай академический английский: словарь, грамматика и навыки для эссе и устных ответов на международном уровне.',
      level: 'Beginner',
      subject: 'English',
      direction: 'STEM',
      tags: 'english,ielts,academic,language',
      emoji: '🇬🇧',
      color: '#2563eb',
      lessons: [
        {
          title: 'Академическая лексика: основа основ',
          content:
            'В этом уроке разберём, чем академический английский отличается от разговорного, и соберём первый набор полезных слов-связок (however, therefore, in addition) для эссе и презентаций.',
          durationMin: 12,
          quiz: [
            {
              question: 'Какое слово лучше подходит для академического текста?',
              options: ['kids', 'children', 'guys', 'folks'],
              answer: 1,
            },
            {
              question: 'Связка "however" используется чтобы…',
              options: ['добавить пример', 'выразить противопоставление', 'сделать вывод', 'перечислить'],
              answer: 1,
            },
          ],
        },
        {
          title: 'Структура эссе: введение, тело, заключение',
          content:
            'Учимся строить чёткое эссе из 4 абзацев: тезис, два аргумента с примерами и вывод. Разбираем шаблон thesis statement.',
          durationMin: 15,
          quiz: [
            {
              question: 'Где находится thesis statement?',
              options: ['в заключении', 'в конце введения', 'в каждом абзаце', 'в заголовке'],
              answer: 1,
            },
          ],
        },
        {
          title: 'Speaking: как уверенно отвечать',
          content:
            'Техники беглой речи: фразы-филлеры, структура ответа PEE (Point–Example–Explain) и тренировка на типовых вопросах IELTS Speaking.',
          durationMin: 14,
          quiz: [
            {
              question: 'Что означает E в технике PEE?',
              options: ['English', 'Example', 'Exam', 'Essay'],
              answer: 1,
            },
          ],
        },
      ],
    },
    {
      title: 'Основы математики',
      description:
        'Фундамент школьной математики без зубрёжки: проценты, уравнения и функции на понятных примерах из жизни.',
      level: 'Beginner',
      subject: 'Math',
      direction: 'STEM',
      tags: 'math,algebra,olympiad',
      emoji: '📐',
      color: '#9333ea',
      lessons: [
        {
          title: 'Проценты, которые понадобятся всегда',
          content:
            'Разбираемся, как быстро считать проценты в уме, находить часть от числа и процентное изменение — пригодится и на экзамене, и в финансах.',
          durationMin: 11,
          quiz: [
            {
              question: 'Сколько будет 20% от 150?',
              options: ['25', '30', '35', '20'],
              answer: 1,
            },
          ],
        },
        {
          title: 'Линейные уравнения',
          content:
            'Учимся решать уравнения вида ax + b = c шаг за шагом и проверять ответ подстановкой.',
          durationMin: 13,
          quiz: [
            {
              question: 'Чему равен x в уравнении 2x + 4 = 10?',
              options: ['2', '3', '4', '5'],
              answer: 1,
            },
          ],
        },
        {
          title: 'Функции и графики',
          content:
            'Что такое функция, как читать график линейной функции и находить точки пересечения с осями.',
          durationMin: 16,
          quiz: [
            {
              question: 'График функции y = x проходит через точку…',
              options: ['(0,1)', '(1,1)', '(1,0)', '(2,1)'],
              answer: 1,
            },
          ],
        },
      ],
    },
    {
      title: 'Введение в экономику',
      description:
        'Как устроены деньги, рынки и решения людей. Базовые идеи экономики, которые помогут в бизнес-конкурсах и в жизни.',
      level: 'Intermediate',
      subject: 'Economics',
      direction: 'Business',
      tags: 'economics,business,finance,money',
      emoji: '📊',
      color: '#16a34a',
      lessons: [
        {
          title: 'Спрос и предложение',
          content:
            'Главный закон рынка: как цена связана со спросом и предложением и почему растут или падают цены на товары.',
          durationMin: 12,
          quiz: [
            {
              question: 'Если спрос растёт, а предложение неизменно, цена обычно…',
              options: ['падает', 'растёт', 'не меняется', 'обнуляется'],
              answer: 1,
            },
          ],
        },
        {
          title: 'Альтернативная стоимость',
          content:
            'Что мы теряем, выбирая одно вместо другого. Концепция opportunity cost на простых примерах решений школьника.',
          durationMin: 10,
          quiz: [
            {
              question: 'Альтернативная стоимость — это…',
              options: [
                'цена в магазине',
                'ценность лучшего упущенного варианта',
                'налог',
                'размер скидки',
              ],
              answer: 1,
            },
          ],
        },
        {
          title: 'Как работает стартап',
          content:
            'От идеи к бизнес-модели: что такое ценностное предложение, клиент и выручка. Готовимся к бизнес-кейсам.',
          durationMin: 15,
          quiz: [
            {
              question: 'Ценностное предложение отвечает на вопрос…',
              options: [
                'какой у нас логотип',
                'какую проблему клиента мы решаем',
                'сколько у нас сотрудников',
                'где наш офис',
              ],
              answer: 1,
            },
          ],
        },
      ],
    },
  ];

  for (const c of courses) {
    const { lessons, ...courseData } = c;
    const created = await prisma.course.create({ data: courseData });
    let order = 0;
    for (const l of lessons) {
      await prisma.lesson.create({
        data: {
          courseId: created.id,
          order: order++,
          title: l.title,
          content: l.content,
          durationMin: l.durationMin,
          videoUrl: '',
          quiz: JSON.stringify(l.quiz || []),
        },
      });
    }
  }

  // sample enrollment + progress for the demo student
  const englishCourse = await prisma.course.findFirst({
    where: { subject: 'English' },
    include: { lessons: { orderBy: { order: 'asc' } } },
  });
  if (englishCourse) {
    await prisma.enrollment.create({
      data: { userId: student.id, courseId: englishCourse.id },
    });
    await prisma.lessonProgress.create({
      data: {
        userId: student.id,
        lessonId: englishCourse.lessons[0].id,
        completed: true,
        quizScore: 100,
        completedAt: new Date(),
      },
    });
  }

  // pre-save a couple of opportunities for the demo student
  const toSave = await prisma.opportunity.findMany({
    where: { direction: { in: ['Business', 'Programming'] } },
    take: 2,
  });
  for (const o of toSave) {
    await prisma.savedOpportunity.create({
      data: { userId: student.id, opportunityId: o.id },
    });
  }

  console.log('✅ Seed complete.');
  console.log('   Admin:   admin@mentoria.io / admin123');
  console.log('   Student: student@mentoria.io / student123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
