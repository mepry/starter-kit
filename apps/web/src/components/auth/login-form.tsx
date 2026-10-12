"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInInput } from "@repo/validators";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FieldError } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";

/**
 * 외부 사이트로 보내는 오픈 리다이렉트를 막기 위해 내부 경로만 허용한다.
 * @param url 콜백 URL
 */
function safeCallback(url: string | undefined): string {
  return url && url.startsWith("/") && !url.startsWith("//") ? url : "/";
}

/**
 * 이메일/비밀번호 로그인 폼.
 * callbackUrl 은 서버 페이지에서 받아 전달한다. useSearchParams + Suspense 를 쓰면
 * 화면 전환 때 Suspense 표시 지연(약 0.8초)이 생기기 때문이다.
 * @param props.callbackUrl 로그인 후 돌아갈 경로
 */
export function LoginForm({ callbackUrl: rawCallbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const callbackUrl = safeCallback(rawCallbackUrl);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema) });

  const onSubmit = handleSubmit(async (values) => {
    const { error } = await signIn.email(values);
    if (error) {
      toast.error(
        error.status === 429
          ? "시도가 너무 많습니다. 잠시 후 다시 시도하세요."
          : (error.message ?? "로그인에 실패했습니다."),
      );
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        <FieldError errors={errors.email?.message} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        <FieldError errors={errors.password?.message} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "로그인 중..." : "로그인"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
          회원가입
        </Link>
      </p>
    </form>
  );
}
