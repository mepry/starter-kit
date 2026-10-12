import { prisma, Prisma } from "@repo/db";
import { listQuerySchema, postCreateSchema, postUpdateSchema } from "@repo/validators";
import { assertAdmin, assertAuthenticated, type Actor } from "../actor";
import { AppError } from "../errors";
import { paginate, type Paginated } from "../pagination";
import { canModify, canWriteToBoard, isAdmin } from "../policies";
import { sanitizeHtml } from "../sanitize";
import { parseInput } from "../validation";
import { getBoardBySlug } from "./board";

const authorSelect = { select: { id: true, name: true, image: true } } as const;

const postListSelect = {
  id: true,
  title: true,
  viewCount: true,
  isPinned: true,
  isHidden: true,
  createdAt: true,
  author: authorSelect,
  board: { select: { slug: true, name: true } },
  _count: { select: { comments: { where: { deletedAt: null } } } },
} satisfies Prisma.PostSelect;

const postDetailSelect = {
  ...postListSelect,
  content: true,
  updatedAt: true,
  authorId: true,
  board: { select: { slug: true, name: true, writeRole: true, isActive: true } },
} satisfies Prisma.PostSelect;

export type PostListItem = Prisma.PostGetPayload<{ select: typeof postListSelect }>;
export type PostDetail = Prisma.PostGetPayload<{ select: typeof postDetailSelect }>;

/**
 * 게시판의 글 목록을 조회한다. 고정글이 먼저, 그다음 최신순이다.
 * @param boardSlug 게시판 slug
 * @param query 페이지/검색 쿼리 (검증 전 값)
 * @param actor 요청 사용자 (관리자는 숨김글도 본다)
 */
export async function listPosts(
  boardSlug: string,
  query: unknown,
  actor: Actor = null,
): Promise<Paginated<PostListItem>> {
  const board = await getBoardBySlug(boardSlug, actor);
  const { page, pageSize, q } = parseInput(listQuerySchema, query);

  const where: Prisma.PostWhereInput = {
    boardId: board.id,
    deletedAt: null,
    ...(isAdmin(actor) ? {} : { isHidden: false }),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: postListSelect,
    }),
    prisma.post.count({ where }),
  ]);
  return paginate(items, total, page, pageSize);
}

/**
 * 최근 글을 조회한다. (홈 화면용)
 * @param boardSlug 게시판 slug
 * @param take 가져올 개수
 */
export async function listRecentPosts(boardSlug: string, take = 5): Promise<PostListItem[]> {
  return prisma.post.findMany({
    where: { board: { slug: boardSlug, isActive: true }, deletedAt: null, isHidden: false },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take,
    select: postListSelect,
  });
}

/**
 * 게시글 상세를 조회한다. 숨김글은 관리자만 볼 수 있다.
 * @param id 게시글 ID
 * @param actor 요청 사용자
 * @throws AppError NOT_FOUND
 */
export async function getPost(id: string, actor: Actor = null): Promise<PostDetail> {
  const post = await prisma.post.findFirst({
    where: { id, deletedAt: null },
    select: postDetailSelect,
  });
  if (!post || ((post.isHidden || !post.board.isActive) && !isAdmin(actor))) {
    throw new AppError("NOT_FOUND", "게시글을 찾을 수 없습니다.");
  }
  return post;
}

/**
 * 조회수를 1 올린다. 원자적 증가라 동시 요청에도 안전하다.
 * @param id 게시글 ID
 */
export async function incrementViewCount(id: string): Promise<void> {
  await prisma.post.updateMany({
    where: { id, deletedAt: null },
    data: { viewCount: { increment: 1 } },
  });
}

/**
 * 게시글을 작성한다.
 * @param actor 요청 사용자
 * @param input 게시글 입력값 (검증 전 값)
 * @returns 생성된 게시글 ID 와 게시판 slug
 */
export async function createPost(
  actor: Actor,
  input: unknown,
): Promise<{ id: string; boardSlug: string }> {
  const user = assertAuthenticated(actor);
  const data = parseInput(postCreateSchema, input);
  const board = await getBoardBySlug(data.boardSlug, user);
  if (!canWriteToBoard(user, board)) {
    throw new AppError("FORBIDDEN", "이 게시판에 글을 쓸 권한이 없습니다.");
  }
  const post = await prisma.post.create({
    data: {
      boardId: board.id,
      authorId: user.id,
      title: data.title,
      content: sanitizeHtml(data.content),
    },
    select: { id: true },
  });
  return { id: post.id, boardSlug: board.slug };
}

/**
 * 게시글을 수정한다. 작성자 또는 관리자만 가능하다.
 * @param actor 요청 사용자
 * @param id 게시글 ID
 * @param input 수정 입력값 (검증 전 값)
 */
export async function updatePost(
  actor: Actor,
  id: string,
  input: unknown,
): Promise<{ id: string; boardSlug: string }> {
  const user = assertAuthenticated(actor);
  const post = await getPost(id, user);
  if (!canModify(user, post)) {
    throw new AppError("FORBIDDEN", "수정 권한이 없습니다.");
  }
  const data = parseInput(postUpdateSchema, input);
  await prisma.post.update({
    where: { id },
    data: { title: data.title, content: sanitizeHtml(data.content) },
  });
  return { id, boardSlug: post.board.slug };
}

/**
 * 게시글을 삭제한다(soft delete). 작성자 또는 관리자만 가능하다.
 * @param actor 요청 사용자
 * @param id 게시글 ID
 * @returns 삭제된 글의 게시판 slug
 */
export async function deletePost(actor: Actor, id: string): Promise<{ boardSlug: string }> {
  const user = assertAuthenticated(actor);
  const post = await getPost(id, user);
  if (!canModify(user, post)) {
    throw new AppError("FORBIDDEN", "삭제 권한이 없습니다.");
  }
  await prisma.post.update({ where: { id }, data: { deletedAt: new Date() } });
  return { boardSlug: post.board.slug };
}

/**
 * 게시글의 고정/숨김 상태를 바꾼다. (관리자 전용)
 * @param actor 요청 사용자
 * @param id 게시글 ID
 * @param flags 변경할 상태
 */
export async function setPostFlags(
  actor: Actor,
  id: string,
  flags: { isPinned?: boolean; isHidden?: boolean },
): Promise<void> {
  assertAdmin(actor);
  await prisma.post.update({ where: { id }, data: flags });
}

/**
 * 모든 게시판의 글을 조회한다. (관리자 전용, 숨김글 포함)
 * @param actor 요청 사용자
 * @param query 페이지/검색 쿼리
 */
export async function listAllPosts(actor: Actor, query: unknown): Promise<Paginated<PostListItem>> {
  assertAdmin(actor);
  const { page, pageSize, q } = parseInput(listQuerySchema, query);
  const where: Prisma.PostWhereInput = {
    deletedAt: null,
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: postListSelect,
    }),
    prisma.post.count({ where }),
  ]);
  return paginate(items, total, page, pageSize);
}

/**
 * 특정 사용자가 쓴 글 목록을 조회한다. (마이페이지용)
 * @param actor 요청 사용자
 * @param query 페이지 쿼리
 */
export async function listMyPosts(actor: Actor, query: unknown): Promise<Paginated<PostListItem>> {
  const user = assertAuthenticated(actor);
  const { page, pageSize } = parseInput(listQuerySchema, query);
  const where: Prisma.PostWhereInput = { authorId: user.id, deletedAt: null };
  const [items, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: postListSelect,
    }),
    prisma.post.count({ where }),
  ]);
  return paginate(items, total, page, pageSize);
}
