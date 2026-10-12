import { prisma } from "@repo/db";
import { assertAdmin, type Actor } from "../actor";

export type DashboardStats = {
  userCount: number;
  newUsersToday: number;
  postCount: number;
  newPostsToday: number;
  commentCount: number;
};

/**
 * 관리자 대시보드 통계를 조회한다.
 * @param actor 요청 사용자
 */
export async function getDashboardStats(actor: Actor): Promise<DashboardStats> {
  assertAdmin(actor);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [userCount, newUsersToday, postCount, newPostsToday, commentCount] =
    await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.post.count({ where: { deletedAt: null } }),
      prisma.post.count({ where: { deletedAt: null, createdAt: { gte: startOfToday } } }),
      prisma.comment.count({ where: { deletedAt: null } }),
    ]);
  return { userCount, newUsersToday, postCount, newPostsToday, commentCount };
}
