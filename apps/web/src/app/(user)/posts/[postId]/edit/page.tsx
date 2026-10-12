import { canModify, postService } from "@repo/core";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EditPostForm } from "@/components/post/post-editors";
import { orNotFound } from "@/lib/page";
import { requireSession, toActor } from "@/lib/session";

export const metadata: Metadata = { title: "글 수정" };

type Props = { params: Promise<{ postId: string }> };

/** 글 수정 페이지. 작성자나 관리자가 아니면 상세 페이지로 돌려보낸다. */
export default async function EditPostPage({ params }: Props) {
  const { postId } = await params;
  const actor = toActor(await requireSession(`/posts/${postId}/edit`));
  const post = await orNotFound(postService.getPost(postId, actor));
  if (!canModify(actor, post)) redirect(`/boards/${post.board.slug}/${postId}`);

  return (
    <main className="mx-auto grid max-w-3xl gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold">글 수정</h1>
      <EditPostForm postId={post.id} defaultValues={{ title: post.title, content: post.content }} />
    </main>
  );
}
