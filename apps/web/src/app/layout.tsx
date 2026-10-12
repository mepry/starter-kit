import type { Metadata, Viewport } from "next";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Starter Kit", template: "%s | Starter Kit" },
  description: "로그인, 게시판, 관리자 페이지를 갖춘 웹앱 Starter Kit",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/**
 * 모든 페이지의 공통 레이아웃.
 * @param props children
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-dvh">
        <ThemeProvider>
          <SiteHeader />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
