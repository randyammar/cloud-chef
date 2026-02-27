"use client";

import { createBrowserClient } from "@supabase/ssr";
import { assertSupabaseEnv, env } from "@/lib/env";

export function createClient() {
  assertSupabaseEnv();
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
