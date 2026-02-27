import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DatabaseSetupAlert({ message }: { message?: string }) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Database setup required</AlertTitle>
      <AlertDescription>
        {message ??
          "Your Supabase schema is not initialized yet. Run the SQL file at `supabase/migrations/0001_init.sql` in Supabase SQL Editor, then refresh."}
      </AlertDescription>
    </Alert>
  );
}
