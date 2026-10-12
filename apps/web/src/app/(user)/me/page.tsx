import { postService } from "@repo/core";
import type { Metadata } from "next";
import { Pagination } from "@/components/pagination";
import { PostList } from "@/components/post-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession, toActor } from "@/lib/session";
import { formatDate, toQuery } from "@/lib/utils";

export const metadata: Metadata = { title: "마이페이지" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** 마이페이지: 내 정보와 내가 쓴 글 */
export default async function MyPage({ searchParams }: Props) {
  const session = await requireSession("/me");
  const query = toQuery(await searchParams);
  const result = await postService.listMyPosts(toActor(session), query);
  const { user } = session;

  return (
    <main className="mx-auto grid max-w-3xl gap-6 px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            {user.name}
            {user.role === "admin" && <Badge>관리자</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-1 text-sm text-muted-foreground">
          <p>{user.email}</p>
          <p>가입일 {formatDate(user.createdAt)}</p>
        </CardContent>
      </Card>
      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">내가 쓴 글 ({result.total})</h2>
        <PostList posts={result.items} showBoard emptyMessage="아직 작성한 글이 없습니다." />
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          basePath="/me"
          query={query}
        />
      </section>
    </main>
  );
}
