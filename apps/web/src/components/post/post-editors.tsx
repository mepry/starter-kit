"use client";

import { PostForm } from "@/components/post/post-form";
import { createPostAction, updatePostAction } from "@/server/post-actions";

/**
 * 새 글 작성 폼.
 * @param props.boardSlug 게시판 slug
 */
export function CreatePostForm({ boardSlug }: { boardSlug: string }) {
  return (
    <PostForm submitLabel="등록" onSave={(values) => createPostAction({ ...values, boardSlug })} />
  );
}

/**
 * 글 수정 폼.
 * @param props.postId 게시글 ID
 * @param props.defaultValues 기존 제목/본문
 */
export function EditPostForm({
  postId,
  defaultValues,
}: {
  postId: string;
  defaultValues: { title: string; content: string };
}) {
  return (
    <PostForm
      submitLabel="수정"
      defaultValues={defaultValues}
      onSave={(values) => updatePostAction(postId, values)}
    />
  );
}
