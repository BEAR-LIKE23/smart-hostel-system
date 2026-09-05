import { createClient } from '@supabase/supabase-js';

// Read configuration from Vite environment variables or fallback values
const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const envSupabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const envGoogleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;

const supabaseUrl: string = envSupabaseUrl || "https://cyzstcawibjckrijprcy.supabase.co";
const supabaseKey: string = envSupabaseKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5enN0Y2F3aWJqY2tyaWpwcmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4ODA1ODAsImV4cCI6MjA5NTQ1NjU4MH0.qb_Dtik5fRW-x3XR_6qDHJkvuSZ1tuV4zdxa3WuNkko";

export const googleApiKey: string = envGoogleApiKey || "AIzaSyDANyz6Uox_MLGrBEHRLRfO7t2F4P9WUx8";

const areCredentialsSet = 
  Boolean(supabaseUrl) && 
  Boolean(supabaseKey) && 
  supabaseUrl !== "YOUR_SUPABASE_URL_HERE" && 
  supabaseKey !== "YOUR_SUPABASE_KEY_HERE";

if (!areCredentialsSet) {
    console.error("SETUP REQUIRED: Supabase credentials are missing or still placeholders. Please update .env or supabaseClient.ts.");
}

// Export a SupabaseClient instance if configured, otherwise export null.
export const supabase = areCredentialsSet
  ? createClient(supabaseUrl, supabaseKey)
  : null;