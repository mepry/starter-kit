/** Server Action 의 공통 반환 형식. 클라이언트 폼에서 오류 표시에 사용한다. */
export type ActionResult = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

/** useActionState 초기값 */
export const initialActionResult: ActionResult = { ok: false };
