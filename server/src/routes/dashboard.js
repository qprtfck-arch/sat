import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/auth.js';
import { scoreOpportunity, scoreCourse } from '../lib/recommend.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const user = req.user;

  // saved opportunities
  const savedRows = await prisma.savedOpportunity.findMany({
    where: { userId: user.id },
    include: { opportunity: true },
    orderBy: { createdAt: 'desc' },
  });
  const saved = savedRows.map((s) => s.opportunity);

  // enrolled courses with progress
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: { course: { include: { lessons: { select: { id: true } } } } },
  });
  const progressRows = await prisma.lessonProgress.findMany({
    where: { userId: user.id, completed: true },
    include: { lesson: { select: { courseId: true } } },
  });
  const doneByCourse = {};
  for (const p of progressRows)
    doneByCourse[p.lesson.courseId] = (doneByCourse[p.lesson.courseId] || 0) + 1;

  const courses = enrollments.map((e) => {
    const total = e.course.lessons.length;
    const done = doneByCourse[e.course.id] || 0;
    return {
      id: e.course.id,
      title: e.course.title,
      emoji: e.course.emoji,
      color: e.course.color,
      level: e.course.level,
      lessonCount: total,
      completedLessons: done,
      progressPercent: total ? Math.round((done / total) * 100) : 0,
      completed: total > 0 && done === total,
    };
  });

  // certificates = completed courses
  const certificates = courses
    .filter((c) => c.completed)
    .map((c) => ({ courseId: c.id, title: c.title, emoji: c.emoji, student: user.name }));

  // upcoming deadlines from saved opportunities
  const now = new Date();
  const deadlines = saved
    .filter((o) => o.deadline && new Date(o.deadline) >= now)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .map((o) => ({
      id: o.id,
      title: o.title,
      deadline: o.deadline,
      category: o.category,
      daysLeft: Math.ceil((new Date(o.deadline) - now) / 86400000),
    }));

  // recommendations (exclude already saved)
  const savedIds = new Set(saved.map((s) => s.id));
  const allOpps = await prisma.opportunity.findMany();
  const recommendedOpportunities = allOpps
    .filter((o) => !savedIds.has(o.id))
    .map((o) => ({ ...o, _score: scoreOpportunity(user, o) }))
    .filter((o) => o._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 4);

  const enrolledIds = new Set(courses.map((c) => c.id));
  const allCourses = await prisma.course.findMany();
  const recommendedCourses = allCourses
    .filter((c) => !enrolledIds.has(c.id))
    .map((c) => ({ ...c, _score: scoreCourse(user, c) }))
    .filter((c) => c._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 3);

  res.json({
    saved,
    courses,
    certificates,
    deadlines,
    recommendedOpportunities,
    recommendedCourses,
    stats: {
      savedCount: saved.length,
      enrolledCount: courses.length,
      completedCourses: certificates.length,
      lessonsCompleted: progressRows.length,
    },
  });
});

export default router;
