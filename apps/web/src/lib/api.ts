import "server-only";
import { isAppError, type Actor } from "@repo/core";
import { NextResponse, type NextRequest } from "next/server";
import { logger } from "./logger";
import { assertRateLimit, rateLimits } from "./rate-limit";
import { getSession, toActor } from "./session";

/** 모든 REST API 의 공통 응답 형식. 모바일 앱도 이 형식을 기준으로 처리한다. */
export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: { code: string; message: string; details?: unknown } };

type RouteContext<P> = { params: Promise<P> };

type ApiHandler<P, T> = (args: { request: NextRequest; params: P; actor: Actor }) => Promise<T>;

/**
 * Route Handler 를 감싸 세션 조회, rate limit, 오류 변환, 응답 형식 통일을 처리한다.
 * @param handler 실제 처리 함수. 반환값이 data 로 들어간다.
 * @param options.status 성공 시 상태 코드 (기본 200)
 */
export function apiHandler<P = Record<string, never>, T = unknown>(
  handler: ApiHandler<P, T>,
  options: { status?: number } = {},
) {
  return async (
    request: NextRequest,
    context: RouteContext<P>,
  ): Promise<NextResponse<ApiResponse<T>>> => {
    try {
      const actor = toActor(await getSession(request.headers));
      const clientKey = actor?.id ?? request.headers.get("x-forwarded-for") ?? "anonymous";
      await assertRateLimit(
        `api:${clientKey}`,
        rateLimits.apiRead.limit,
        rateLimits.apiRead.windowSec,
      );

      const data = await handler({ request, params: await context.params, actor });
      return NextResponse.json({ data, error: null }, { status: options.status ?? 200 });
    } catch (error) {
      if (isAppError(error)) {
        return NextResponse.json(
          {
            data: null,
            error: { code: error.code, message: error.message, details: error.details },
          },
          { status: error.status },
        );
      }
      logger.error({ err: error, path: request.nextUrl.pathname }, "API 처리 중 예기치 못한 오류");
      return NextResponse.json(
        { data: null, error: { code: "INTERNAL", message: "서버 오류가 발생했습니다." } },
        { status: 500 },
      );
    }
  };
}

/**
 * 요청 본문을 JSON 으로 읽는다. 형식이 잘못되면 빈 객체를 반환해 검증 단계에서 걸러지게 한다.
 * @param request 요청
 */
export async function readJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
