import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind 클래스를 조건부로 합치고 충돌을 정리한다.
 * @param inputs 클래스 값들
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const dateFormatter = new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" });
const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
});

/**
 * 날짜를 한국어 형식으로 표시한다.
 * @param date 날짜
 * @param withTime 시간 포함 여부
 */
export function formatDate(date: Date | string, withTime = false): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return (withTime ? dateTimeFormatter : dateFormatter).format(value);
}

/**
 * searchParams 객체를 서비스에 넘길 단순 객체로 바꾼다. (배열 값은 첫 번째만 사용)
 * @param params Next.js searchParams
 */
export function toQuery(
  params: Record<string, string | string[] | undefined>,
): Record<string, string | undefined> {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
}
