import { prisma } from "@repo/db";
import { betterAuth, type SecondaryStorage } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import type Redis from "ioredis";
import { redis } from "./redis";

/**
 * Redis 를 Better Auth 보조 저장소로 연결한다. 여러 인스턴스가 rate limit 카운터를 공유한다.
 * @param client Redis 클라이언트
 */
function createSecondaryStorage(client: Redis): SecondaryStorage {
  return {
    get: (key) => client.get(key),
    getAndDelete: (key) => client.getdel(key),
    increment: async (key, ttl) => {
      const result = await client.multi().incr(key).expire(key, ttl, "NX").exec();
      return Number(result?.[0]?.[1] ?? 0);
    },
    set: async (key, value, ttl) => {
      if (ttl) await client.set(key, value, "EX", ttl);
      else await client.set(key, value);
    },
    delete: async (key) => {
      await client.del(key);
    },
  };
}

const secondaryStorage = redis ? createSecondaryStorage(redis) : undefined;

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  appName: "Starter Kit",
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secondaryStorage,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  // 환경변수를 넣으면 소셜 로그인이 켜진다 (Kakao 등도 같은 방식으로 추가)
  socialProviders:
    googleClientId && googleClientSecret
      ? { google: { clientId: googleClientId, clientSecret: googleClientSecret } }
      : {},
  session: {
    // 세션은 DB 에 저장해 관리자 화면에서 조회/폐기할 수 있게 한다
    storeSessionInDatabase: true,
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    // 운영에서만 켠다 (개발/E2E 중 반복 로그인이 막히지 않도록). 개발 중 확인하려면 AUTH_RATE_LIMIT=true
    enabled: process.env.NODE_ENV === "production" || process.env.AUTH_RATE_LIMIT === "true",
    window: 60,
    max: 100,
    storage: secondaryStorage ? "secondary-storage" : "memory",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
    },
  },
  // nextCookies 는 항상 마지막 플러그인이어야 한다
  plugins: [admin(), nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
