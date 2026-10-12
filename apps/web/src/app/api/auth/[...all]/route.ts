import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// 로그인/회원가입/로그아웃/세션 등 Better Auth 엔드포인트 (웹과 모바일 공용)
export const { GET, POST } = toNextJsHandler(auth);
