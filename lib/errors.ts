export const DB_NOT_READY_MESSAGE =
  "Database schema is not initialized. Run `supabase/migrations/0001_init.sql` in Supabase SQL Editor, then refresh.";

export function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const maybeError = error as {
    code?: string;
    message?: string;
    details?: string | null;
  };

  const message = `${maybeError.message ?? ""} ${maybeError.details ?? ""}`;
  return (
    maybeError.code === "PGRST205" ||
    maybeError.code === "42P01" ||
    message.includes("Could not find the table") ||
    message.includes("relation") ||
    message.includes("does not exist")
  );
}

export function wrapDataError(error: unknown): Error {
  if (isMissingTableError(error)) {
    return new Error(DB_NOT_READY_MESSAGE);
  }

  if (error instanceof Error) return error;
  return new Error(String(error));
}

export function isDbNotReadyError(error: unknown): boolean {
  return error instanceof Error && error.message === DB_NOT_READY_MESSAGE;
}
