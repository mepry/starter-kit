import { FileText, LayoutDashboard, LayoutList, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: { default: "관리자", template: "%s | 관리자" } };

const navItems = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/users", label: "사용자", icon: Users },
  { href: "/admin/boards", label: "게시판", icon: LayoutList },
  { href: "/admin/posts", label: "게시글", icon: FileText },
];

/**
 * 관리자 영역 레이아웃. 관리자가 아니면 진입할 수 없다.
 * @param props children
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[180px_1fr]">
      <nav aria-label="관리자 메뉴" className="flex gap-1 overflow-x-auto md:flex-col">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Button key={href} variant="ghost" className="justify-start" asChild>
            <Link href={href}>
              <Icon />
              {label}
            </Link>
          </Button>
        ))}
      </nav>
      <main className="grid min-w-0 content-start gap-6">{children}</main>
    </div>
  );
}
