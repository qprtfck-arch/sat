import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/auth.js';

const router = Router();

// List saved opportunities for current user.
router.get('/', requireAuth, async (req, res) => {
  const saved = await prisma.savedOpportunity.findMany({
    where: { userId: req.user.id },
    include: { opportunity: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ items: saved.map((s) => s.opportunity), ids: saved.map((s) => s.opportunityId) });
});

router.post('/:opportunityId', requireAuth, async (req, res) => {
  try {
    await prisma.savedOpportunity.upsert({
      where: {
        userId_opportunityId: {
          userId: req.user.id,
          opportunityId: req.params.opportunityId,
        },
      },
      update: {},
      create: { userId: req.user.id, opportunityId: req.params.opportunityId },
    });
    res.json({ ok: true, saved: true });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'Не удалось сохранить' });
  }
});

router.delete('/:opportunityId', requireAuth, async (req, res) => {
  try {
    await prisma.savedOpportunity.deleteMany({
      where: { userId: req.user.id, opportunityId: req.params.opportunityId },
    });
    res.json({ ok: true, saved: false });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'Не удалось удалить из избранного' });
  }
});

export default router;
