import { logger } from "./logger";
import { redis } from "./redis";

const memoryCache = new Map<string, { value: string; expiresAt: number }>();

/**
 * 자주 읽고 드물게 바뀌는 데이터를 캐시한다. 캐시 장애 시에는 원본을 그대로 조회한다.
 * @param key 캐시 키
 * @param ttlSec 유효 시간(초)
 * @param load 캐시 미스 시 원본 조회 함수
 */
export async function cached<T>(key: string, ttlSec: number, load: () => Promise<T>): Promise<T> {
  const fullKey = `cache:${key}`;
  try {
    const hit = redis ? await redis.get(fullKey) : readMemory(fullKey);
    if (hit) return JSON.parse(hit) as T;
  } catch (error) {
    logger.warn({ err: error, key }, "캐시 조회 실패");
  }

  const value = await load();
  const serialized = JSON.stringify(value);
  try {
    if (redis) await redis.set(fullKey, serialized, "EX", ttlSec);
    else memoryCache.set(fullKey, { value: serialized, expiresAt: Date.now() + ttlSec * 1000 });
  } catch (error) {
    logger.warn({ err: error, key }, "캐시 저장 실패");
  }
  return value;
}

/**
 * 캐시를 무효화한다. 데이터 변경 직후 호출한다.
 * @param key 캐시 키
 */
export async function invalidate(key: string): Promise<void> {
  const fullKey = `cache:${key}`;
  memoryCache.delete(fullKey);
  if (redis) await redis.del(fullKey);
}

/**
 * 메모리 캐시에서 만료되지 않은 값을 읽는다.
 * @param key 전체 캐시 키
 */
function readMemory(key: string): string | null {
  const entry = memoryCache.get(key);
  if (!entry || entry.expiresAt <= Date.now()) return null;
  return entry.value;
}

export const cacheKeys = {
  boards: "boards:active",
} as const;
