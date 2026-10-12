import type { postService } from "@repo/core";
import { Eye, MessageSquare, Pin } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

type PostListProps = {
  posts: postService.PostListItem[];
  emptyMessage?: string;
  /** 게시판 이름을 함께 표시할지 (마이페이지 등) */
  showBoard?: boolean;
};

/**
 * 게시글 목록. 모바일에서도 읽기 쉽도록 카드형 행으로 표시한다.
 * @param props 게시글 목록과 표시 옵션
 */
export function PostList({
  posts,
  emptyMessage = "아직 글이 없습니다.",
  showBoard = false,
}: PostListProps) {
  if (posts.length === 0) {
    return <p className="py-12 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ul className="divide-y rounded-lg border">
      {posts.map((post) => (
        <li key={post.id}>
          <Link
            href={`/boards/${post.board.slug}/${post.id}`}
            className="flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              {post.isPinned && (
                <Badge variant="secondary">
                  <Pin className="size-3" />
                  고정
                </Badge>
              )}
              {post.isHidden && <Badge variant="destructive">숨김</Badge>}
              {showBoard && <Badge variant="outline">{post.board.name}</Badge>}
              <span className="truncate font-medium">{post.title}</span>
              {post._count.comments > 0 && (
                <span className="shrink-0 text-xs text-primary">[{post._count.comments}]</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{post.author.name}</span>
              <span>{formatDate(post.createdAt)}</span>
              <span className="flex items-center gap-1">
                <Eye className="size-3" />
                {post.viewCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="size-3" />
                {post._count.comments}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
