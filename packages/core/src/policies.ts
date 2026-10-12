import type { Actor } from "./actor";

/**
 * 관리자인지 확인한다.
 * @param actor 요청 사용자
 */
export function isAdmin(actor: Actor): boolean {
  return actor?.role === "admin";
}

/**
 * 게시판에 글을 쓸 수 있는지 확인한다.
 * @param actor 요청 사용자
 * @param board 대상 게시판의 쓰기 권한과 활성 상태
 */
export function canWriteToBoard(
  actor: Actor,
  board: { writeRole: string; isActive: boolean },
): boolean {
  if (!actor) return false;
  if (isAdmin(actor)) return true;
  return board.isActive && board.writeRole === "user";
}

/**
 * 게시글이나 댓글을 수정/삭제할 수 있는지 확인한다. 작성자 본인 또는 관리자만 가능하다.
 * @param actor 요청 사용자
 * @param resource 작성자 ID 를 가진 리소스
 */
export function canModify(actor: Actor, resource: { authorId: string }): boolean {
  if (!actor) return false;
  return isAdmin(actor) || actor.id === resource.authorId;
}
