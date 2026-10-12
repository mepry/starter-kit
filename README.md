# Starter Kit

로그인, 게시판(공지/자유), 관리자 페이지를 갖춘 **웹앱 Starter Kit**입니다.
새 서비스(예: 뮤지컬 관극 기록 앱)를 만들 때 이 저장소를 복사해서 도메인 기능만 추가하면 됩니다.

## 기술 스택

| 영역      | 사용 기술                                                          |
| --------- | ------------------------------------------------------------------ |
| 모노레포  | Turborepo + npm workspaces                                         |
| 웹        | Next.js 16 (App Router), React 19, TypeScript                      |
| UI        | Tailwind CSS 4, shadcn/ui 스타일 컴포넌트, 다크모드, Tiptap 에디터 |
| 인증      | Better Auth (이메일/비밀번호, admin 플러그인: 역할/정지)           |
| DB        | PostgreSQL + Prisma 7                                              |
| 캐시/제한 | Redis (없으면 메모리로 동작)                                       |
| 검증      | Zod (웹/API/모바일 공용)                                           |
| 로깅      | pino (JSON 구조화 로그)                                            |
| 테스트    | Vitest (단위), Playwright (E2E, 데스크톱+모바일)                   |

## 폴더 구조

```
apps/web/                  Next.js 앱
  src/app/(public)/        홈, 게시판 목록/상세 (누구나)
  src/app/(auth)/          로그인, 회원가입
  src/app/(user)/          글쓰기/수정, 마이페이지 (로그인 필요)
  src/app/admin/           관리자 페이지 (관리자만)
  src/app/api/v1/          REST API (모바일 앱용)
  src/server/              Server Actions (웹 폼 → 서비스 호출)
  src/lib/                 auth, session, logger, redis, cache, rate-limit
  e2e/                     Playwright 테스트
packages/core/             ★ 비즈니스 로직 (서비스, 권한 정책, HTML 정제)
packages/db/               Prisma 스키마, 마이그레이션, 시드
packages/validators/       Zod 스키마
packages/config/           tsconfig, eslint 공유 설정
```

**핵심 규칙:** 비즈니스 로직과 권한 검사는 `packages/core`에만 둡니다.
웹 페이지, Server Action, REST API는 서비스를 호출하는 얇은 어댑터입니다. 그래서 나중에 모바일 앱을 붙여도 로직이 중복되지 않습니다.

## 시작하기

사전 준비: Node.js 20.19 이상, Docker Desktop

```bash
cp .env.example .env            # BETTER_AUTH_SECRET 는 꼭 바꾸세요 (openssl rand -base64 32)
npm install                     # Prisma 클라이언트 자동 생성
docker compose up -d            # PostgreSQL + Redis
npm run db:deploy               # 마이그레이션 적용 (스키마 변경 시에는 npm run db:migrate)
npm run db:seed                 # 게시판 2개 + 관리자 계정 생성
npm run dev                     # http://localhost:3000
```

기본 관리자 계정: `admin@example.com` / `admin1234!` (`.env`의 `SEED_ADMIN_*`로 변경할 수 있습니다)

> **Docker 없이 실행하기:** `cd packages/db && npx prisma dev -d`로 로컬 Postgres를 띄울 수 있습니다. 출력된 TCP URL을 `.env`의 `DATABASE_URL`에, `DB_POOL_MAX=1`을 함께 넣으세요.
> `REDIS_URL`을 비워두면 rate limit과 캐시가 메모리로 동작합니다(서버 1대 기준).

## 자주 쓰는 명령어

| 명령                 | 설명                                                |
| -------------------- | --------------------------------------------------- |
| `npm run dev`        | 개발 서버                                           |
| `npm run dev:clean`  | 개발 캐시(`apps/web/.next`)를 지우고 개발 서버 실행 |
| `npm run build`      | 프로덕션 빌드                                       |
| `npm run lint`       | ESLint                                              |
| `npm run test`       | 단위 테스트 (DB 불필요)                             |
| `npm run test:e2e`   | E2E 테스트 (DB와 시드 필요, 개발 서버 자동 실행)    |
| `npm run typecheck`  | 타입 검사                                           |
| `npm run db:migrate` | 스키마 변경 후 마이그레이션 생성                    |
| `npm run db:studio`  | DB 데이터 GUI                                       |

처음 E2E를 실행할 때는 `npx playwright install chromium`이 필요합니다.

## 문제 해결

