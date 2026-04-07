import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { CookieMethodsServer } from "@supabase/ssr";

// Used in Server Components, Server Actions, and Route Handlers
// Uses the anon key — respects RLS policies
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Parameters<CookieMethodsServer["setAll"]>[0]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — safe to ignore
          }
        },
      },
    }
  );
}
