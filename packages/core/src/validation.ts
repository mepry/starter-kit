import { z } from "zod";
import { AppError } from "./errors";

/**
 * 입력값을 Zod 스키마로 검증한다. 실패하면 필드별 오류를 담은 VALIDATION 오류를 던진다.
 * @param schema 검증 스키마
 * @param input 검증할 값
 * @returns 검증/변환된 값
 */
export function parseInput<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input);
  if (!result.success) {
    const fieldErrors = z.flattenError(result.error).fieldErrors;
    const firstMessage = result.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
    throw new AppError("VALIDATION", firstMessage, fieldErrors);
  }
  return result.data;
}
