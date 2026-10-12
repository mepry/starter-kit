import { commentService } from "@repo/core";
import { apiHandler, readJson } from "@/lib/api";
import { assertRateLimit, rateLimits } from "@/lib/rate-limit";

type Params = { id: string };

/** GET /api/v1/posts/:id/comments — 댓글 목록 */
export const GET = apiHandler<Params>(async ({ params, actor }) => {
  return commentService.listComments(params.id, actor);
});

/** POST /api/v1/posts/:id/comments — 댓글 작성. body: { content } */
export const POST = apiHandler<Params>(
  async ({ request, params, actor }) => {
    if (actor) {
      const { limit, windowSec } = rateLimits.commentCreate;
      await assertRateLimit(`comment:create:${actor.id}`, limit, windowSec);
    }
    return commentService.createComment(actor, params.id, await readJson(request));
  },
  { status: 201 },
);
