import { describe, expect, it } from "vitest";
import { boardInputSchema, listQuerySchema, postCreateSchema, signUpSchema } from "./index";

describe("signUpSchema", () => {
  it("비밀번호 확인이 다르면 실패한다", () => {
    const result = signUpSchema.safeParse({
      name: "홍길동",
      email: "a@b.com",
      password: "password1",
      passwordConfirm: "password2",
    });
    expect(result.success).toBe(false);
  });

  it("올바른 입력은 통과한다", () => {
    const result = signUpSchema.safeParse({
      name: "홍길동",
      email: "a@b.com",
      password: "password1",
      passwordConfirm: "password1",
    });
    expect(result.success).toBe(true);
  });
});

describe("postCreateSchema", () => {
  it("태그만 있는 본문은 빈 본문으로 취급한다", () => {
    const result = postCreateSchema.safeParse({
      boardSlug: "free",
      title: "제목",
      content: "<p></p>",
    });
    expect(result.success).toBe(false);
  });
});

describe("listQuerySchema", () => {
  it("문자열 쿼리를 숫자로 변환하고 기본값을 채운다", () => {
    expect(listQuerySchema.parse({ page: "3" })).toEqual({ page: 3, pageSize: 20, q: undefined });
  });

  it("빈 검색어는 undefined 로 바꾼다", () => {
    expect(listQuerySchema.parse({ q: "  " }).q).toBeUndefined();
  });
});

describe("boardInputSchema", () => {
  it("slug 에 대문자가 있으면 실패한다", () => {
    expect(boardInputSchema.safeParse({ slug: "Free", name: "자유" }).success).toBe(false);
  });
});
