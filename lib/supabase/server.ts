import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { assertSupabaseEnv, env } from "@/lib/env";

export async function createClient() {
  assertSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>
      ) {
        cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: Record<string, unknown> }) => {
          cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2]);
        });
      }
    }
  });
}
