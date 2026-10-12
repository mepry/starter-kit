import "server-only";
import { isAppError } from "@repo/core";
import { APIError } from "better-auth/api";
import type { ActionResult } from "./action-state";
import { logger } from "./logger";

export type { ActionResult } from "./action-state";

/**
 * Server Action 본문을 실행하고 오류를 ActionResult 로 변환한다.
 * redirect()/notFound() 는 Next.js 가 처리하도록 그대로 다시 던진다.
 * @param run 실행할 작업
 * @param successMessage 성공 메시지
 */
export async function runAction(
  run: () => Promise<void>,
  successMessage?: string,
): Promise<ActionResult> {
  try {
    await run();
    return { ok: true, message: successMessage };
  } catch (error) {
    if (isAppError(error)) {
      return {
        ok: false,
        message: error.message,
        fieldErrors:
          error.code === "VALIDATION" ? (error.details as ActionResult["fieldErrors"]) : undefined,
      };
    }
    // Better Auth admin API 가 던지는 오류(권한 없음, 자기 자신 정지 등)
    if (error instanceof APIError) {
      return { ok: false, message: error.message };
    }
    if (isNextControlFlow(error)) throw error;
    logger.error({ err: error }, "Server Action 처리 중 예기치 못한 오류");
    return { ok: false, message: "처리 중 오류가 발생했습니다." };
  }
}

/**
 * Next.js 의 redirect/notFound 제어 흐름 오류인지 확인한다.
 * @param error 검사할 값
 */
function isNextControlFlow(error: unknown): boolean {
  const digest = (error as { digest?: unknown } | null)?.digest;
  return (
    typeof digest === "string" &&
    (digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_HTTP_ERROR_FALLBACK"))
  );
}
