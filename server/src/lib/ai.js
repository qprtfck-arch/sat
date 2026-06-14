// Provider-agnostic AI layer (OpenAI-compatible Chat Completions).
// Default provider: Groq (free, no card). Works with OpenAI/Gemini/OpenRouter too.
// If no API key is set, every function falls back to deterministic offline output,
// so the app works without any key.

// Default provider: Google Gemini via its OpenAI-compatible endpoint.
const AI_BASE_URL =
  process.env.AI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai';
const AI_MODEL = process.env.AI_MODEL || 'gemini-2.0-flash';
const AI_API_KEY = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '';

export const aiEnabled = () => !!AI_API_KEY;
export const aiInfo = () => ({ enabled: aiEnabled(), model: AI_MODEL, baseUrl: AI_BASE_URL });

// Low-level: ask the model for a JSON object/array. Throws on any failure.
async function aiJSON(system, user) {
  if (!AI_API_KEY) throw new Error('AI key not configured');
  const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`AI provider error ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  return JSON.parse(content);
}

const csv = (v) =>
  (v || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

// ---------- Daily AI-Trivia ----------
export async function generateTrivia(profile) {
  const interests = csv(profile?.interests);
  const grade = profile?.grade || 10;

  if (aiEnabled()) {
    try {
      const system =
        'Ты — генератор образовательных викторин для платформы Mentoria Hub. ' +
        'Сгенерируй ОДИН интересный вопрос с 4 вариантами для ученика ' +
        `${grade} класса с интересами: ${interests.join(', ') || 'общее развитие'}. ` +
        'Ответь строго JSON-объектом: ' +
        '{"question": "...", "options": ["A","B","C","D"], "correct_index": 0, "explanation": "почему"}. ' +
        'Вопрос и варианты на русском языке.';
      const json = await aiJSON(system, 'Сгенерируй вопрос дня.');
      if (json && Array.isArray(json.options) && json.options.length === 4) {
        return {
          question: String(json.question),
          options: json.options.map(String),
          correct_index: Number(json.correct_index) || 0,
          explanation: String(json.explanation || ''),
          source: 'ai',
        };
      }
    } catch (e) {
      console.warn('[ai] trivia fallback:', e.message);
    }
  }
  return { ...pickFallbackTrivia(interests, grade), source: 'fallback' };
}

// ---------- RPG-Roadmap ----------
export async function generateRoadmap(profile, opportunities) {
  const interests = csv(profile?.interests);
  const grade = profile?.grade || 10;
  const pool = opportunities.slice(0, 12).map((o) => ({
    id: o.id,
    title: o.title,
    direction: o.direction,
    category: o.category,
  }));

  if (aiEnabled() && pool.length) {
    try {
      const system =
        'Ты — наставник Mentoria. На основе пула возможностей построй персональный ' +
        `roadmap (RPG-квесты) для ученика ${grade} класса с интересами ${interests.join(', ') || 'разное'}. ` +
        'Используй ТОЛЬКО id из пула. Верни строго JSON: ' +
        '{"quests":[{"quest_id":"q1","title":"...","description":"...","target_opportunity_id":"<id>","reward_coins":50,"depends_on":[]}]}. ' +
        'Сделай 4-6 квестов, логичная цепочка через depends_on, на русском.';
      const json = await aiJSON(system, `Пул возможностей: ${JSON.stringify(pool)}`);
      const quests = json?.quests || json;
      if (Array.isArray(quests) && quests.length) {
        return { quests: normalizeQuests(quests, opportunities), source: 'ai' };
      }
    } catch (e) {
      console.warn('[ai] roadmap fallback:', e.message);
    }
  }
  return { quests: fallbackRoadmap(profile, opportunities), source: 'fallback' };
}

function normalizeQuests(quests, opportunities) {
  const ids = new Set(opportunities.map((o) => o.id));
  return quests
    .filter((q) => q && q.title)
    .slice(0, 6)
    .map((q, i) => ({
      quest_id: q.quest_id || `q${i + 1}`,
      title: String(q.title),
      description: String(q.description || ''),
      target_opportunity_id: ids.has(q.target_opportunity_id) ? q.target_opportunity_id : null,
      reward_coins: Number(q.reward_coins) || 50,
      depends_on: Array.isArray(q.depends_on) ? q.depends_on : [],
    }));
}

// ---------- deterministic fallbacks ----------
const TRIVIA_BANK = [
  {
    question: 'Что обычно входит в сильное портфолио для поступления в университет?',
    options: ['Только оценки', 'Олимпиады, проекты и волонтёрство', 'Возраст', 'Город проживания'],
    correct_index: 1,
    explanation: 'Приёмные комиссии ценят разносторонний опыт: достижения, проекты и вовлечённость.',
  },
  {
    question: 'Что такое «ценностное предложение» стартапа?',
    options: ['Логотип', 'Какую проблему клиента решает продукт', 'Число сотрудников', 'Адрес офиса'],
    correct_index: 1,
    explanation: 'Value proposition отвечает на вопрос, какую боль клиента вы решаете.',
  },
  {
    question: 'Сколько будет 25% от 200?',
    options: ['25', '40', '50', '75'],
    correct_index: 2,
    explanation: '25% = 1/4, а 200 / 4 = 50.',
  },
  {
    question: 'Какое слово уместно в академическом эссе?',
    options: ['kids', 'therefore', 'gonna', 'stuff'],
    correct_index: 1,
    explanation: '«therefore» — формальная связка, подходящая для академического стиля.',
  },
  {
    question: 'Закон спроса: если цена растёт (при прочих равных), спрос обычно…',
    options: ['растёт', 'падает', 'не меняется', 'обнуляется'],
    correct_index: 1,
    explanation: 'Чем выше цена, тем меньше величина спроса — это базовый закон рынка.',
  },
];

function pickFallbackTrivia(interests, grade) {
  // light personalization: pick by day so it changes daily
  const dayIndex = Math.floor(Date.now() / 86400000);
  const idx = dayIndex % TRIVIA_BANK.length;
  return TRIVIA_BANK[idx];
}

function fallbackRoadmap(profile, opportunities) {
  const interests = csv(profile?.interests).map((s) => s.toLowerCase());
  const scored = opportunities
    .map((o) => {
      const tags = `${o.direction} ${o.category} ${o.tags}`.toLowerCase();
      const score = interests.reduce((a, i) => a + (tags.includes(i) ? 1 : 0), 0);
      return { o, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return scored.map(({ o }, i) => ({
    quest_id: `q${i + 1}`,
    title: `Шаг ${i + 1}: ${o.title}`,
    description: `Изучи и подай заявку: ${o.description?.slice(0, 90) || ''}…`,
    target_opportunity_id: o.id,
    reward_coins: 40 + i * 10,
    depends_on: i === 0 ? [] : [`q${i}`],
  }));
}
