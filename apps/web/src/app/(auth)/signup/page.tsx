import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "회원가입" };

/** 회원가입 페이지 */
export default function SignUpPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">회원가입</CardTitle>
        <CardDescription>몇 가지 정보만 입력하면 바로 시작할 수 있어요.</CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm />
      </CardContent>
    </Card>
  );
}
