"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, formatCount } from "@/lib/utils";

export type Column<T> = {
  key: string;
  label: string;
  render: (row: T, index: number) => ReactNode;
  align?: "left" | "right";
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  pageSize = 6,
  minWidth = 920,
  rowClassName,
  emptyMessage = "Aucun résultat ne correspond à votre recherche.",
  id,
  server,
}: {
  columns: Column<T>[];
  rows: T[];
  /** @deprecated layout is handled by the table itself; kept for call-site compatibility. */
  grid?: string;
  rowKey: (row: T, index: number) => string;
  pageSize?: number;
  minWidth?: number;
  rowClassName?: (row: T, index: number) => string | undefined;
  emptyMessage?: string;
  id?: string;
  /** Server-side paging: `rows` is already the current page, `total` the row count before paging. */
  server?: { total: number; page: number; onPageChange: (page: number) => void };
}) {
  const [localPage, setLocalPage] = useState(1);
  const total = server ? server.total : rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(server ? server.page : localPage, pageCount);
  const setPage = server ? server.onPageChange : setLocalPage;
  const visible = server ? rows : rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    (item) => item === 1 || item === pageCount || Math.abs(item - currentPage) <= 1,
  );

  return (
    <Card id={id} className="gap-0 overflow-hidden rounded-2xl border-border py-0 shadow-soft">
      <Table style={{ minWidth }}>
        <TableHeader>
          <TableRow className="h-11 bg-muted/70 hover:bg-muted/70">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  "px-4 text-[10px] font-extrabold uppercase tracking-[0.06em] text-muted-foreground",
                  column.align === "right" && "text-right",
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length}>
                <Empty className="min-h-45 p-8">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <SearchX />
                    </EmptyMedia>
                    <EmptyTitle className="text-[13px]">Aucun résultat</EmptyTitle>
                    <EmptyDescription className="text-[12px]">{emptyMessage}</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TableCell>
            </TableRow>
          )}
          {visible.map((row, index) => (
            <TableRow key={rowKey(row, index)} className={cn("h-16", rowClassName?.(row, index))}>
              {columns.map((column) => (
                <TableCell key={column.key} className={cn("min-w-0 px-4", column.align === "right" && "text-right")}>
                  {column.render(row, (currentPage - 1) * pageSize + index)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex min-h-13.5 flex-wrap items-center justify-between gap-3 border-t px-4 py-2 text-[11px] text-muted-foreground">
        <span>{formatCount(total, currentPage, pageSize)}</span>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Page précédente"
              >
                <ChevronLeft />
              </Button>
            </PaginationItem>
            {pages.map((item, index) => (
              <PaginationItem key={item} className="flex items-center">
                {index > 0 && item - pages[index - 1] > 1 && <PaginationEllipsis className="size-8" />}
                <Button
                  variant={item === currentPage ? "outline" : "ghost"}
                  size="icon-sm"
                  onClick={() => setPage(item)}
                  aria-current={item === currentPage ? "page" : undefined}
                >
                  {item}
                </Button>
              </PaginationItem>
            ))}
            <PaginationItem>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setPage(Math.min(pageCount, currentPage + 1))}
                disabled={currentPage === pageCount}
                aria-label="Page suivante"
              >
                <ChevronRight />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </Card>
  );
}
