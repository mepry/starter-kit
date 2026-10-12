import { describe, expect, it } from "vitest";
import { assertAdmin } from "./actor";
import { AppError } from "./errors";
import { canModify, canWriteToBoard } from "./policies";
import { sanitizeHtml } from "./sanitize";
import { parseInput } from "./validation";
import { commentCreateSchema } from "@repo/validators";

const user = { id: "u1", role: "user" };
const admin = { id: "a1", role: "admin" };
const noticeBoard = { writeRole: "admin", isActive: true };
const freeBoard = { writeRole: "user", isActive: true };

describe("canWriteToBoard", () => {
  it("비로그인 사용자는 쓸 수 없다", () => {
    expect(canWriteToBoard(null, freeBoard)).toBe(false);
  });

  it("일반 사용자는 공지 게시판에 쓸 수 없다", () => {
    expect(canWriteToBoard(user, noticeBoard)).toBe(false);
    expect(canWriteToBoard(user, freeBoard)).toBe(true);
  });

  it("관리자는 모든 게시판에 쓸 수 있다", () => {
    expect(canWriteToBoard(admin, noticeBoard)).toBe(true);
    expect(canWriteToBoard(admin, { writeRole: "user", isActive: false })).toBe(true);
  });

  it("일반 사용자는 비활성 게시판에 쓸 수 없다", () => {
    expect(canWriteToBoard(user, { writeRole: "user", isActive: false })).toBe(false);
  });
});

describe("canModify", () => {
  it("작성자 본인과 관리자만 수정할 수 있다", () => {
    expect(canModify(user, { authorId: "u1" })).toBe(true);
    expect(canModify(user, { authorId: "u2" })).toBe(false);
    expect(canModify(admin, { authorId: "u2" })).toBe(true);
    expect(canModify(null, { authorId: "u1" })).toBe(false);
  });
});

describe("assertAdmin", () => {
  it("권한에 따라 UNAUTHORIZED / FORBIDDEN 을 던진다", () => {
    expect(() => assertAdmin(null)).toThrow(expect.objectContaining({ code: "UNAUTHORIZED" }));
    expect(() => assertAdmin(user)).toThrow(expect.objectContaining({ code: "FORBIDDEN" }));
    expect(assertAdmin(admin)).toBe(admin);
  });
});

describe("sanitizeHtml", () => {
  it("script 태그와 이벤트 속성을 제거한다", () => {
    const dirty = '<p onclick="alert(1)">hi</p><script>alert(1)</script>';
    expect(sanitizeHtml(dirty)).toBe("<p>hi</p>");
  });

  it("javascript: 링크를 제거하고 외부 링크에 rel 을 붙인다", () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).toBe(
      '<a target="_blank" rel="noopener noreferrer nofollow">x</a>',
    );
    expect(sanitizeHtml('<a href="https://a.com">x</a>')).toContain(
      'rel="noopener noreferrer nofollow"',
    );
  });
});

describe("parseInput", () => {
  it("검증 실패 시 VALIDATION AppError 를 던진다", () => {
    try {
      parseInput(commentCreateSchema, { content: "" });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).status).toBe(400);
    }
  });
});
