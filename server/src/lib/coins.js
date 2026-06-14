import { prisma } from './prisma.js';

// Award (or deduct) coins and record a transaction. Returns new balance.
export async function awardCoins(userId, amount, type, meta = '') {
  const [user] = await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { coins: { increment: amount } } }),
    prisma.coinTransaction.create({ data: { userId, amount, type, meta } }),
  ]);
  return user.coins;
}

// CS:GO-style case loot tables by rarity.
export const RARITIES = [
  { rarity: 'Common', weight: 70, color: '#94a3b8' },
  { rarity: 'Rare', weight: 20, color: '#3b82f6' },
  { rarity: 'Epic', weight: 8, color: '#a855f7' },
  { rarity: 'Legendary', weight: 2, color: '#f59e0b' },
];

export const ITEMS = {
  Common: [
    { itemType: '🎒', name: 'Рюкзак новичка' },
    { itemType: '✏️', name: 'Карандаш усердия' },
    { itemType: '🔖', name: 'Закладка знаний' },
    { itemType: '📒', name: 'Базовый блокнот' },
  ],
  Rare: [
    { itemType: '🎧', name: 'Наушники фокуса' },
    { itemType: '🧭', name: 'Компас целей' },
    { itemType: '📗', name: 'Конспект отличника' },
  ],
  Epic: [
    { itemType: '🤖', name: 'AI-наставник CyberMentor' },
    { itemType: '🚀', name: 'Ускоритель прогресса' },
    { itemType: '🏅', name: 'Медаль усердия' },
  ],
  Legendary: [
    { itemType: '👑', name: 'Корона знаний' },
    { itemType: '🦄', name: 'Единорог Mentoria' },
    { itemType: '💎', name: 'Алмаз мудрости' },
  ],
};

export const CASE_COST = 100;

export function rollRarity() {
  const total = RARITIES.reduce((a, r) => a + r.weight, 0);
  let roll = Math.random() * total;
  for (const r of RARITIES) {
    if (roll < r.weight) return r;
    roll -= r.weight;
  }
  return RARITIES[0];
}

export function rollItem() {
  const r = rollRarity();
  const pool = ITEMS[r.rarity];
  const item = pool[Math.floor(Math.random() * pool.length)];
  return { ...item, rarity: r.rarity, color: r.color };
}
