import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

export * from "./generated/prisma/client";

/**
 * PrismaClient 를 생성한다. 커넥션 풀 크기는 DB_POOL_MAX 로 조정한다.
 * @returns 새 PrismaClient 인스턴스
 */
function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DB_POOL_MAX ?? 10),
  });
  return new PrismaClient({ adapter });
}

// 개발 중 HMR 로 클라이언트가 여러 개 생기지 않도록 전역에 캐싱한다
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
