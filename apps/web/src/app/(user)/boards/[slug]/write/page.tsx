import { boardService, canWriteToBoard } from "@repo/core";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreatePostForm } from "@/components/post/post-editors";
import { orNotFound } from "@/lib/page";
import { requireSession, toActor } from "@/lib/session";

export const metadata: Metadata = { title: "글쓰기" };

type Props = { params: Promise<{ slug: string }> };

/** 새 글 작성 페이지. 쓰기 권한이 없으면 게시판으로 돌려보낸다. */
export default async function WritePage({ params }: Props) {
  const { slug } = await params;
  const actor = toActor(await requireSession(`/boards/${slug}/write`));
  const board = await orNotFound(boardService.getBoardBySlug(slug, actor));
  if (!canWriteToBoard(actor, board)) redirect(`/boards/${slug}`);

  return (
    <main className="mx-auto grid max-w-3xl gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold">{board.name} 글쓰기</h1>
      <CreatePostForm boardSlug={slug} />
    </main>
  );
}
