import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { attachUser } from './lib/auth.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import opportunityRoutes from './routes/opportunities.js';
import savedRoutes from './routes/saved.js';
import courseRoutes from './routes/courses.js';
import lessonRoutes from './routes/lessons.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';
import assistantRoutes from './routes/assistant.js';
import gamificationRoutes from './routes/gamification.js';
import aiRoutes from './routes/ai.js';

// Configured Express app (no listen / no static) — usable both as a local
// server (see index.js) and as a Vercel serverless handler (see /api/index.js).
const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(attachUser);

app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'Mentoria Hub API' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/ai', aiRoutes);

// Global error handler — return JSON 500 instead of leaking/handing.
app.use((err, _req, res, _next) => {
  console.error('[error]', err?.message || err);
  if (res.headersSent) return;
  const isDbConfig = /Environment variable not found|DATABASE_URL/.test(err?.message || '');
  res.status(500).json({
    error: isDbConfig
      ? 'Сервер не настроен: отсутствует переменная окружения DATABASE_URL.'
      : 'Внутренняя ошибка сервера',
  });
});

export default app;
