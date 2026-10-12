import { userService } from "@repo/core";
import type { Metadata } from "next";
import { ConfirmActionButton } from "@/components/confirm-action-button";
import { Pagination } from "@/components/pagination";
import { SearchForm } from "@/components/search-form";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getActor } from "@/lib/session";
import { formatDate, toQuery } from "@/lib/utils";
import { setUserBannedAction, setUserRoleAction } from "@/server/admin-actions";

export const metadata: Metadata = { title: "사용자 관리" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** 사용자 관리: 검색, 역할 변경, 정지/해제 */
export default async function AdminUsersPage({ searchParams }: Props) {
  const actor = await getActor();
  const query = toQuery(await searchParams);
  const result = await userService.listUsers(actor, query);

  return (
    <>
      <h1 className="text-2xl font-bold">사용자 관리</h1>
      <SearchForm defaultValue={query.q} placeholder="이름 또는 이메일" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
            <TableHead>이메일</TableHead>
            <TableHead>역할</TableHead>
            <TableHead>상태</TableHead>
            <TableHead className="text-right">글</TableHead>
            <TableHead>가입일</TableHead>
            <TableHead className="text-right">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.items.map((user) => {
            const isSelf = user.id === actor?.id;
            const isAdminUser = user.role === "admin";
            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={isAdminUser ? "default" : "outline"}>
                    {isAdminUser ? "관리자" : "사용자"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.banned ? <Badge variant="destructive">정지</Badge> : "정상"}
                </TableCell>
                <TableCell className="text-right tabular-nums">{user._count.posts}</TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <ConfirmActionButton
                      variant="outline"
                      size="sm"
                      disabled={isSelf}
                      confirmMessage={`${user.name}님을 ${isAdminUser ? "일반 사용자" : "관리자"}로 변경할까요?`}
                      action={setUserRoleAction.bind(null, user.id, isAdminUser ? "user" : "admin")}
                    >
                      {isAdminUser ? "관리자 해제" : "관리자 지정"}
                    </ConfirmActionButton>
                    <ConfirmActionButton
                      variant={user.banned ? "outline" : "destructive"}
                      size="sm"
                      disabled={isSelf}
                      confirmMessage={
                        user.banned
                          ? "정지를 해제할까요?"
                          : `${user.name}님을 정지할까요? 즉시 로그아웃됩니다.`
                      }
                      action={setUserBannedAction.bind(null, user.id, !user.banned)}
                    >
                      {user.banned ? "정지 해제" : "정지"}
                    </ConfirmActionButton>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        basePath="/admin/users"
        query={query}
      />
    </>
  );
}
