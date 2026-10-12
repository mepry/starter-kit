import { boardService } from "@repo/core";
import type { Metadata } from "next";
import { BoardForm } from "@/components/admin/board-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "게시판 관리" };

/** 게시판 관리: 기존 게시판 수정과 새 게시판 생성 */
export default async function AdminBoardsPage() {
  const boards = await boardService.listBoards({ includeInactive: true });

  return (
    <>
      <h1 className="text-2xl font-bold">게시판 관리</h1>
      <Card>
        <CardHeader>
          <CardTitle>새 게시판</CardTitle>
        </CardHeader>
        <CardContent>
          <BoardForm />
        </CardContent>
      </Card>
      {boards.map((board) => (
        <Card key={board.id}>
          <CardHeader>
            <CardTitle>
              {board.name}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                /boards/{board.slug}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BoardForm board={board} />
          </CardContent>
        </Card>
      ))}
    </>
  );
}
