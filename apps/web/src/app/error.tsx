"use client";

import { Button } from "@/components/ui/button";

/**
 * 예기치 못한 오류 화면. 서버 로그에는 digest 로 추적할 수 있다.
 * @param props.error 오류
 * @param props.reset 다시 시도
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">문제가 발생했습니다</h1>
      <p className="text-muted-foreground">잠시 후 다시 시도해 주세요.</p>
      {error.digest && <p className="text-xs text-muted-foreground">오류 코드: {error.digest}</p>}
      <Button onClick={reset}>다시 시도</Button>
    </main>
  );
}
