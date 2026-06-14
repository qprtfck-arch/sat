import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/auth.js';

const router = Router();

// Mark a lesson complete (optionally with a quiz score). Auto-enrolls.
router.post('/:lessonId/complete', requireAuth, async (req, res) => {
  try {
    const lesson = await prisma.lesson.findUnique({ where: { id: req.params.lessonId } });
    if (!lesson) return res.status(404).json({ error: 'Урок не найден' });

    // ensure enrollment exists so progress is meaningful
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: req.user.id, courseId: lesson.courseId } },
      update: {},
      create: { userId: req.user.id, courseId: lesson.courseId },
    });

    const quizScore = req.body?.quizScore != null ? Number(req.body.quizScore) : null;

    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: req.user.id, lessonId: lesson.id } },
      update: { completed: true, quizScore, completedAt: new Date() },
      create: {
        userId: req.user.id,
        lessonId: lesson.id,
        completed: true,
        quizScore,
        completedAt: new Date(),
      },
    });

    // recompute course progress
    const lessons = await prisma.lesson.findMany({ where: { courseId: lesson.courseId } });
    const done = await prisma.lessonProgress.count({
      where: {
        userId: req.user.id,
        completed: true,
        lessonId: { in: lessons.map((l) => l.id) },
      },
    });
    res.json({
      ok: true,
      completedLessons: done,
      total: lessons.length,
      courseCompleted: done === lessons.length,
    });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'Не удалось сохранить прогресс' });
  }
});

export default router;
