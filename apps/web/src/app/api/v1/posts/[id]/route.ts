import { postService } from "@repo/core";
import { apiHandler, readJson } from "@/lib/api";
import { recordView } from "@/lib/views";

type Params = { id: string };

/** GET /api/v1/posts/:id — 글 상세 (조회수 증가) */
export const GET = apiHandler<Params>(async ({ params, actor }) => {
  const post = await postService.getPost(params.id, actor);
  const counted = await recordView(post.id, actor);
  return { ...post, viewCount: post.viewCount + (counted ? 1 : 0) };
});

/** PATCH /api/v1/posts/:id — 글 수정. body: { title, content } */
export const PATCH = apiHandler<Params>(async ({ request, params, actor }) => {
  return postService.updatePost(actor, params.id, await readJson(request));
});

/** DELETE /api/v1/posts/:id — 글 삭제 */
export const DELETE = apiHandler<Params>(async ({ params, actor }) => {
  return postService.deletePost(actor, params.id);
});
