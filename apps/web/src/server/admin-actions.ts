"use server";

import { assertAdmin, boardService, postService } from "@repo/core";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { runAction, type ActionResult } from "@/lib/action";
import { auth } from "@/lib/auth";
import { cacheKeys, invalidate } from "@/lib/cache";
import { logger } from "@/lib/logger";
import { getActor } from "@/lib/session";

/**
 * 폼 데이터를 게시판 입력 객체로 변환한다. 체크박스는 체크되지 않으면 값이 없으므로 명시적으로 false 를 넣는다.
 * @param formData 게시판 폼 데이터
 */
function boardFormToInput(formData: FormData) {
  return {
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    writeRole: formData.get("writeRole"),
    isActive: formData.get("isActive") === "on" ? "true" : "false",
    sortOrder: formData.get("sortOrder") || 0,
  };
}

/**
 * 게시판을 생성하거나 수정한다. id 가 있으면 수정이다.
 * @param id 수정할 게시판 ID (생성 시 null)
 * @param _prev 이전 상태
 * @param formData 게시판 폼 데이터
 */
export async function saveBoardAction(
  id: string | null,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(
    async () => {
      const actor = await getActor();
      const input = boardFormToInput(formData);
      if (id) await boardService.updateBoard(actor, id, input);
      else await boardService.createBoard(actor, input);
      await invalidate(cacheKeys.boards);
      revalidatePath("/", "layout");
    },
    id ? "게시판을 수정했습니다." : "게시판을 만들었습니다.",
  );
}

/**
 * 게시글의 고정/숨김 상태를 바꾼다.
 * @param id 게시글 ID
 * @param flags 변경할 상태
 */
export async function setPostFlagsAction(
  id: string,
  flags: { isPinned?: boolean; isHidden?: boolean },
): Promise<ActionResult> {
  return runAction(async () => {
    await postService.setPostFlags(await getActor(), id, flags);
    revalidatePath("/", "layout");
  }, "변경했습니다.");
}

/**
 * 관리자가 게시글을 삭제한다.
 * @param id 게시글 ID
 */
export async function adminDeletePostAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await postService.deletePost(await getActor(), id);
    revalidatePath("/", "layout");
  }, "삭제했습니다.");
}

/**
 * 사용자 역할을 변경한다. Better Auth admin API 가 권한을 다시 확인한다.
 * @param userId 대상 사용자 ID
 * @param role 새 역할
 */
export async function setUserRoleAction(
  userId: string,
  role: "user" | "admin",
): Promise<ActionResult> {
  return runAction(async () => {
    const actor = assertAdmin(await getActor());
    await auth.api.setRole({ headers: await headers(), body: { userId, role } });
    logger.info({ adminId: actor.id, userId, role }, "사용자 역할 변경");
    revalidatePath("/admin/users");
  }, "역할을 변경했습니다.");
}

/**
 * 사용자를 정지하거나 해제한다. 정지하면 해당 사용자의 모든 세션이 폐기된다.
 * @param userId 대상 사용자 ID
 * @param banned 정지 여부
 */
export async function setUserBannedAction(userId: string, banned: boolean): Promise<ActionResult> {
  return runAction(
    async () => {
      const actor = assertAdmin(await getActor());
      const requestHeaders = await headers();
      if (banned) await auth.api.banUser({ headers: requestHeaders, body: { userId } });
      else await auth.api.unbanUser({ headers: requestHeaders, body: { userId } });
      logger.info({ adminId: actor.id, userId, banned }, "사용자 정지 상태 변경");
      revalidatePath("/admin/users");
    },
    banned ? "사용자를 정지했습니다." : "정지를 해제했습니다.",
  );
}
