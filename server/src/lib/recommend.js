import { csvToArr } from './auth.js';

// Simple tag/profile based scoring used for recommendations and the assistant.
export function scoreOpportunity(user, opp) {
  if (!user) return 0;
  const interests = csvToArr(user.interests).map((s) => s.toLowerCase());
  const subjects = csvToArr(user.subjects).map((s) => s.toLowerCase());
  const goals = csvToArr(user.goals).map((s) => s.toLowerCase());
  const oppTags = [opp.direction, opp.category, ...csvToArr(opp.tags)]
    .filter(Boolean)
    .map((s) => s.toLowerCase());

  let score = 0;
  for (const i of interests) if (oppTags.some((t) => t.includes(i) || i.includes(t))) score += 5;
  for (const s of subjects) if (oppTags.some((t) => t.includes(s) || s.includes(t))) score += 3;
  for (const g of goals) {
    if (g.includes('univer') && /scholar|research|summer|olympiad|олимпиад|стипенд/i.test(opp.category)) score += 2;
    if (g.includes('olymp') && /olympiad|олимпиад|competition|конкурс/i.test(opp.category)) score += 3;
  }

  // grade fit
  if (user.grade && opp.gradeMin <= user.grade && user.grade <= opp.gradeMax) score += 2;

  // soon deadline gets a small boost so timely items surface
  if (opp.deadline) {
    const days = (new Date(opp.deadline) - Date.now()) / 86400000;
    if (days > 0 && days < 30) score += 1;
  }
  return score;
}

export function scoreCourse(user, course) {
  if (!user) return 0;
  const interests = csvToArr(user.interests).map((s) => s.toLowerCase());
  const subjects = csvToArr(user.subjects).map((s) => s.toLowerCase());
  const courseTags = [course.direction, course.subject, ...csvToArr(course.tags)]
    .filter(Boolean)
    .map((s) => s.toLowerCase());

  let score = 0;
  for (const i of interests) if (courseTags.some((t) => t.includes(i) || i.includes(t))) score += 4;
  for (const s of subjects) if (courseTags.some((t) => t.includes(s) || s.includes(t))) score += 4;
  return score;
}

// Russian/English synonyms so a query in either language matches content.
const SYNONYMS = [
  ['business', 'бизнес', 'предприним'],
  ['startup', 'стартап'],
  ['finance', 'финанс', 'деньги', 'инвест'],
  ['math', 'математик', 'алгебр'],
  ['physics', 'физик'],
  ['biology', 'биолог'],
  ['economics', 'эконом'],
  ['programming', 'программир', 'coding', 'код', 'разработ'],
  ['olympiad', 'олимпиад'],
  ['competition', 'конкурс', 'чемпионат', 'соревнован'],
  ['scholarship', 'стипенд'],
  ['internship', 'стажиров'],
  ['volunteer', 'волонт'],
  ['research', 'исследован', 'наук', 'science'],
  ['english', 'английск', 'ielts', 'язык', 'language'],
  ['university', 'университет', 'поступл', 'college'],
  ['hackathon', 'хакатон'],
  ['summer', 'летн'],
  ['ai', 'ml', 'data', 'данны', 'искусственн'],
];

// Expand a token to all its synonym group members.
function expandToken(token) {
  const out = new Set([token]);
  for (const group of SYNONYMS) {
    if (group.some((g) => token.includes(g) || g.includes(token))) {
      for (const g of group) out.add(g);
    }
  }
  return [...out];
}

// Keyword based matching for the free-text assistant query (bilingual).
export function keywordScore(text, item) {
  const q = (text || '').toLowerCase();
  if (!q.trim()) return 0;
  const words = q.split(/[^a-zа-я0-9]+/i).filter((w) => w.length > 2);
  const hay = [item.title, item.description, item.category, item.direction, item.subject, item.tags]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  let score = 0;
  for (const w of words) {
    const variants = expandToken(w);
    if (variants.some((v) => hay.includes(v))) score += 2;
  }
  return score;
}
