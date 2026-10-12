"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpInput } from "@repo/validators";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FieldError } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-client";

/** 회원가입 폼. 가입 후 자동으로 로그인된다. */
export function SignUpForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    const { error } = await signUp.email({ name, email, password });
    if (error) {
      toast.error(
        error.code === "USER_ALREADY_EXISTS"
          ? "이미 가입된 이메일입니다."
          : (error.message ?? "회원가입에 실패했습니다."),
      );
      return;
    }
    toast.success("가입을 환영합니다!");
    router.push("/");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="name">이름</Label>
        <Input
          id="name"
          autoComplete="nickname"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        <FieldError errors={errors.name?.message} />
      </div>
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
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        <FieldError errors={errors.password?.message} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
        <Input
          id="passwordConfirm"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.passwordConfirm}
          {...register("passwordConfirm")}
        />
        <FieldError errors={errors.passwordConfirm?.message} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "가입 중..." : "회원가입"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
