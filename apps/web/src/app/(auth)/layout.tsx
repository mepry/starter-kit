import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

/**
 * 로그인/회원가입 공통 레이아웃. 이미 로그인했다면 홈으로 보낸다.
 * @param props children
 */
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getSession()) redirect("/");
  return (
    <main className="mx-auto flex max-w-sm flex-col justify-center px-4 py-16">{children}</main>
  );
}
