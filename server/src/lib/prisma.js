import { PrismaClient } from '@prisma/client';

// Reuse a single PrismaClient across (warm) serverless invocations to avoid
// exhausting database connections.
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.__prisma || new PrismaClient();

if (!globalForPrisma.__prisma) globalForPrisma.__prisma = prisma;
