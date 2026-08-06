// Server-side database client — now backed by the local PGlite database
// instead of the remote Supabase service-role client. The public surface
// (`supabaseAdmin.from("table").select(...)`) is unchanged so the rest of
// the codebase keeps working; queries run against in-process Postgres.
import { createLocalClient } from "@/lib/local-db/query";

// Server-side admin database client (bypasses RLS because there is no RLS —
// access control happens in the server layer itself).
// Import like: import { supabaseAdmin } from "@/integrations/supabase/client.server";
export const supabaseAdmin = createLocalClient();
