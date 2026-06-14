<div align="center">

# 🎓 Mentoria Hub v2.0

### Образовательные возможности, асинхронные курсы и геймификация — на одной платформе

Full-stack EdTech-платформа для хакатона **Mentoria**. Ученики находят конкурсы, олимпиады,
стипендии и стажировки, учатся через курсы Mentoria, прокачивают навыки с **AI** и зарабатывают
**Mentoria Coins** в геймификации.

![Stack](https://img.shields.io/badge/stack-fullstack-4f46e5)
![DB](https://img.shields.io/badge/DB-Supabase%20PostgreSQL-3ECF8E)
![Backend](https://img.shields.io/badge/backend-Express%20%2B%20Prisma-3aa)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite%20%2B%20Tailwind-06b6d4)
![AI](https://img.shields.io/badge/AI-Gemini%20(optional)-8E75FF)

</div>

---

## 🧩 Проблема и решение

Mentoria растёт, и Telegram + живые занятия больше не масштабируются: ученики не всегда могут
прийти на live, а возможности разбросаны по чатам и сайтам. **Mentoria Hub** объединяет в одном
продукте: **каталог возможностей**, **асинхронные курсы**, **AI-персонализацию** и **геймификацию**,
а контент добавляется через **админку/портал преподавателя** без пересборки сайта.

## ✨ Возможности

### Для учеников
- 🔎 Каталог из 12 возможностей с фильтрами (направление, категория, формат, класс, дедлайн), поиском и ❤️ избранным
- 🎓 Курсы с уроками, видео-плейсхолдером, мини-тестами и прогресс-баром
- 🧭 Онбординг (класс, интересы, предметы, цели) + рекомендации
- 🤖 **AI-ассистент** и **AI-викторина дня** (персонально по профилю)
- 🗺️ **AI RPG-Roadmap** — цепочка квестов из возможностей под цели ученика
- 📊 Личный кабинет: прогресс, дедлайны, сертификаты

### 🪙 Геймификация (Mentoria Coins)
- Монеты за уроки (+10), стрик-чек-ин (+5, бонус +50 каждый 7-й день) и викторину (+15)
- **CS:GO-кейсы**: открытие за 100 монет, редкости Common 70% · Rare 20% · Epic 8% · Legendary 2% + инвентарь
- **P2P-перевод** монет между учениками (атомарная транзакция)
- **Промокоды** (`WELCOME_BOOST` +50, `ADMIN_PROMO` → права админа)
- **Лидерборд** по монетам

### Для преподавателей и админов
- 👨‍🏫 **Портал преподавателя** (`/teach`): учитель создаёт и ведёт **свои** курсы и уроки
- 🛠️ **Админ-панель**: CRUD возможностей/курсов/уроков, статистика, пользователи

### Бонусы
🌙 Тёмная/светлая тема · 🌍 RU/EN/KZ · 📱 Адаптив · ♿ Доступность (единый набор SVG-иконок, focus-state, reduced-motion)

---

## 🧱 Технологии

| Слой | Технологии |
|------|-----------|
| **База данных** | **Supabase PostgreSQL** (через Prisma ORM), RLS включён |
| **Backend** | Node.js, Express, JWT, bcrypt |
| **Frontend** | React, Vite, React Router, Tailwind CSS |
| **AI** | OpenAI-совместимый клиент (**Google Gemini** по умолчанию) + офлайн-фоллбэк |
| **Дизайн** | SVG-иконки, шрифты Lexend + Inter |

> Данные — в реальном **PostgreSQL на Supabase**. Авторизация — на JWT (мгновенная регистрация без
> email-подтверждений, удобно для демо). Бэкенд ходит в БД через Prisma (роль `postgres`, RLS обходит),
> публичный Data API закрыт через RLS.

## 🚀 Быстрый старт

```bash
git clone https://github.com/qprtfck-arch/sat.git
cd sat
npm install

# настрой подключение к своей БД Supabase
cp server/.env.example server/.env
#  → впиши DATABASE_URL / DIRECT_URL (Supabase → Settings → Database → Connection string)
#  → (опц.) AI_API_KEY для настоящего AI (Gemini)

npm run db:setup -w server   # prisma generate + db push + seed
npm run build                # сборка фронта
npm start                    # http://localhost:4000
```

Dev-режим: `npm run dev` (Vite :5173 проксирует `/api` на :4000).

## 👤 Демо-аккаунты

| Роль | Email | Пароль |
|------|-------|--------|
| 👩‍🎓 Ученик | `student@mentoria.io` | `student123` |
| 👨‍🏫 Учитель | `teacher@mentoria.io` | `teacher123` |
| 🛠️ Админ | `admin@mentoria.io` | `admin123` |

## 🤖 AI: подключение (опционально)

AI работает **без ключа** (детерминированный офлайн-фоллбэк). Чтобы включить настоящую генерацию,
впиши в `server/.env` ключ любого OpenAI-совместимого провайдера:

```env
# Google Gemini (по умолчанию)
AI_API_KEY="<твой ключ из aistudio.google.com>"
AI_BASE_URL="https://generativelanguage.googleapis.com/v1beta/openai"
AI_MODEL="gemini-2.0-flash"
# Альтернативы: Groq (api.groq.com/openai/v1), OpenAI, OpenRouter — меняется только 3 переменные
```

## 🗺️ Пользовательский путь (демо)

1. Регистрация (ученик/учитель) → онбординг
2. Каталог → фильтры → сохранить возможности
3. Курс → урок + мини-тест → **+монеты**
4. Награды → стрик-чек-ин, AI-викторина, **открыть кейс**, лидерборд, подарить монеты
5. AI-Roadmap → персональная цепочка квестов
6. Учитель → `/teach` создаёт курс; Админ → управляет всем контентом

## 🗂️ Структура

```
mentoria-hub/
├── server/  Express + Prisma (Supabase Postgres)
│   ├── prisma/{schema.prisma, seed.js}
│   └── src/
│       ├── lib/{prisma,auth,recommend,ai,coins}.js
│       └── routes/{auth,users,opportunities,saved,courses,lessons,
│                   dashboard,admin,assistant,gamification,ai}.js
└── web/     React + Vite + Tailwind
    └── src/{pages, components, lib}
```

## 🧪 Что mock, а что настоящее

- **Настоящее:** регистрация/JWT, вся БД на Supabase Postgres, прогресс, фильтры, монеты, кейсы, переводы, CRUD.
- **Mock/демо:** видео уроков — плейсхолдеры; ссылки «Подать заявку» — демо-URL; AI без ключа — офлайн-фоллбэк.

## 🔭 Roadmap

Полноценный Supabase Auth (OAuth), реальные видео, email/Telegram-напоминания, парные стрики
(Social-to-Learn) в реальном времени, деплой на Vercel/Render.

---

<div align="center">
Сделано для хакатона <b>Mentoria</b> · Supabase PostgreSQL · Геймификация · AI · MIT License
</div>
