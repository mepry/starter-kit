"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";

// next-themes 0.4.6 + React 19: 클라이언트 렌더링 중 <script> 를 만나면 개발 모드 경고가 뜬다.
// 서버 HTML 에서는 실제 스크립트로 실행해 테마 깜빡임을 막고, 브라우저 재렌더링 때만 실행되지 않는 타입으로 표시한다.
// (스크립트에 suppressHydrationWarning 이 있어 type 차이로 인한 hydration 경고는 생기지 않는다)
const scriptProps = typeof window === "undefined" ? undefined : { type: "application/json" };

/**
 * 라이트/다크 테마 컨텍스트. 시스템 설정을 기본으로 따른다.
 * @param props children
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      scriptProps={scriptProps}
    >
      {children}
    </NextThemesProvider>
  );
}
