import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Vérifier que DATABASE_URL est défini (seulement côté serveur)
if (typeof window === 'undefined' && !process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL n\'est pas défini!');
  console.error('💡 Créez un fichier .env à la racine avec:');
  console.error('   DATABASE_URL="postgresql://user:password@host:5432/medflow?schema=public"');
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaClient: PrismaClient;

if (typeof window === 'undefined') {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  
  prismaClient = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
} else {
  prismaClient = {} as PrismaClient;
}

export const db = globalForPrisma.prisma ?? prismaClient;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
