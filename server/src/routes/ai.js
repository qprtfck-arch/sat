import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/auth.js';
import { awardCoins } from '../lib/coins.js';
import { generateTrivia, generateRoadmap, aiInfo } from '../lib/ai.js';

const router = Router();

const dayKey = () => {
  const x = new Date();
  return `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
};

router.get('/status', (_req, res) => res.json(aiInfo()));

// Daily AI-Trivia personalized by the user's profile.
router.get('/daily-trivia', requireAuth, async (req, res) => {
  const trivia = await generateTrivia({ interests: req.user.interests, grade: req.user.grade });
  const claimed = await prisma.coinTransaction.findFirst({
    where: { userId: req.user.id, type: 'trivia', meta: dayKey() },
  });
  res.json({ ...trivia, alreadyClaimed: !!claimed });
});

// Claim reward for answering today's trivia (once per day, if correct).
router.post('/daily-trivia/claim', requireAuth, async (req, res) => {
  const correct = !!req.body?.correct;
  const claimed = await prisma.coinTransaction.findFirst({
    where: { userId: req.user.id, type: 'trivia', meta: dayKey() },
  });
  if (claimed) return res.json({ already: true, coins: req.user.coins });
  if (!correct) return res.json({ already: false, awarded: 0, coins: req.user.coins });

  const coins = await awardCoins(req.user.id, 15, 'trivia', dayKey());
  res.json({ already: false, awarded: 15, coins });
});

// AI RPG-Roadmap generated from the opportunities pool + profile.
router.post('/roadmap', requireAuth, async (req, res) => {
  const opportunities = await prisma.opportunity.findMany({ orderBy: { createdAt: 'desc' } });
  const result = await generateRoadmap(
    { interests: req.user.interests, grade: req.user.grade },
    opportunities
  );
  // attach opportunity details for quests that reference one
  const byId = Object.fromEntries(opportunities.map((o) => [o.id, o]));
  const quests = result.quests.map((q) => ({
    ...q,
    opportunity: q.target_opportunity_id ? byId[q.target_opportunity_id] || null : null,
  }));
  res.json({ quests, source: result.source });
});

export default router;
