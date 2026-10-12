import { boardService } from "@repo/core";
import { Shield, User } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cacheKeys, cached } from "@/lib/cache";
import { getSession } from "@/lib/session";

/** 상단 헤더: 로고, 게시판 메뉴, 로그인 상태별 메뉴 */
export async function SiteHeader() {
  const [session, boards] = await Promise.all([
    getSession(),
    cached(cacheKeys.boards, 60, () => boardService.listBoards()),
  ]);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
        <Link href="/" className="font-bold">
          Starter Kit
        </Link>
        <nav className="hidden gap-1 md:flex">
          {boards.map((board) => (
            <Button key={board.id} variant="ghost" size="sm" asChild>
              <Link href={`/boards/${board.slug}`}>{board.name}</Link>
            </Button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          {session ? (
            <>
              {session.user.role === "admin" && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin">
                    <Shield />
                    <span className="hidden sm:inline">관리자</span>
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link href="/me">
                  <User />
                  <span className="hidden sm:inline">{session.user.name}</span>
                </Link>
              </Button>
              <SignOutButton />
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">로그인</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">회원가입</Link>
              </Button>
            </>
          )}
        </div>
      </div>
      {/* 모바일: 게시판 메뉴를 가로 스크롤로 표시 */}
      <nav className="flex gap-1 overflow-x-auto border-t px-4 py-1 md:hidden">
        {boards.map((board) => (
          <Button key={board.id} variant="ghost" size="sm" asChild>
            <Link href={`/boards/${board.slug}`}>{board.name}</Link>
          </Button>
        ))}
      </nav>
    </header>
  );
}
