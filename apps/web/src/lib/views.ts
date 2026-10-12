import "server-only";
import { postService, type Actor } from "@repo/core";
import { headers } from "next/headers";
import { redis } from "./redis";

const VIEW_TTL_SEC = 60 * 60;
const memoryViews = new Map<string, number>();

/**
 * 같은 사용자가 1시간 안에 다시 본 경우는 조회수에 포함하지 않는다.
 * @param key 사용자+게시글 키
 * @returns 이번 조회를 셀지 여부
 */
async function isFirstView(key: string): Promise<boolean> {
  if (redis) {
    return (await redis.set(key, "1", "EX", VIEW_TTL_SEC, "NX")) === "OK";
  }
  const now = Date.now();
  const expiresAt = memoryViews.get(key);
  if (expiresAt && expiresAt > now) return false;
  // 메모리 모드(개발용)에서 무한히 커지지 않도록 비운다
  if (memoryViews.size > 10_000) memoryViews.clear();
  memoryViews.set(key, now + VIEW_TTL_SEC * 1000);
  return true;
}

/**
 * 게시글 조회를 기록한다. 새로고침이나 댓글 작성 후 재렌더링으로 조회수가 부풀지 않게 한다.
 * @param postId 게시글 ID
 * @param actor 요청 사용자 (비로그인은 IP 기준)
 * @returns 조회수가 증가했는지 여부
 */
export async function recordView(postId: string, actor: Actor): Promise<boolean> {
  const requestHeaders = await headers();
  const viewer =
    actor?.id ?? requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  if (!(await isFirstView(`view:${postId}:${viewer}`))) return false;
  await postService.incrementViewCount(postId);
  return true;
}
