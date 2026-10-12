import { hashPassword } from "better-auth/crypto";
import { prisma } from "../src/index.ts";

/**
 * 기본 게시판과 관리자 계정을 생성한다. 여러 번 실행해도 안전하다(upsert).
 */
async function main(): Promise<void> {
  const boards = [
    {
      slug: "notice",
      name: "공지사항",
      description: "운영진 공지",
      writeRole: "admin",
      sortOrder: 0,
    },
    {
      slug: "free",
      name: "자유게시판",
      description: "자유롭게 이야기해요",
      writeRole: "user",
      sortOrder: 1,
    },
  ];
  for (const board of boards) {
    await prisma.board.upsert({ where: { slug: board.slug }, update: {}, create: board });
  }

  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin1234!";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const userId = crypto.randomUUID();
    await prisma.user.create({
      data: {
        id: userId,
        email,
        name: "관리자",
        emailVerified: true,
        role: "admin",
        accounts: {
          create: {
            id: crypto.randomUUID(),
            accountId: userId,
            providerId: "credential",
            password: await hashPassword(password),
          },
        },
      },
    });
  }

  process.stdout.write(`Seed 완료: 게시판 ${boards.length}개, 관리자 ${email}\n`);
}

main()
  .catch((error: unknown) => {
    process.stderr.write(`Seed 실패: ${String(error)}\n`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
