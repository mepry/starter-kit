import { z } from "zod";

/** HTML 태그를 제거한 순수 텍스트 길이로 본문이 비어 있는지 판단한다 */
const hasText = (html: string) => html.replace(/<[^>]*>/g, "").trim().length > 0;

export const postCreateSchema = z.object({
  boardSlug: z.string().min(1),
  title: z.string().trim().min(1, "제목을 입력하세요.").max(200, "제목은 200자 이하입니다."),
  content: z.string().max(100_000, "본문이 너무 깁니다.").refine(hasText, "본문을 입력하세요."),
});

export type PostCreateInput = z.infer<typeof postCreateSchema>;

export const postUpdateSchema = postCreateSchema.omit({ boardSlug: true });

export type PostUpdateInput = z.infer<typeof postUpdateSchema>;
