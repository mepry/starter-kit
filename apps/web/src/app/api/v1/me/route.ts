import { assertAuthenticated } from "@repo/core";
import { apiHandler } from "@/lib/api";
import { getSession } from "@/lib/session";

/** GET /api/v1/me — 로그인한 사용자 정보 */
export const GET = apiHandler(async ({ request, actor }) => {
  assertAuthenticated(actor);
  const session = await getSession(request.headers);
  const user = session!.user;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role ?? "user",
  };
});
