import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://otuashiykzgkkcbiyxae.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90dWFzaGl5a3pna2tjYml5eGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwMTY0NTYsImV4cCI6MjA1NzU5MjQ1Nn0.IWLxS05LrF1mOXCztdOkVi5qTxgmCLUHQGeOM9A_khI";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
