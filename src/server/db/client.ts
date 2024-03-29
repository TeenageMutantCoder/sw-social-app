// src/server/db/client.ts
import { PrismaClient } from '@prisma/client';
import { env } from '../../env/server.mjs';

declare global {
  // eslint-disable-next-line no-unused-vars
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

if (env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
