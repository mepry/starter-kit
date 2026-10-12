import { prisma, Prisma } from "@repo/db";
import { commentCreateSchema } from "@repo/validators";
import { assertAuthenticated, type Actor } from "../actor";
import { AppError } from "../errors";
import { canModify } from "../policies";
import { parseInput } from "../validation";
import { getPost } from "./post";

const commentSelect = {
  id: true,
  content: true,
  createdAt: true,
  authorId: true,
  author: { select: { id: true, name: true, image: true } },
} satisfies Prisma.CommentSelect;

export type CommentItem = Prisma.CommentGetPayload<{ select: typeof commentSelect }>;

/**
 * 게시글의 댓글을 작성순으로 조회한다.
 * @param postId 게시글 ID
 * @param actor 요청 사용자 (숨김글 접근 확인용)
 */
export async function listComments(postId: string, actor: Actor = null): Promise<CommentItem[]> {
  await getPost(postId, actor);
  return prisma.comment.findMany({
    where: { postId, deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: commentSelect,
  });
}

/**
 * 댓글을 작성한다.
 * @param actor 요청 사용자
 * @param postId 게시글 ID
 * @param input 댓글 입력값 (검증 전 값)
 */
export async function createComment(
  actor: Actor,
  postId: string,
  input: unknown,
): Promise<CommentItem> {
  const user = assertAuthenticated(actor);
  await getPost(postId, user);
  const data = parseInput(commentCreateSchema, input);
  return prisma.comment.create({
    data: { postId, authorId: user.id, content: data.content },
    select: commentSelect,
  });
}

/**
 * 댓글을 삭제한다(soft delete). 작성자 또는 관리자만 가능하다.
 * @param actor 요청 사용자
 * @param id 댓글 ID
 * @returns 댓글이 달린 게시글 ID
 */
export async function deleteComment(actor: Actor, id: string): Promise<{ postId: string }> {
  const user = assertAuthenticated(actor);
  const comment = await prisma.comment.findFirst({
    where: { id, deletedAt: null },
    select: { authorId: true, postId: true },
  });
  if (!comment) {
    throw new AppError("NOT_FOUND", "댓글을 찾을 수 없습니다.");
  }
  if (!canModify(user, comment)) {
    throw new AppError("FORBIDDEN", "삭제 권한이 없습니다.");
  }
  await prisma.comment.update({ where: { id }, data: { deletedAt: new Date() } });
  return { postId: comment.postId };
}
