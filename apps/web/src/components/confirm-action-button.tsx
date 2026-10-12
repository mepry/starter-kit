"use client";

import { useTransition } from "react";
import type * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-state";

type ConfirmActionButtonProps = Omit<React.ComponentProps<typeof Button>, "onClick"> & {
  /** 실행할 Server Action */
  action: () => Promise<ActionResult>;
  /** 실행 전 확인 문구. 없으면 바로 실행한다. */
  confirmMessage?: string;
};

/**
 * 클릭 시 (선택적으로 확인 후) Server Action 을 실행하고 결과를 토스트로 알리는 버튼.
 * 삭제, 고정, 정지 등 단일 동작 버튼에 공통으로 사용한다.
 * @param props 버튼 속성, 액션, 확인 문구
 */
export function ConfirmActionButton({
  action,
  confirmMessage,
  children,
  disabled,
  ...props
}: ConfirmActionButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        if (result.message) toast.success(result.message);
      } else {
        toast.error(result.message ?? "처리에 실패했습니다.");
      }
    });
  };

  return (
    <Button {...props} disabled={disabled || isPending} onClick={handleClick}>
      {children}
    </Button>
  );
}
