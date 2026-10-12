import { z } from "zod";
import { roleSchema } from "./common";

export const boardInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(30)
    .regex(/^[a-z0-9-]+$/, "slug 는 영문 소문자, 숫자, - 만 사용할 수 있습니다."),
  name: z.string().trim().min(1, "게시판 이름을 입력하세요.").max(50),
  description: z.string().trim().max(200).optional(),
  writeRole: roleSchema.default("user"),
  // 폼의 "on" / "true" / "false" 문자열과 JSON boolean 을 모두 허용한다
  isActive: z.preprocess(
    (value) =>
      value === undefined ? undefined : value === true || value === "true" || value === "on",
    z.boolean().default(true),
  ),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export type BoardInput = z.infer<typeof boardInputSchema>;
