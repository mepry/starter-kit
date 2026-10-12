import { commentService } from "@repo/core";
import { apiHandler } from "@/lib/api";

/** DELETE /api/v1/comments/:id — 댓글 삭제 */
export const DELETE = apiHandler<{ id: string }>(async ({ params, actor }) => {
  return commentService.deleteComment(actor, params.id);
});
