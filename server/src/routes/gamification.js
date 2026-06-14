import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, publicUser } from '../lib/auth.js';
import { awardCoins, rollItem, CASE_COST } from '../lib/coins.js';

const router = Router();

const dayKey = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
};

// Current user's gamification state.
router.get('/me', requireAuth, async (req, res) => {
  const [inventory, transactions, paired] = await Promise.all([
    prisma.inventoryItem.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } }),
    prisma.coinTransaction.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 12,
    }),
    req.user.pairedWithId
      ? prisma.user.findUnique({ where: { id: req.user.pairedWithId }, select: { name: true } })
      : null,
  ]);
  const today = dayKey(new Date());
  const checkedInToday = req.user.lastStreakDate && dayKey(req.user.lastStreakDate) === today;
  res.json({
    coins: req.user.coins,
    streak: req.user.streak,
    checkedInToday,
    pairedWith: paired?.name || null,
    inventory,
    transactions,
  });
});

// Public leaderboard (top by coins).
router.get('/leaderboard', async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: [{ coins: 'desc' }, { streak: 'desc' }],
    take: 10,
    select: { id: true, name: true, coins: true, streak: true, role: true },
  });
  res.json({ items: users });
});

// Daily streak check-in (+5 coins once per day).
router.post('/streak/checkin', requireAuth, async (req, res) => {
  const today = new Date();
  const last = req.user.lastStreakDate;
  if (last && dayKey(last) === dayKey(today)) {
    return res.json({ already: true, streak: req.user.streak, coins: req.user.coins });
  }
  // streak continues if last check-in was yesterday, else resets
  let streak = 1;
  if (last) {
    const diff = Math.round((new Date(dayKey(today)) - new Date(dayKey(last))) / 86400000);
    streak = diff === 1 ? req.user.streak + 1 : 1;
  }
  // milestone bonus every 7 days
  const bonus = streak > 0 && streak % 7 === 0 ? 50 : 0;
  await prisma.user.update({
    where: { id: req.user.id },
    data: { streak, lastStreakDate: today },
  });
  const coins = await awardCoins(req.user.id, 5 + bonus, 'streak', `day ${streak}`);
  res.json({ already: false, streak, coins, bonus });
});

// Redeem a promo code.
router.post('/promo', requireAuth, async (req, res) => {
  const code = String(req.body?.code || '').trim().toUpperCase();
  if (!code) return res.status(400).json({ error: 'Введите промокод' });

  const used = await prisma.coinTransaction.findFirst({
    where: { userId: req.user.id, type: 'promo', meta: code },
  });
  if (used) return res.status(409).json({ error: 'Промокод уже активирован' });

  if (code === 'WELCOME_BOOST') {
    const coins = await awardCoins(req.user.id, 50, 'promo', code);
    return res.json({ ok: true, message: '+50 Mentoria Coins!', coins });
  }
  if (code === 'ADMIN_PROMO') {
    await prisma.user.update({ where: { id: req.user.id }, data: { role: 'admin' } });
    await prisma.coinTransaction.create({ data: { userId: req.user.id, amount: 0, type: 'promo', meta: code } });
    return res.json({ ok: true, message: 'Выданы права администратора! Перезайдите.', role: 'admin' });
  }
  res.status(404).json({ error: 'Неизвестный промокод' });
});

// P2P gift coins (atomic).
router.post('/gift', requireAuth, async (req, res) => {
  const amount = Math.floor(Number(req.body?.amount) || 0);
  const toEmail = String(req.body?.toEmail || '').trim().toLowerCase();
  if (amount <= 0) return res.status(400).json({ error: 'Сумма должна быть больше 0' });
  if (!toEmail) return res.status(400).json({ error: 'Укажите email получателя' });

  const recipient = await prisma.user.findUnique({ where: { email: toEmail } });
  if (!recipient) return res.status(404).json({ error: 'Получатель не найден' });
  if (recipient.id === req.user.id) return res.status(400).json({ error: 'Нельзя дарить самому себе' });

  const sender = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (sender.coins < amount) return res.status(400).json({ error: 'Недостаточно монет' });

  await prisma.$transaction([
    prisma.user.update({ where: { id: sender.id }, data: { coins: { decrement: amount } } }),
    prisma.user.update({ where: { id: recipient.id }, data: { coins: { increment: amount } } }),
    prisma.coinTransaction.create({
      data: { userId: sender.id, amount: -amount, type: 'gift_out', meta: recipient.email },
    }),
    prisma.coinTransaction.create({
      data: { userId: recipient.id, amount, type: 'gift_in', meta: sender.email },
    }),
  ]);
  res.json({ ok: true, coins: sender.coins - amount, message: `Отправлено ${amount} монет` });
});

// Open a CS:GO-style case.
router.post('/case/open', requireAuth, async (req, res) => {
  if (req.user.coins < CASE_COST)
    return res.status(400).json({ error: `Нужно ${CASE_COST} монет` });

  const drop = rollItem();
  const [, , item] = await prisma.$transaction([
    prisma.user.update({ where: { id: req.user.id }, data: { coins: { decrement: CASE_COST } } }),
    prisma.coinTransaction.create({
      data: { userId: req.user.id, amount: -CASE_COST, type: 'case', meta: `${drop.rarity} ${drop.name}` },
    }),
    prisma.inventoryItem.create({
      data: { userId: req.user.id, itemType: drop.itemType, name: drop.name, rarity: drop.rarity },
    }),
  ]);
  const coins = req.user.coins - CASE_COST;
  res.json({ ok: true, item: { ...item, color: drop.color }, coins });
});

// Equip / unequip an inventory item.
router.post('/inventory/:id/equip', requireAuth, async (req, res) => {
  const item = await prisma.inventoryItem.findUnique({ where: { id: req.params.id } });
  if (!item || item.userId !== req.user.id)
    return res.status(404).json({ error: 'Предмет не найден' });
  // only one equipped at a time
  await prisma.inventoryItem.updateMany({ where: { userId: req.user.id }, data: { isEquipped: false } });
  const updated = await prisma.inventoryItem.update({
    where: { id: item.id },
    data: { isEquipped: !item.isEquipped },
  });
  res.json({ ok: true, item: updated });
});

export default router;
