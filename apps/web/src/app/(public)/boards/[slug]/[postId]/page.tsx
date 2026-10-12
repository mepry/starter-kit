import { canModify, commentService, isAdmin, postService } from "@repo/core";
import { Eye, List, Pencil, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmActionButton } from "@/components/confirm-action-button";
import { CommentForm } from "@/components/post/comment-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { orNotFound } from "@/lib/page";
import { getActor } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { recordView } from "@/lib/views";
import { deleteCommentAction, deletePostAction } from "@/server/post-actions";

type Props = { params: Promise<{ slug: string; postId: string }> };

/**
 * 게시글 제목을 페이지 제목으로 사용한다.
 * @param props 라우트 파라미터
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params;
  const post = await orNotFound(postService.getPost(postId, await getActor()));
  return { title: post.title };
}

/** 게시글 상세 + 댓글 */
export default async function PostPage({ params }: Props) {
  const { slug, postId } = await params;
  const actor = await getActor();
  const post = await orNotFound(postService.getPost(postId, actor));
  if (post.board.slug !== slug) notFound();

  const [comments, counted] = await Promise.all([
    commentService.listComments(postId, actor),
    recordView(postId, actor),
  ]);
  const canEdit = canModify(actor, post);

  return (
    <main className="mx-auto grid max-w-3xl gap-6 px-4 py-8">
      <article className="grid gap-4">
        <header className="grid gap-2 border-b pb-4">
          <Link href={`/boards/${slug}`} className="text-sm text-primary">
            {post.board.name}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            {post.isPinned && <Badge variant="secondary">고정</Badge>}
            {post.isHidden && <Badge variant="destructive">숨김</Badge>}
            <h1 className="text-xl font-bold sm:text-2xl">{post.title}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{post.author.name}</span>
            <span>{formatDate(post.createdAt, true)}</span>
            <span className="flex items-center gap-1">
              <Eye className="size-4" />
              {post.viewCount + (counted ? 1 : 0)}
            </span>
          </div>
        </header>
        {/* 본문은 저장 시 서버에서 sanitize 된 HTML 이다 */}
        <div
          className="prose prose-sm max-w-none dark:prose-invert sm:prose-base"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      <div className="flex flex-wrap justify-between gap-2 border-y py-3">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/boards/${slug}`}>
            <List />
            목록
          </Link>
        </Button>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/posts/${post.id}/edit`}>
                <Pencil />
                수정
              </Link>
            </Button>
            <ConfirmActionButton
              variant="destructive"
              size="sm"
              confirmMessage="이 글을 삭제할까요?"
              action={deletePostAction.bind(null, post.id)}
            >
              <Trash2 />
              삭제
            </ConfirmActionButton>
          </div>
        )}
      </div>

      <section className="grid gap-4" aria-labelledby="comments-title">
        <h2 id="comments-title" className="font-semibold">
          댓글 {comments.length}
        </h2>
        <ul className="grid gap-3">
          {comments.map((comment) => (
            <li key={comment.id} className="grid gap-1 rounded-lg bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{comment.author.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(comment.createdAt, true)}
                </span>
                {(actor?.id === comment.authorId || isAdmin(actor)) && (
                  <ConfirmActionButton
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-7 text-muted-foreground"
                    confirmMessage="댓글을 삭제할까요?"
                    action={deleteCommentAction.bind(null, comment.id)}
                  >
                    삭제
                  </ConfirmActionButton>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            </li>
          ))}
        </ul>
        {actor ? (
          <CommentForm postId={post.id} />
        ) : (
          <p className="rounded-lg border px-4 py-3 text-center text-sm text-muted-foreground">
            댓글을 쓰려면{" "}
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(`/boards/${slug}/${post.id}`)}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              로그인
            </Link>
            하세요.
          </p>
        )}
      </section>
    </main>
  );
}
