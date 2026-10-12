import "server-only";
import type { Actor } from "@repo/core";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth, type Session } from "./auth";

/**
 * 현재 요청의 세션을 조회한다. 한 요청 안에서는 결과를 재사용한다.
 * @param requestHeaders Route Handler 에서 받은 헤더 (없으면 next/headers 사용)
 */
export const getSession = cache(async (requestHeaders?: Headers): Promise<Session | null> => {
  return auth.api.getSession({ headers: requestHeaders ?? (await headers()) });
});

/**
 * 세션을 서비스 계층에서 쓰는 Actor 로 변환한다.
 * @param session 세션 (없으면 null)
 */
export function toActor(session: Session | null): Actor {
  if (!session) return null;
  return { id: session.user.id, role: session.user.role ?? "user" };
}

/** 현재 요청의 Actor 를 반환한다. */
export async function getActor(): Promise<Actor> {
  return toActor(await getSession());
}

/**
 * 로그인이 필요한 페이지에서 사용한다. 비로그인 시 로그인 페이지로 보낸다.
 * @param callbackUrl 로그인 후 돌아올 경로
 */
export async function requireSession(callbackUrl = "/"): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return session;
}

/** 관리자 페이지에서 사용한다. 관리자가 아니면 홈으로 보낸다. */
export async function requireAdmin(): Promise<Session> {
  const session = await requireSession("/admin");
  if (session.user.role !== "admin") {
    redirect("/");
  }
  return session;
}
