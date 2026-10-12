import "server-only";
import { isAppError } from "@repo/core";
import { notFound } from "next/navigation";

/**
 * 서비스 호출 결과를 기다리고, NOT_FOUND 오류면 Next.js 404 페이지를 보여준다.
 * @param promise 서비스 호출
 */
export async function orNotFound<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (isAppError(error) && error.code === "NOT_FOUND") notFound();
    throw error;
  }
}
