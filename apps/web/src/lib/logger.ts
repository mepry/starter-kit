import pino from "pino";

/**
 * 서버 전용 구조화 로거. 운영에서는 JSON 한 줄 로그로 출력돼 수집기(Loki, CloudWatch 등)에서 바로 쓸 수 있다.
 * 개발 중 보기 좋게 보려면: npm run dev | npx pino-pretty
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: { app: "web" },
  redact: ["password", "*.password", "headers.cookie", "headers.authorization"],
});
