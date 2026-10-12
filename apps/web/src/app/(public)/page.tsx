import { boardService, postService } from "@repo/core";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { PostList } from "@/components/post-list";
import { cacheKeys, cached } from "@/lib/cache";

export const dynamic = "force-dynamic";

/** 홈: 각 게시판의 최근 글을 보여준다 */
export default async function HomePage() {
  const boards = await cached(cacheKeys.boards, 60, () => boardService.listBoards());
  const sections = await Promise.all(
    boards.map(async (board) => ({
      board,
      posts: await postService.listRecentPosts(board.slug, 5),
    })),
  );

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-8">
      <section className="grid gap-2">
        <h1 className="text-2xl font-bold sm:text-3xl">환영합니다 👋</h1>
        <p className="text-muted-foreground">
          이 Starter Kit 위에 여러분의 서비스를 만들어 보세요.
        </p>
      </section>
      <div className="grid gap-8 md:grid-cols-2">
        {sections.map(({ board, posts }) => (
          <section key={board.id} className="grid content-start gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{board.name}</h2>
              <Link
                href={`/boards/${board.slug}`}
                className="flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                더보기
                <ChevronRight className="size-4" />
              </Link>
            </div>
            <PostList posts={posts} />
          </section>
        ))}
      </div>
    </main>
  );
}
