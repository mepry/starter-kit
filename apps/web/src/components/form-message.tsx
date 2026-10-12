/**
 * 필드 아래에 검증 오류를 표시한다.
 * @param props.errors 오류 메시지 목록
 */
export function FieldError({ errors }: { errors?: string[] | string }) {
  const message = Array.isArray(errors) ? errors[0] : errors;
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}
