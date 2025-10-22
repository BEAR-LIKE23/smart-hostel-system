import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// --- DATABASE CONFIGURATION ---
// Please replace the placeholder values below with your actual Supabase credentials.
// You can find these in your Supabase project's API settings.

// FIX: Explicitly type constants as `string` to prevent TypeScript from inferring a too-specific literal type,
// which causes an error when comparing against the placeholder string literal.
const supabaseUrl: string = "https://orybwmgqelmxjqwcpvnc.supabase.co";
const supabaseKey: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yeWJ3bWdxZWxteGpxd2Nwdm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTI0NTQsImV4cCI6MjA3NjAyODQ1NH0.6_xNtSkgJI64takBwKz4NwiVNZ-QAq4hF8FiFwvG0L0";

// --- DO NOT EDIT BELOW THIS LINE ---

// This check verifies that you have replaced the placeholder values.
const areCredentialsSet = 
  supabaseUrl !== "YOUR_SUPABASE_URL_HERE" && 
  supabaseKey !== "YOUR_SUPABASE_KEY_HERE";

if (!areCredentialsSet) {
    console.error("SETUP REQUIRED: Supabase credentials are still placeholders. Please update supabaseClient.ts with your actual URL and Key.");
}

// Export a SupabaseClient instance if configured, otherwise export null.
// The main App component will see `null` and show a helpful setup screen.
export const supabase = areCredentialsSet
  ? createClient(supabaseUrl, supabaseKey)
  : null;