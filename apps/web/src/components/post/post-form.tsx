"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { postUpdateSchema, type PostUpdateInput } from "@repo/validators";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { FieldError } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/action-state";

type PostFormProps = {
  defaultValues?: PostUpdateInput;
  submitLabel: string;
  /** 제출 시 호출할 Server Action. 성공하면 서버에서 redirect 한다. */
  onSave: (values: PostUpdateInput) => Promise<ActionResult>;
};

/**
 * 게시글 작성/수정 공용 폼.
 * @param props 초기값, 버튼 문구, 저장 액션
 */
export function PostForm({
  defaultValues = { title: "", content: "" },
  submitLabel,
  onSave,
}: PostFormProps) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PostUpdateInput>({ resolver: zodResolver(postUpdateSchema), defaultValues });

  const onSubmit = handleSubmit(async (values) => {
    const result = await onSave(values);
    if (result.ok) return;
    for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
      if (field === "title" || field === "content") setError(field, { message: messages?.[0] });
    }
    toast.error(result.message ?? "저장에 실패했습니다.");
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="title">제목</Label>
        <Input id="title" aria-invalid={!!errors.title} {...register("title")} />
        <FieldError errors={errors.title?.message} />
      </div>
      <div className="grid gap-2">
        <Label>본문</Label>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              invalid={!!errors.content}
            />
          )}
        />
        <FieldError errors={errors.content?.message} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "저장 중..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
