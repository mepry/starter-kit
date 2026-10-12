export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/**
 * 목록과 전체 개수로 페이지네이션 응답을 만든다.
 * @param items 현재 페이지 항목
 * @param total 전체 개수
 * @param page 현재 페이지(1부터)
 * @param pageSize 페이지 크기
 */
export function paginate<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): Paginated<T> {
  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}
