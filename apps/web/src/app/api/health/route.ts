import { prisma } from "@repo/db";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

/** 로드밸런서/컨테이너 헬스체크. DB 와 Redis 연결을 확인한다. */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    if (redis) await redis.ping();
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    logger.error({ err: error }, "헬스체크 실패");
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
