import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mentoria-hub-dev-secret';

export function hashPassword(plain) {
  return bcrypt.hashSync(plain, 10);
}

export function verifyPassword(plain, hash) {
  return bcrypt.compareSync(plain, hash);
}

export function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: '30d',
  });
}

export function publicUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return {
    ...rest,
    interests: csvToArr(user.interests),
    subjects: csvToArr(user.subjects),
    goals: csvToArr(user.goals),
  };
}

export function csvToArr(v) {
  if (!v) return [];
  return String(v)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// Attaches req.user if a valid token is present (does not block).
export async function attachUser(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      const payload = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: payload.id } });
      if (user) req.user = user;
    }
  } catch (_e) {
    // ignore invalid token
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Доступ только для администратора' });
  next();
}

// Teacher (mentor) or admin.
export function requireTeacher(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
  if (req.user.role !== 'teacher' && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Доступ только для преподавателей' });
  next();
}
