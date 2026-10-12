import { z } from "zod";

export const commentCreateSchema = z.object({
  content: z.string().trim().min(1, "댓글을 입력하세요.").max(1000, "댓글은 1000자 이하입니다."),
});

export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
