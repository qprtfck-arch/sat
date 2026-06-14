import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import {
  hashPassword,
  verifyPassword,
  signToken,
  publicUser,
  requireAuth,
} from '../lib/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password || !name)
      return res.status(400).json({ error: 'Укажите имя, email и пароль' });

    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (exists) return res.status(409).json({ error: 'Пользователь с таким email уже существует' });

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashPassword(password),
        name,
      },
    });
    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Укажите email и пароль' });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !verifyPassword(password, user.password))
      return res.status(401).json({ error: 'Неверный email или пароль' });

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка входа' });
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
