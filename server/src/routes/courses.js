import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin, requireTeacher } from '../lib/auth.js';

const router = Router();

// Admin manages any course; a teacher only their own.
async function ensureCanManage(req, res, courseId) {
  if (req.user.role === 'admin') return true;
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    res.status(404).json({ error: 'Курс не найден' });
    return false;
  }
  if (course.authorId !== req.user.id) {
    res.status(403).json({ error: 'Можно редактировать только свои курсы' });
    return false;
  }
  return true;
}

const parseCourse = (b) => ({
  title: b.title,
  description: b.description || '',
  level: b.level || 'Beginner',
  subject: b.subject || '',
  direction: b.direction || '',
  tags: Array.isArray(b.tags) ? b.tags.join(',') : b.tags || '',
  emoji: b.emoji || '📘',
  color: b.color || '#6366f1',
});

// List all courses with lesson counts and (if authed) enrollment + progress.
router.get('/', async (req, res) => {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'asc' },
    include: { lessons: { select: { id: true } } },
  });

  let enrolledIds = new Set();
  let progressByCourse = {};
  if (req.user) {
    const enr = await prisma.enrollment.findMany({ where: { userId: req.user.id } });
    enrolledIds = new Set(enr.map((e) => e.courseId));
    const prog = await prisma.lessonProgress.findMany({
      where: { userId: req.user.id, completed: true },
      include: { lesson: { select: { courseId: true } } },
    });
    for (const p of prog) {
      progressByCourse[p.lesson.courseId] = (progressByCourse[p.lesson.courseId] || 0) + 1;
    }
  }

  const items = courses.map((c) => {
    const total = c.lessons.length;
    const done = progressByCourse[c.id] || 0;
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      level: c.level,
      subject: c.subject,
      direction: c.direction,
      tags: c.tags,
      emoji: c.emoji,
      color: c.color,
      lessonCount: total,
      enrolled: enrolledIds.has(c.id),
      completedLessons: done,
      progressPercent: total ? Math.round((done / total) * 100) : 0,
    };
  });
  res.json({ items });
});

// Courses authored by the current teacher (mentor portal).
router.get('/mine', requireTeacher, async (req, res) => {
  const where = req.user.role === 'admin' ? {} : { authorId: req.user.id };
  const courses = await prisma.course.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { lessons: { select: { id: true } }, _count: { select: { enrollments: true } } },
  });
  const items = courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    level: c.level,
    subject: c.subject,
    direction: c.direction,
    tags: c.tags,
    emoji: c.emoji,
    color: c.color,
    lessonCount: c.lessons.length,
    enrollments: c._count.enrollments,
  }));
  res.json({ items });
});

// Single course with full lessons + per-lesson progress for current user.
router.get('/:id', async (req, res) => {
  const course = await prisma.course.findUnique({
    where: { id: req.params.id },
    include: { lessons: { orderBy: { order: 'asc' } } },
  });
  if (!course) return res.status(404).json({ error: 'Курс не найден' });

  let progressMap = {};
  let enrolled = false;
  if (req.user) {
    const enr = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user.id, courseId: course.id } },
    });
    enrolled = !!enr;
    const prog = await prisma.lessonProgress.findMany({
      where: { userId: req.user.id, lessonId: { in: course.lessons.map((l) => l.id) } },
    });
    for (const p of prog) progressMap[p.lessonId] = { completed: p.completed, quizScore: p.quizScore };
  }

  const lessons = course.lessons.map((l) => ({
    id: l.id,
    order: l.order,
    title: l.title,
    content: l.content,
    videoUrl: l.videoUrl,
    durationMin: l.durationMin,
    quiz: safeJson(l.quiz),
    progress: progressMap[l.id] || { completed: false, quizScore: null },
  }));
  const done = lessons.filter((l) => l.progress.completed).length;

  res.json({
    course: {
      id: course.id,
      title: course.title,
      description: course.description,
      level: course.level,
      subject: course.subject,
      direction: course.direction,
      emoji: course.emoji,
      color: course.color,
      enrolled,
      lessons,
      completedLessons: done,
      progressPercent: lessons.length ? Math.round((done / lessons.length) * 100) : 0,
      completed: lessons.length > 0 && done === lessons.length,
    },
  });
});

router.post('/:id/enroll', requireAuth, async (req, res) => {
  try {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: req.user.id, courseId: req.params.id } },
      update: {},
      create: { userId: req.user.id, courseId: req.params.id },
    });
    res.json({ ok: true, enrolled: true });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'Не удалось записаться на курс' });
  }
});

// ---- course CRUD (teacher owns own, admin manages all) ----
router.post('/', requireTeacher, async (req, res) => {
  const item = await prisma.course.create({
    data: { ...parseCourse(req.body || {}), authorId: req.user.id },
  });
  res.status(201).json({ item });
});

router.put('/:id', requireTeacher, async (req, res) => {
  if (!(await ensureCanManage(req, res, req.params.id))) return;
  const item = await prisma.course.update({
    where: { id: req.params.id },
    data: parseCourse(req.body || {}),
  });
  res.json({ item });
});

router.delete('/:id', requireTeacher, async (req, res) => {
  if (!(await ensureCanManage(req, res, req.params.id))) return;
  await prisma.course.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// ---- lesson CRUD nested under a course ----
router.post('/:id/lessons', requireTeacher, async (req, res) => {
  if (!(await ensureCanManage(req, res, req.params.id))) return;
  const b = req.body || {};
  const count = await prisma.lesson.count({ where: { courseId: req.params.id } });
  const lesson = await prisma.lesson.create({
    data: {
      courseId: req.params.id,
      order: b.order != null ? Number(b.order) : count,
      title: b.title || 'Новый урок',
      content: b.content || '',
      videoUrl: b.videoUrl || '',
      durationMin: b.durationMin != null ? Number(b.durationMin) : 10,
      quiz: typeof b.quiz === 'string' ? b.quiz : JSON.stringify(b.quiz || []),
    },
  });
  res.status(201).json({ lesson });
});

router.put('/lessons/:lessonId', requireTeacher, async (req, res) => {
  const existing = await prisma.lesson.findUnique({ where: { id: req.params.lessonId } });
  if (!existing) return res.status(404).json({ error: 'Урок не найден' });
  if (!(await ensureCanManage(req, res, existing.courseId))) return;
  const b = req.body || {};
  const data = {};
  if (b.title !== undefined) data.title = b.title;
  if (b.content !== undefined) data.content = b.content;
  if (b.videoUrl !== undefined) data.videoUrl = b.videoUrl;
  if (b.order !== undefined) data.order = Number(b.order);
  if (b.durationMin !== undefined) data.durationMin = Number(b.durationMin);
  if (b.quiz !== undefined) data.quiz = typeof b.quiz === 'string' ? b.quiz : JSON.stringify(b.quiz);
  const lesson = await prisma.lesson.update({ where: { id: req.params.lessonId }, data });
  res.json({ lesson });
});

router.delete('/lessons/:lessonId', requireTeacher, async (req, res) => {
  const existing = await prisma.lesson.findUnique({ where: { id: req.params.lessonId } });
  if (!existing) return res.status(404).json({ error: 'Урок не найден' });
  if (!(await ensureCanManage(req, res, existing.courseId))) return;
  await prisma.lesson.delete({ where: { id: req.params.lessonId } });
  res.json({ ok: true });
});

function safeJson(s) {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export default router;
