import { AppError } from "./errors";

/** 요청을 보낸 사용자. 비로그인 사용자는 null 이다. */
export type Actor = {
  id: string;
  role: string;
} | null;

export type AuthenticatedActor = NonNullable<Actor>;

/**
 * 로그인 여부를 확인하고 로그인된 사용자를 반환한다.
 * @param actor 요청 사용자
 * @throws AppError UNAUTHORIZED
 */
export function assertAuthenticated(actor: Actor): AuthenticatedActor {
  if (!actor) {
    throw new AppError("UNAUTHORIZED", "로그인이 필요합니다.");
  }
  return actor;
}

/**
 * 관리자 권한을 확인한다.
 * @param actor 요청 사용자
 * @throws AppError UNAUTHORIZED | FORBIDDEN
 */
export function assertAdmin(actor: Actor): AuthenticatedActor {
  const user = assertAuthenticated(actor);
  if (user.role !== "admin") {
    throw new AppError("FORBIDDEN", "관리자 권한이 필요합니다.");
  }
  return user;
}
