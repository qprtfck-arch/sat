import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { scoreOpportunity, scoreCourse, keywordScore } from '../lib/recommend.js';

const router = Router();

// Lightweight rule-based AI assistant: blends the student's free-text query
// with their profile to recommend opportunities and courses. Works fully
// offline — no external API needed.
router.post('/', async (req, res) => {
  const query = (req.body?.query || '').trim();
  const user = req.user || null;

  const [opps, courses] = await Promise.all([
    prisma.opportunity.findMany(),
    prisma.course.findMany(),
  ]);

  const rankedOpps = opps
    .map((o) => ({ item: o, score: keywordScore(query, o) + scoreOpportunity(user, o) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.item);

  const rankedCourses = courses
    .map((c) => ({ item: c, score: keywordScore(query, c) + scoreCourse(user, c) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.item);

  // build a friendly natural-language reply
  let reply;
  if (!rankedOpps.length && !rankedCourses.length) {
    reply = user?.onboarded
      ? 'Пока не нашёл точных совпадений. Попробуй уточнить запрос — например: «бизнес-конкурсы», «подготовка к IELTS» или «олимпиады по физике».'
      : 'Чтобы давать персональные рекомендации, заполни профиль в онбординге. А пока попробуй спросить про конкретное направление: бизнес, STEM, программирование, финансы.';
  } else {
    const parts = [];
    if (query) parts.push(`По запросу «${query}»`);
    else parts.push('На основе твоего профиля');
    parts.push('я подобрал');
    if (rankedOpps.length) parts.push(`${rankedOpps.length} возможностей`);
    if (rankedOpps.length && rankedCourses.length) parts.push('и');
    if (rankedCourses.length) parts.push(`${rankedCourses.length} курса(ов)`);
    reply = parts.join(' ') + '. Загляни в карточки ниже 👇';
  }

  res.json({ reply, opportunities: rankedOpps, courses: rankedCourses });
});

export default router;
