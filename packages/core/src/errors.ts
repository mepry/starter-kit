export type AppErrorCode =
  "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION" | "CONFLICT" | "RATE_LIMITED";

const statusByCode: Record<AppErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION: 400,
  CONFLICT: 409,
  RATE_LIMITED: 429,
};

/** 서비스 계층에서 던지는 예상된 오류. 웹/API 어댑터가 HTTP 상태로 변환한다. */
export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly details?: unknown;

  /**
   * @param code 오류 코드
   * @param message 사용자에게 보여줄 메시지
   * @param details 검증 오류 상세 등 추가 정보
   */
  constructor(code: AppErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.details = details;
  }

  /** 오류 코드에 해당하는 HTTP 상태 코드 */
  get status(): number {
    return statusByCode[this.code];
  }
}

/**
 * 값이 AppError 인지 확인한다.
 * @param error 검사할 값
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
