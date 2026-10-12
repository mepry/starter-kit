"use client";

import type { boardService } from "@repo/core";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { FieldError } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialActionResult } from "@/lib/action-state";
import { saveBoardAction } from "@/server/admin-actions";

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

/**
 * 게시판 생성/수정 폼. board 가 있으면 수정 모드다.
 * @param props.board 수정할 게시판
 */
export function BoardForm({ board }: { board?: boardService.BoardSummary }) {
  const [state, formAction, isPending] = useActionState(
    saveBoardAction.bind(null, board?.id ?? null),
    initialActionResult,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const idPrefix = board?.id ?? "new";

  useEffect(() => {
    if (state.ok) {
      toast.success(state.message);
      if (!board) formRef.current?.reset();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, board]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-name`}>이름</Label>
        <Input id={`${idPrefix}-name`} name="name" defaultValue={board?.name} required />
        <FieldError errors={state.fieldErrors?.name} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-slug`}>slug (URL)</Label>
        <Input
          id={`${idPrefix}-slug`}
          name="slug"
          defaultValue={board?.slug}
          placeholder="free"
          required
        />
        <FieldError errors={state.fieldErrors?.slug} />
      </div>
      <div className="grid gap-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-description`}>설명</Label>
        <Input
          id={`${idPrefix}-description`}
          name="description"
          defaultValue={board?.description ?? ""}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-writeRole`}>글쓰기 권한</Label>
        <select
          id={`${idPrefix}-writeRole`}
          name="writeRole"
          defaultValue={board?.writeRole ?? "user"}
          className={selectClassName}
        >
          <option value="user">로그인한 모든 사용자</option>
          <option value="admin">관리자만 (공지용)</option>
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-sortOrder`}>정렬 순서</Label>
        <Input
          id={`${idPrefix}-sortOrder`}
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={board?.sortOrder ?? 0}
        />
      </div>
      <div className="flex items-center justify-between gap-2 sm:col-span-2">
        <Label className="font-normal">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={board?.isActive ?? true}
            className="size-4"
          />
          활성화 (끄면 일반 사용자에게 보이지 않음)
        </Label>
        <Button type="submit" disabled={isPending}>
          {isPending ? "저장 중..." : board ? "저장" : "만들기"}
        </Button>
      </div>
    </form>
  );
}
