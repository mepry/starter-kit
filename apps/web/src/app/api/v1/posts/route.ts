import { AppError, postService } from "@repo/core";
import { apiHandler, readJson } from "@/lib/api";
import { assertRateLimit, rateLimits } from "@/lib/rate-limit";

/** GET /api/v1/posts?board=free&page=1&q=검색어 — 게시판 글 목록 */
export const GET = apiHandler(async ({ request, actor }) => {
  const { board, ...query } = Object.fromEntries(request.nextUrl.searchParams);
  if (!board) {
    throw new AppError("VALIDATION", "board 쿼리 파라미터가 필요합니다.");
  }
  return postService.listPosts(board, query, actor);
});

/** POST /api/v1/posts — 글 작성. body: { boardSlug, title, content } */
export const POST = apiHandler(
  async ({ request, actor }) => {
    if (actor) {
      const { limit, windowSec } = rateLimits.postCreate;
      await assertRateLimit(`post:create:${actor.id}`, limit, windowSec);
    }
    return postService.createPost(actor, await readJson(request));
  },
  { status: 201 },
);
