import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://uzrtwywocrfvkmwrknwp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6cnR3eXdvY3Jmdmttd3JrbndwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODI0OTMsImV4cCI6MjA4MTA1ODQ5M30.JMY3SZg-euwXNQRetvfkYM2Wvk_KHmPQnhumSexvvRs"
);

serve(async (req) => {
  const payload = await req.json();
  await supabase.from("leads").insert(payload);
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});