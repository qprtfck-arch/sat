import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { publicUser, requireAuth } from '../lib/auth.js';

const router = Router();

const toCsv = (v) => (Array.isArray(v) ? v.join(',') : typeof v === 'string' ? v : '');

// Update own profile / complete onboarding.
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { name, grade, interests, subjects, goals, language, onboarded } = req.body || {};
    const data = {};
    if (name !== undefined) data.name = name;
    if (grade !== undefined) data.grade = grade ? Number(grade) : null;
    if (interests !== undefined) data.interests = toCsv(interests);
    if (subjects !== undefined) data.subjects = toCsv(subjects);
    if (goals !== undefined) data.goals = toCsv(goals);
    if (language !== undefined) data.language = language;
    if (onboarded !== undefined) data.onboarded = !!onboarded;

    const user = await prisma.user.update({ where: { id: req.user.id }, data });
    res.json({ user: publicUser(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Не удалось обновить профиль' });
  }
});

export default router;
