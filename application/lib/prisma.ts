import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient | null {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL is not defined in environment. Prisma database features will be inactive.");
      return null;
    }
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  } catch (err) {
    console.warn("Failed to initialize Prisma Client:", err);
    return null;
  }
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient() ?? (new Proxy({}, {
    get: (_target, prop) => {
      // Return a function returning null/empty array or rejecting safely
      return () => Promise.resolve(null);
    },
  }) as unknown as PrismaClient);

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}
