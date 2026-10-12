import { prisma, Prisma } from "@repo/db";
import { boardInputSchema } from "@repo/validators";
import { assertAdmin, type Actor } from "../actor";
import { AppError } from "../errors";
import { isAdmin } from "../policies";
import { parseInput } from "../validation";

export const boardSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  writeRole: true,
  isActive: true,
  sortOrder: true,
} satisfies Prisma.BoardSelect;

export type BoardSummary = Prisma.BoardGetPayload<{ select: typeof boardSelect }>;

/**
 * 게시판 목록을 정렬 순서대로 조회한다.
 * @param options.includeInactive 비활성 게시판 포함 여부 (관리자 화면용)
 */
export async function listBoards(
  options: { includeInactive?: boolean } = {},
): Promise<BoardSummary[]> {
  return prisma.board.findMany({
    where: options.includeInactive ? {} : { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: boardSelect,
  });
}

/**
 * slug 로 게시판을 조회한다. 비활성 게시판은 관리자만 볼 수 있다.
 * @param slug 게시판 slug
 * @param actor 요청 사용자
 * @throws AppError NOT_FOUND
 */
export async function getBoardBySlug(slug: string, actor: Actor = null): Promise<BoardSummary> {
  const board = await prisma.board.findUnique({ where: { slug }, select: boardSelect });
  if (!board || (!board.isActive && !isAdmin(actor))) {
    throw new AppError("NOT_FOUND", "게시판을 찾을 수 없습니다.");
  }
  return board;
}

/**
 * 게시판을 생성한다. (관리자 전용)
 * @param actor 요청 사용자
 * @param input 게시판 입력값
 */
export async function createBoard(actor: Actor, input: unknown): Promise<BoardSummary> {
  assertAdmin(actor);
  const data = parseInput(boardInputSchema, input);
  const exists = await prisma.board.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  });
  if (exists) {
    throw new AppError("CONFLICT", "이미 사용 중인 slug 입니다.");
  }
  return prisma.board.create({ data, select: boardSelect });
}

/**
 * 게시판을 수정한다. (관리자 전용)
 * @param actor 요청 사용자
 * @param id 게시판 ID
 * @param input 게시판 입력값
 */
export async function updateBoard(actor: Actor, id: string, input: unknown): Promise<BoardSummary> {
  assertAdmin(actor);
  const data = parseInput(boardInputSchema, input);
  const conflict = await prisma.board.findFirst({
    where: { slug: data.slug, NOT: { id } },
    select: { id: true },
  });
  if (conflict) {
    throw new AppError("CONFLICT", "이미 사용 중인 slug 입니다.");
  }
  return prisma.board.update({ where: { id }, data, select: boardSelect });
}
