"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type PaginationProps = {
  meta: PaginationMeta;
  onPageChange: (newPage: number) => void;
};

export function Pagination({ meta, onPageChange }: PaginationProps) {
  if (!meta || meta.total === 0) return null;

  return (
    <div className="p-3 border-t flex items-center justify-between text-xs text-muted-foreground bg-muted/10">
      <span>
        Showing {Math.min((meta.page - 1) * meta.limit + 1, meta.total)} to{" "}
        {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} results
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6"
          disabled={!meta.hasPrev}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="px-2 font-medium">Page {meta.page} of {meta.totalPages}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6"
          disabled={!meta.hasNext}
          onClick={() => onPageChange(meta.page + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
