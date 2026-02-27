import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RecipeStatus } from "@/lib/types";

const labels: Record<RecipeStatus, string> = {
  favorite: "Favorite",
  to_try: "To Try",
  made_before: "Made Before"
};

const statusStyles: Record<RecipeStatus, string> = {
  favorite:
    "border-rose-300 bg-rose-100 text-rose-800 dark:border-rose-500/50 dark:bg-rose-900/30 dark:text-rose-200",
  to_try:
    "border-sky-300 bg-sky-100 text-sky-800 dark:border-sky-500/50 dark:bg-sky-900/30 dark:text-sky-200",
  made_before:
    "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-500/50 dark:bg-emerald-900/30 dark:text-emerald-200"
};

interface StatusBadgeProps {
  status: RecipeStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex h-7 min-w-[6.75rem] items-center justify-center whitespace-nowrap px-3 text-center text-xs font-semibold leading-none",
        statusStyles[status],
        className
      )}
    >
      {labels[status]}
    </Badge>
  );
}
