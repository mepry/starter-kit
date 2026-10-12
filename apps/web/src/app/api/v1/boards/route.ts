import { boardService } from "@repo/core";
import { apiHandler } from "@/lib/api";
import { cacheKeys, cached } from "@/lib/cache";

/** GET /api/v1/boards — 활성 게시판 목록 */
export const GET = apiHandler(async () => {
  return cached(cacheKeys.boards, 60, () => boardService.listBoards());
});
