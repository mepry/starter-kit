"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * 현재 테마를 따르는 토스트 알림 영역.
 * @param props sonner Toaster 속성
 */
function Toaster(props: ToasterProps) {
  const { theme = "system" } = useTheme();
  return (
    <Sonner theme={theme as ToasterProps["theme"]} richColors position="top-center" {...props} />
  );
}

export { Toaster };
