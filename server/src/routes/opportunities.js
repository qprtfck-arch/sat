import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../lib/auth.js';

const router = Router();

const parseOpp = (b) => ({
  title: b.title,
  category: b.category,
  direction: b.direction,
  format: b.format || 'online',
  deadline: b.deadline ? new Date(b.deadline) : null,
  description: b.description || '',
  requirements: b.requirements || '',
  applyUrl: b.applyUrl || '',
  gradeMin: b.gradeMin != null ? Number(b.gradeMin) : 8,
  gradeMax: b.gradeMax != null ? Number(b.gradeMax) : 12,
  tags: Array.isArray(b.tags) ? b.tags.join(',') : b.tags || '',
  location: b.location || 'Online',
  organizer: b.organizer || 'Mentoria',
});

// Public list with filters: q, category, direction, format, grade, sort.
router.get('/', async (req, res) => {
  try {
    const { q, category, direction, format, grade, sort } = req.query;
    const where = { AND: [] };
    if (category) where.AND.push({ category });
    if (direction) where.AND.push({ direction });
    if (format) where.AND.push({ format });
    if (grade) {
      const g = Number(grade);
      where.AND.push({ gradeMin: { lte: g } });
      where.AND.push({ gradeMax: { gte: g } });
    }
    if (q) {
      where.AND.push({
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
          { tags: { contains: q } },
          { category: { contains: q } },
          { direction: { contains: q } },
        ],
      });
    }
    if (!where.AND.length) delete where.AND;

    let orderBy = { createdAt: 'desc' };
    if (sort === 'deadline') orderBy = { deadline: 'asc' };

    const items = await prisma.opportunity.findMany({ where, orderBy });
    res.json({ items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Не удалось загрузить возможности' });
  }
});

// Distinct values for filter UI.
router.get('/facets', async (_req, res) => {
  const items = await prisma.opportunity.findMany({
    select: { category: true, direction: true, format: true },
  });
  const uniq = (k) => [...new Set(items.map((i) => i[k]).filter(Boolean))].sort();
  res.json({
    categories: uniq('category'),
    directions: uniq('direction'),
    formats: uniq('format'),
  });
});

router.get('/:id', async (req, res) => {
  const item = await prisma.opportunity.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ error: 'Возможность не найдена' });
  res.json({ item });
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const item = await prisma.opportunity.create({ data: parseOpp(req.body || {}) });
    res.status(201).json({ item });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'Не удалось создать возможность' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const item = await prisma.opportunity.update({
      where: { id: req.params.id },
      data: parseOpp(req.body || {}),
    });
    res.json({ item });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'Не удалось обновить возможность' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.opportunity.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'Не удалось удалить возможность' });
  }
});

export default router;
