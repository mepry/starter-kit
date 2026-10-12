import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * GET 방식 검색 폼. 자바스크립트 없이도 동작한다.
 * @param props.defaultValue 현재 검색어
 * @param props.placeholder 안내 문구
 */
export function SearchForm({
  defaultValue,
  placeholder = "검색어를 입력하세요",
}: {
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <form role="search" className="flex w-full max-w-sm gap-2">
      <Input name="q" defaultValue={defaultValue} placeholder={placeholder} aria-label="검색어" />
      <Button type="submit" variant="outline" size="icon" aria-label="검색">
        <Search />
      </Button>
    </form>
  );
}
