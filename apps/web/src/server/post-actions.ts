"use server";

import { commentService, postService } from "@repo/core";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { runAction, type ActionResult } from "@/lib/action";
import { assertRateLimit, rateLimits } from "@/lib/rate-limit";
import { getActor } from "@/lib/session";

/**
 * 게시글을 작성하고 상세 페이지로 이동한다.
 * @param input 게시판 slug, 제목, 본문 HTML
 */
export async function createPostAction(input: {
  boardSlug: string;
  title: string;
  content: string;
}): Promise<ActionResult> {
  let target = "";
  const result = await runAction(async () => {
    const actor = await getActor();
    if (actor) {
      const { limit, windowSec } = rateLimits.postCreate;
      await assertRateLimit(`post:create:${actor.id}`, limit, windowSec);
    }
    const post = await postService.createPost(actor, input);
    revalidatePath(`/boards/${post.boardSlug}`);
    target = `/boards/${post.boardSlug}/${post.id}`;
  });
  if (result.ok) redirect(target);
  return result;
}

/**
 * 게시글을 수정하고 상세 페이지로 이동한다.
 * @param id 게시글 ID
 * @param input 제목, 본문 HTML
 */
export async function updatePostAction(
  id: string,
  input: { title: string; content: string },
): Promise<ActionResult> {
  let target = "";
  const result = await runAction(async () => {
    const post = await postService.updatePost(await getActor(), id, input);
    revalidatePath(`/boards/${post.boardSlug}`);
    target = `/boards/${post.boardSlug}/${id}`;
  });
  if (result.ok) redirect(target);
  return result;
}

/**
 * 게시글을 삭제하고 게시판 목록으로 이동한다.
 * @param id 게시글 ID
 */
export async function deletePostAction(id: string): Promise<ActionResult> {
  let target = "/";
  const result = await runAction(async () => {
    const { boardSlug } = await postService.deletePost(await getActor(), id);
    revalidatePath(`/boards/${boardSlug}`);
    target = `/boards/${boardSlug}`;
  });
  if (result.ok) redirect(target);
  return result;
}

/**
 * 댓글을 작성한다. useActionState 와 함께 쓰는 폼 액션이다.
 * @param postId 게시글 ID (bind 로 전달)
 * @param _prev 이전 상태
 * @param formData 폼 데이터 (content)
 */
export async function createCommentAction(
  postId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await getActor();
    if (actor) {
      const { limit, windowSec } = rateLimits.commentCreate;
      await assertRateLimit(`comment:create:${actor.id}`, limit, windowSec);
    }
    await commentService.createComment(actor, postId, { content: formData.get("content") });
    revalidatePath("/boards/[slug]/[postId]", "page");
  }, "댓글을 등록했습니다.");
}

/**
 * 댓글을 삭제한다.
 * @param id 댓글 ID
 */
export async function deleteCommentAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await commentService.deleteComment(await getActor(), id);
    revalidatePath("/boards/[slug]/[postId]", "page");
  }, "댓글을 삭제했습니다.");
}
