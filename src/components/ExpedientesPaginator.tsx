import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PAGE_SIZE_OPTIONS = [10, 24, 50, 100] as const;
const MAX_VISIBLE_PAGES = 15;

interface Props {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function ExpedientesPaginator({ page, totalPages, total, limit, onPageChange, onLimitChange }: Props) {
  if (totalPages <= 0) return null;

  const pages = buildPageList(page, totalPages);
  const from = Math.min((page - 1) * limit + 1, total);
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-2">
      {/* Left: rows info + page size */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>
          {from}–{to} de {total} expedientes
        </span>
        <div className="flex items-center gap-1.5">
          <span className="hidden sm:inline">Por página:</span>
          <Select value={String(limit)} onValueChange={(v) => { onLimitChange(Number(v)); onPageChange(1); }}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((s) => (
                <SelectItem key={s} value={String(s)}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right: page navigation */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          aria-label="Primera página"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground select-none">…</span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="icon"
              className="h-8 w-8 text-xs"
              onClick={() => onPageChange(p as number)}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          aria-label="Última página"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function buildPageList(current: number, total: number): (number | "...")[] {
  if (total <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  // Always show first, last, current, and neighbours
  const delta = 2; // pages each side of current
  const result = new Set<number>();

  result.add(1);
  result.add(total);

  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    result.add(i);
  }

  // Fill remaining slots toward edges to reach MAX_VISIBLE_PAGES
  let slots = MAX_VISIBLE_PAGES - result.size;
  let left = 2;
  let right = total - 1;
  while (slots > 0) {
    if (left <= right) {
      if (!result.has(left)) { result.add(left); slots--; }
      left++;
    } else {
      break;
    }
    if (slots > 0 && right >= left) {
      if (!result.has(right)) { result.add(right); slots--; }
      right--;
    }
  }

  const sorted = Array.from(result).sort((a, b) => a - b);

  // Insert ellipsis where gaps exist
  const pages: (number | "...")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      pages.push("...");
    }
    pages.push(sorted[i]);
  }

  return pages;
}
