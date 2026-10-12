import { expect, test, type Page } from "@playwright/test";

const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin1234!";

/**
 * 로그인 폼으로 로그인한다.
 * @param page Playwright 페이지
 * @param email 이메일
 * @param password 비밀번호
 */
async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("이메일").fill(email);
  await page.getByLabel("비밀번호").fill(password);
  await page.getByRole("button", { name: "로그인" }).click();
  await page.waitForURL("/");
}

test("회원가입 → 자유게시판 글쓰기 → 댓글 → 공지 작성 불가", async ({ page }) => {
  const unique = Date.now();
  await page.goto("/signup");
  await page.getByLabel("이름").fill(`테스터${unique}`.slice(0, 20));
  await page.getByLabel("이메일").fill(`user${unique}@example.com`);
  await page.getByLabel("비밀번호", { exact: true }).fill("password123");
  await page.getByLabel("비밀번호 확인").fill("password123");
  await page.getByRole("button", { name: "회원가입" }).click();
  await page.waitForURL("/");

  await page.goto("/boards/free/write");
  await page.getByLabel("제목", { exact: true }).fill(`E2E 테스트 글 ${unique}`);
  await page.getByLabel("본문").click();
  await page.keyboard.type("Playwright 로 작성한 본문입니다.");
  await page.getByRole("button", { name: "등록" }).click();
  await expect(page.getByRole("heading", { name: `E2E 테스트 글 ${unique}` })).toBeVisible();

  await page.getByRole("textbox", { name: "댓글" }).fill("첫 댓글입니다.");
  await page.getByRole("button", { name: "댓글 등록" }).click();
  await expect(page.getByText("첫 댓글입니다.")).toBeVisible();

  // 일반 사용자는 공지 게시판에 쓸 수 없다 → 목록으로 돌려보낸다
  await page.goto("/boards/notice/write");
  await expect(page).toHaveURL(/\/boards\/notice$/);
});

test("관리자는 관리자 페이지에 접근할 수 있다", async ({ page }) => {
  await login(page, adminEmail, adminPassword);
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "대시보드" })).toBeVisible();
  await page.goto("/admin/users");
  await expect(page.getByRole("heading", { name: "사용자 관리" })).toBeVisible();
});

test("관리자가 사용자를 정지하면 그 사용자는 로그인할 수 없다", async ({ page, browser }) => {
  const unique = Date.now();
  const email = `ban${unique}@example.com`;
  const signUp = await page.request.post("/api/auth/sign-up/email", {
    data: { name: "정지대상", email, password: "password123" },
    headers: { origin: "http://localhost:3000" },
  });
  expect(signUp.ok()).toBeTruthy();

  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await login(adminPage, adminEmail, adminPassword);
  await adminPage.goto(`/admin/users?q=${encodeURIComponent(email)}`);
  adminPage.once("dialog", (dialog) => dialog.accept());
  await adminPage.getByRole("button", { name: "정지", exact: true }).click();
  await expect(adminPage.getByRole("button", { name: "정지 해제" })).toBeVisible();
  await adminContext.close();

  const response = await page.request.post("/api/auth/sign-in/email", {
    data: { email, password: "password123" },
    headers: { origin: "http://localhost:3000" },
  });
  expect(response.status()).toBe(403);
});

test("비로그인 사용자는 관리자 페이지에서 로그인으로 이동하고, 로그인 후 돌아온다", async ({
  page,
}) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fadmin/);

  await page.getByLabel("이메일").fill(adminEmail);
  await page.getByLabel("비밀번호").fill(adminPassword);
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "대시보드" })).toBeVisible();
});

test("REST API 는 통일된 형식으로 응답한다", async ({ request }) => {
  const list = await request.get("/api/v1/posts?board=notice");
  expect(list.ok()).toBeTruthy();
  const body = await list.json();
  expect(body.error).toBeNull();
  expect(body.data).toHaveProperty("items");

  const create = await request.post("/api/v1/posts", {
    data: { boardSlug: "free", title: "x", content: "<p>x</p>" },
  });
  expect(create.status()).toBe(401);
  expect((await create.json()).error.code).toBe("UNAUTHORIZED");
});
