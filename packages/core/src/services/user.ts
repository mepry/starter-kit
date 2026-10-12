import { prisma, Prisma } from "@repo/db";
import { listQuerySchema } from "@repo/validators";
import { assertAdmin, type Actor } from "../actor";
import { paginate, type Paginated } from "../pagination";
import { parseInput } from "../validation";

const userListSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  banned: true,
  createdAt: true,
  _count: { select: { posts: true } },
} satisfies Prisma.UserSelect;

export type UserListItem = Prisma.UserGetPayload<{ select: typeof userListSelect }>;

/**
 * 사용자 목록을 조회한다. (관리자 전용)
 * 역할 변경/정지는 세션 무효화가 필요하므로 Better Auth admin API 를 사용한다.
 * @param actor 요청 사용자
 * @param query 페이지/검색 쿼리 (이름 또는 이메일)
 */
export async function listUsers(actor: Actor, query: unknown): Promise<Paginated<UserListItem>> {
  assertAdmin(actor);
  const { page, pageSize, q } = parseInput(listQuerySchema, query);
  const where: Prisma.UserWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};
  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: userListSelect,
    }),
    prisma.user.count({ where }),
  ]);
  return paginate(items, total, page, pageSize);
}
