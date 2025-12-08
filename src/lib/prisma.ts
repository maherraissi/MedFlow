// src/lib/prisma.ts
// Lazy-loaded Prisma client to avoid errors at build time

let prismaInstance: any = null;

// Lazy load Prisma only when accessed
const getPrisma = () => {
  if (!prismaInstance && typeof window === "undefined") {
    try {
      const { PrismaClient } = require("@prisma/client");
      prismaInstance = new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      });
    } catch (error) {
      console.error("Failed to initialize Prisma client:", error);
    }
  }
  return prismaInstance;
};

export { getPrisma };
export const prisma = new Proxy({}, {
  get: (_target: any, prop: string | symbol) => {
    const client = getPrisma();
    return client?.[prop];
  },
});

