import path from "node:path";
import { config as loadDotenv } from "dotenv";
import type { NextConfig } from "next";

const monorepoRoot = path.join(import.meta.dirname, "../../");

// 환경변수는 모노레포 루트의 .env 하나로 관리한다 (Next 는 기본적으로 apps/web/.env 만 읽음).
// @next/env 의 loadEnvConfig 는 Next 가 먼저 호출한 결과를 캐시해 반환하므로 루트 .env 를 읽지 못한다.
// dotenv 는 이미 설정된 값(Docker/운영 환경변수)을 덮어쓰지 않는다.
loadDotenv({ path: path.join(monorepoRoot, ".env"), quiet: true });

const nextConfig: NextConfig = {
  // Docker 이미지 크기를 줄이기 위해 독립 실행 번들을 만든다
  output: "standalone",
  // 모노레포 루트 기준으로 의존성을 추적한다
  outputFileTracingRoot: monorepoRoot,
  // 내부 패키지는 TS 소스를 그대로 export 하므로 Next 가 트랜스파일한다
  transpilePackages: ["@repo/core", "@repo/db", "@repo/validators"],
  serverExternalPackages: ["pino", "ioredis", "@prisma/client", "@prisma/adapter-pg", "pg"],
  poweredByHeader: false,
};

export default nextConfig;
