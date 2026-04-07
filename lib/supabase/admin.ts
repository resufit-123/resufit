import { createClient } from "@supabase/supabase-js";

// Service role client — bypasses RLS.
// ONLY use in trusted server-side contexts (webhook handlers, admin routes).
// NEVER import this in Client Components or expose to the browser.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let adminClient: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createAdminClient(): any {
  if (adminClient) return adminClient;

  adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  return adminClient;
}
