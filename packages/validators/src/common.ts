import { z } from "zod";

/** 목록 조회 공통 쿼리 (페이지네이션 + 검색) */
export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  q: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((value) => value || undefined),
});

export type ListQuery = z.infer<typeof listQuerySchema>;

export const roleSchema = z.enum(["user", "admin"]);

export type Role = z.infer<typeof roleSchema>;
