import { statsService } from "@repo/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getActor } from "@/lib/session";

/** 관리자 대시보드: 주요 지표 */
export default async function AdminDashboardPage() {
  const stats = await statsService.getDashboardStats(await getActor());
  const tiles = [
    { label: "전체 사용자", value: stats.userCount, sub: `오늘 +${stats.newUsersToday}` },
    { label: "전체 게시글", value: stats.postCount, sub: `오늘 +${stats.newPostsToday}` },
    { label: "전체 댓글", value: stats.commentCount },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold">대시보드</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <CardHeader>
              <CardDescription>{tile.label}</CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {tile.value.toLocaleString("ko-KR")}
              </CardTitle>
            </CardHeader>
            {tile.sub && (
              <CardContent className="text-sm text-muted-foreground">{tile.sub}</CardContent>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
