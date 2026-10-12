import { AppError } from "@repo/core";
import { redis } from "./redis";

const memoryStore = new Map<string, { count: number; resetAt: number }>();

/**
 * 고정 윈도우 방식으로 요청 횟수를 센다. Redis 가 있으면 모든 인스턴스가 카운터를 공유한다.
 * @param key 제한 키 (예: `post:create:${userId}`)
 * @param limit 윈도우당 최대 요청 수
 * @param windowSec 윈도우 길이(초)
 * @returns 허용 여부
 */
async function hit(key: string, limit: number, windowSec: number): Promise<boolean> {
  const fullKey = `rl:${key}`;
  if (redis) {
    const [[, count]] = (await redis
      .multi()
      .incr(fullKey)
      .expire(fullKey, windowSec, "NX")
      .exec()) as [[Error | null, number]];
    return count <= limit;
  }

  const now = Date.now();
  const entry = memoryStore.get(fullKey);
  if (!entry || entry.resetAt <= now) {
    // 메모리 모드(개발용)에서 무한히 커지지 않도록 비운다
    if (memoryStore.size > 10_000) memoryStore.clear();
    memoryStore.set(fullKey, { count: 1, resetAt: now + windowSec * 1000 });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

/**
 * 요청 횟수 제한을 초과하면 RATE_LIMITED 오류를 던진다.
 * @param key 제한 키
 * @param limit 윈도우당 최대 요청 수
 * @param windowSec 윈도우 길이(초)
 * @throws AppError RATE_LIMITED
 */
export async function assertRateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<void> {
  if (!(await hit(key, limit, windowSec))) {
    throw new AppError("RATE_LIMITED", "요청이 너무 많습니다. 잠시 후 다시 시도하세요.");
  }
}

/** 기능별 제한 정책. 한 곳에서 관리해 조정하기 쉽게 한다. */
export const rateLimits = {
  postCreate: { limit: 5, windowSec: 60 },
  commentCreate: { limit: 20, windowSec: 60 },
  apiRead: { limit: 120, windowSec: 60 },
} as const;
