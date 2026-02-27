import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { assertSupabaseEnv, env } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  assertSupabaseEnv();
  const response = NextResponse.next({
    request
  });

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>
      ) {
        cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: Record<string, unknown> }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
        });
      }
    }
  });

  await supabase.auth.getUser();

  return response;
}
