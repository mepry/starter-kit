import path from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// 모노레포 루트의 .env 를 사용한다
config({ path: path.resolve(import.meta.dirname, "../../.env"), quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // generate 는 DB 연결이 필요 없으므로, .env 가 없어도 실패하지 않게 한다
    url: process.env.DATABASE_URL ?? "",
  },
});
