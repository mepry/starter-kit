import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  page: number;
  totalPages: number;
  /** 현재 경로 (예: /boards/free) */
  basePath: string;
  /** 페이지 이동 시 유지할 쿼리 (검색어 등) */
  query?: Record<string, string | undefined>;
};

/**
 * 페이지 번호 링크를 만든다.
 * @param basePath 경로
 * @param query 유지할 쿼리
 * @param page 이동할 페이지
 */
function pageHref(
  basePath: string,
  query: Record<string, string | undefined>,
  page: number,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value && key !== "page") params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `${basePath}?${search}` : basePath;
}

/**
 * 이전/다음과 주변 페이지 번호를 보여주는 페이지네이션.
 * @param props 페이지 정보
 */
export function Pagination({ page, totalPages, basePath, query = {} }: PaginationProps) {
  if (totalPages <= 1) return null;
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);

  return (
    <nav aria-label="페이지 이동" className="flex items-center justify-center gap-1">
      <Button variant="ghost" size="icon" asChild aria-disabled={page <= 1}>
        <Link href={pageHref(basePath, query, Math.max(1, page - 1))} aria-label="이전 페이지">
          <ChevronLeft />
        </Link>
      </Button>
      {pages.map((number) => (
        <Button key={number} variant={number === page ? "default" : "ghost"} size="icon" asChild>
          <Link
            href={pageHref(basePath, query, number)}
            aria-current={number === page ? "page" : undefined}
          >
            {number}
          </Link>
        </Button>
      ))}
      <Button variant="ghost" size="icon" asChild aria-disabled={page >= totalPages}>
        <Link
          href={pageHref(basePath, query, Math.min(totalPages, page + 1))}
          aria-label="다음 페이지"
        >
          <ChevronRight />
        </Link>
      </Button>
    </nav>
  );
}
