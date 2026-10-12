"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { FieldError } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { initialActionResult } from "@/lib/action-state";
import { createCommentAction } from "@/server/post-actions";

/**
 * 댓글 작성 폼. 성공하면 입력란을 비운다.
 * @param props.postId 게시글 ID
 */
export function CommentForm({ postId }: { postId: string }) {
  const [state, formAction, isPending] = useActionState(
    createCommentAction.bind(null, postId),
    initialActionResult,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    } else if (state.message && !state.fieldErrors) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-2">
      <Textarea
        name="content"
        placeholder="댓글을 입력하세요"
        maxLength={1000}
        aria-label="댓글"
        required
      />
      <FieldError errors={state.fieldErrors?.content} />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "등록 중..." : "댓글 등록"}
        </Button>
      </div>
    </form>
  );
}
