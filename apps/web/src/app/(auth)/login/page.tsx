import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toQuery } from "@/lib/utils";

export const metadata: Metadata = { title: "로그인" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** 로그인 페이지 */
export default async function LoginPage({ searchParams }: Props) {
  const { callbackUrl } = toQuery(await searchParams);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">로그인</CardTitle>
        <CardDescription>이메일과 비밀번호로 로그인하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm callbackUrl={callbackUrl} />
      </CardContent>
    </Card>
  );
}
