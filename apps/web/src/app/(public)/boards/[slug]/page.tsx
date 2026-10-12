import { boardService, canWriteToBoard, postService } from "@repo/core";
import { PenLine } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Pagination } from "@/components/pagination";
import { PostList } from "@/components/post-list";
import { SearchForm } from "@/components/search-form";
import { Button } from "@/components/ui/button";
import { orNotFound } from "@/lib/page";
import { getActor } from "@/lib/session";
import { toQuery } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * 게시판 이름을 페이지 제목으로 사용한다.
 * @param props 라우트 파라미터
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const board = await orNotFound(boardService.getBoardBySlug(slug));
  return { title: board.name, description: board.description ?? undefined };
}

/** 게시판 글 목록 (검색 + 페이지네이션) */
export default async function BoardPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = toQuery(await searchParams);
  const actor = await getActor();
  const board = await orNotFound(boardService.getBoardBySlug(slug, actor));
  const result = await postService.listPosts(slug, query, actor);
  // 비로그인 사용자에게도 버튼을 보여주고, 누르면 로그인 페이지로 안내한다
  const showWriteButton = actor ? canWriteToBoard(actor, board) : board.writeRole === "user";

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-2xl font-bold">{board.name}</h1>
          {board.description && (
            <p className="text-sm text-muted-foreground">{board.description}</p>
          )}
        </div>
        {showWriteButton && (
          <Button asChild>
            <Link href={`/boards/${slug}/write`}>
              <PenLine />
              글쓰기
            </Link>
          </Button>
        )}
      </div>
      <SearchForm defaultValue={query.q} />
      {query.q && (
        <p className="text-sm text-muted-foreground">
          &lsquo;{query.q}&rsquo; 검색 결과 {result.total}건
        </p>
      )}
      <PostList posts={result.items} emptyMessage={query.q ? "검색 결과가 없습니다." : undefined} />
      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        basePath={`/boards/${slug}`}
        query={query}
      />
    </main>
  );
}
