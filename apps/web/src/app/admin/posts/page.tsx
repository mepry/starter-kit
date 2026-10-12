import { postService } from "@repo/core";
import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmActionButton } from "@/components/confirm-action-button";
import { Pagination } from "@/components/pagination";
import { SearchForm } from "@/components/search-form";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getActor } from "@/lib/session";
import { formatDate, toQuery } from "@/lib/utils";
import { adminDeletePostAction, setPostFlagsAction } from "@/server/admin-actions";

export const metadata: Metadata = { title: "게시글 관리" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** 게시글 관리: 전체 게시판의 글을 고정/숨김/삭제한다 */
export default async function AdminPostsPage({ searchParams }: Props) {
  const query = toQuery(await searchParams);
  const result = await postService.listAllPosts(await getActor(), query);

  return (
    <>
      <h1 className="text-2xl font-bold">게시글 관리</h1>
      <SearchForm defaultValue={query.q} placeholder="제목 검색" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>게시판</TableHead>
            <TableHead>제목</TableHead>
            <TableHead>작성자</TableHead>
            <TableHead>작성일</TableHead>
            <TableHead className="text-right">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.items.map((post) => (
            <TableRow key={post.id}>
              <TableCell>
                <Badge variant="outline">{post.board.name}</Badge>
              </TableCell>
              <TableCell className="max-w-xs">
                <div className="flex items-center gap-2">
                  {post.isPinned && <Badge variant="secondary">고정</Badge>}
                  {post.isHidden && <Badge variant="destructive">숨김</Badge>}
                  <Link
                    href={`/boards/${post.board.slug}/${post.id}`}
                    className="truncate hover:underline"
                  >
                    {post.title}
                  </Link>
                </div>
              </TableCell>
              <TableCell>{post.author.name}</TableCell>
              <TableCell>{formatDate(post.createdAt)}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <ConfirmActionButton
                    variant="outline"
                    size="sm"
                    action={setPostFlagsAction.bind(null, post.id, { isPinned: !post.isPinned })}
                  >
                    {post.isPinned ? "고정 해제" : "고정"}
                  </ConfirmActionButton>
                  <ConfirmActionButton
                    variant="outline"
                    size="sm"
                    action={setPostFlagsAction.bind(null, post.id, { isHidden: !post.isHidden })}
                  >
                    {post.isHidden ? "공개" : "숨김"}
                  </ConfirmActionButton>
                  <ConfirmActionButton
                    variant="destructive"
                    size="sm"
                    confirmMessage="이 글을 삭제할까요?"
                    action={adminDeletePostAction.bind(null, post.id)}
                  >
                    삭제
                  </ConfirmActionButton>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        basePath="/admin/posts"
        query={query}
      />
    </>
  );
}
