import Redis from "ioredis";
import { logger } from "./logger";

/**
 * Redis 클라이언트를 만든다. REDIS_URL 이 없으면 null 을 반환하고,
 * 이 경우 rate limit/캐시는 프로세스 메모리로 동작한다(단일 인스턴스 개발용).
 */
function createRedis(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) {
    logger.warn(
      "REDIS_URL 이 없어 메모리 저장소를 사용합니다. 여러 인스턴스로 확장할 때는 Redis 가 필요합니다.",
    );
    return null;
  }
  const client = new Redis(url, { maxRetriesPerRequest: 2, lazyConnect: false });
  client.on("error", (error) => logger.error({ err: error }, "Redis 연결 오류"));
  return client;
}

const globalForRedis = globalThis as unknown as { redis?: Redis | null };

export const redis = globalForRedis.redis !== undefined ? globalForRedis.redis : createRedis();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
