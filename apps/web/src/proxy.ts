import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * 로그인이 필요한 경로에서 세션 쿠키가 없으면 로그인 페이지로 보낸다.
 * 쿠키 존재만 빠르게 확인하는 1차 방어이고, 실제 권한 검사는 페이지와 서비스 계층에서 다시 한다.
 * @param request 요청
 */
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) {
    return NextResponse.next();
  }
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/me/:path*", "/boards/:slug/write", "/posts/:id/edit"],
};
