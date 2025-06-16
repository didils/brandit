// 📁 lib/supabase/browser-client.ts
import type { Database } from "database.types";

import { createBrowserClient } from "@supabase/ssr";

export const browserClient = createBrowserClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);
