import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAdmin, publicUser } from '../lib/auth.js';

const router = Router();

router.get('/stats', requireAdmin, async (_req, res) => {
  const [users, students, opportunities, courses, lessons, enrollments, completed] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'student' } }),
      prisma.opportunity.count(),
      prisma.course.count(),
      prisma.lesson.count(),
      prisma.enrollment.count(),
      prisma.lessonProgress.count({ where: { completed: true } }),
    ]);
  res.json({
    stats: {
      users,
      students,
      opportunities,
      courses,
      lessons,
      enrollments,
      lessonsCompleted: completed,
    },
  });
});

router.get('/users', requireAdmin, async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { enrollments: true, saved: true } },
    },
  });
  res.json({
    users: users.map((u) => ({
      ...publicUser(u),
      enrollments: u._count.enrollments,
      saved: u._count.saved,
    })),
  });
});

export default router;