| 증상                                                                        | 원인                                         | 해결                                                                             |
| --------------------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------- |
| `npm run dev` 가 바로 종료됨 (`Another next dev server is already running`) | 이전 개발 서버가 백그라운드에 남아 있음      | 출력된 `taskkill /PID <번호> /F` 실행 후 다시 시작                               |
| 페이지가 계속 새로고침되고 클릭이 몇 초씩 늦음                              | 개발 서버가 강제 종료되면서 개발 캐시가 꼬임 | 서버를 끄고 `npm run dev:clean`                                                  |
| `Invalid prisma.xxx() invocation`                                           | DB가 꺼져 있음                               | `docker compose up -d` 또는 `cd packages/db && npx prisma dev start starter-kit` |

개발 서버는 터미널에서 **Ctrl + C** 로 종료하세요. 창만 닫으면 프로세스가 남을 수 있습니다.

## 권한 모델

| 역할     | 할 수 있는 일                                                                         |
| -------- | ------------------------------------------------------------------------------------- |
| 비로그인 | 게시글/댓글 읽기                                                                      |
| user     | 쓰기 권한이 `user`인 게시판에 글쓰기, 본인 글/댓글 수정·삭제                          |
| admin    | 모든 게시판에 글쓰기, 모든 글 수정·삭제·고정·숨김, 사용자 역할 변경/정지, 게시판 관리 |

게시판별 쓰기 권한은 관리자 페이지(`/admin/boards`)에서 바꿀 수 있습니다. 공지사항은 `admin`, 자유게시판은 `user`입니다.

## REST API (`/api/v1`)

응답 형식은 `{ "data": ..., "error": null }` 또는 `{ "data": null, "error": { "code", "message", "details" } }`로 통일돼 있습니다.

| 메서드           | 경로                                 | 설명                                    |
| ---------------- | ------------------------------------ | --------------------------------------- |
| GET              | `/api/v1/boards`                     | 게시판 목록                             |
| GET              | `/api/v1/posts?board=free&page=1&q=` | 글 목록                                 |
| POST             | `/api/v1/posts`                      | 글 작성 `{ boardSlug, title, content }` |
| GET/PATCH/DELETE | `/api/v1/posts/:id`                  | 글 상세/수정/삭제                       |
| GET/POST         | `/api/v1/posts/:id/comments`         | 댓글 목록/작성 `{ content }`            |
| DELETE           | `/api/v1/comments/:id`               | 댓글 삭제                               |
| GET              | `/api/v1/me`                         | 내 정보                                 |
| *                | `/api/auth/*`                        | 로그인/회원가입/로그아웃 (Better Auth)  |
| GET              | `/api/health`                        | 헬스체크 (DB, Redis)                    |

오류 코드: `UNAUTHORIZED`(401), `FORBIDDEN`(403), `NOT_FOUND`(404), `VALIDATION`(400), `CONFLICT`(409), `RATE_LIMITED`(429)

## 동시 접속 대응

- **Stateless 서버:** 세션은 DB에 저장하고 공유 상태는 Redis에 둡니다. 그래서 서버를 여러 대로 늘려도 됩니다(`docker compose --profile app up --scale web=3`, 앞단에 로드밸런서 필요).
- **커넥션 풀:** `DB_POOL_MAX`(기본 10) × 인스턴스 수가 PostgreSQL `max_connections`를 넘지 않게 설정하세요. 규모가 커지면 PgBouncer를 두는 것을 권장합니다.
- **Rate limit:** 로그인 5회/분, 가입 3회/분(운영 환경에서만 적용), 글쓰기 5회/분, 댓글 20회/분, API 120회/분. `apps/web/src/lib/rate-limit.ts`와 `auth.ts`에서 조정할 수 있습니다.
- **캐시:** 게시판 목록은 Redis에 60초 캐시하고, 관리자가 수정하면 즉시 무효화합니다.
- **조회수:** 원자적으로 증가시키고, 같은 사용자가 1시간 안에 다시 본 조회는 세지 않습니다.

## 새 기능 추가하는 법 (예: 공연 기록)

1. `packages/db/prisma/schema.prisma`에 모델 추가 → `npm run db:migrate`
2. `packages/validators/src/`에 Zod 스키마 추가
3. `packages/core/src/services/`에 서비스 추가 (권한 검사 포함) + 단위 테스트
4. `apps/web/src/app/`에 페이지, `src/server/`에 Server Action, `src/app/api/v1/`에 API 추가
5. UI 컴포넌트가 더 필요하면 `cd apps/web && npx shadcn@latest add dialog`

## 배포

- **Docker:** `docker compose --profile app up -d --build` (`apps/web/Dockerfile`, Next standalone 출력)
- 운영에서는 `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`(실제 도메인)을 반드시 설정하고, 배포 전에 `npm run db:deploy`를 실행하세요.

## 다음 단계 (모바일 앱)

`apps/mobile`(Expo)을 추가하고 Better Auth Expo 플러그인으로 로그인을 붙이면 됩니다. `packages/validators`와 `/api/v1`은 그대로 재사용합니다.
