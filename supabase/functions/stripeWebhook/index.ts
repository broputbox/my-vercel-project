// @ts-ignore: allow-public
// deno-lint-ignore-file

// IMPORTS MUST BE AT THE TOP
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "npm:stripe@14.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// INITIALIZE STRIPE + SUPABASE
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  Deno.env.get("PROJECT_URL") ?? "",
  Deno.env.get("SERVICE_ROLE_KEY") ?? ""
);

// WEBHOOK HANDLER
serve(async (req: Request): Promise<Response> => {
  console.log("Webhook received");

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const sig = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch (err) {
    console.error("Failed to read request body:", err);
    return new Response("Bad Request", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("Signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log("Stripe event type:", event.type);

  // HANDLE CHECKOUT SESSION COMPLETED
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    const email = session.customer_details?.email;
    const name = session.customer_details?.name;

    console.log("Creating client:", email, name);

    const { error } = await supabase.from("clients").insert({
      email,
      name,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return new Response("Database error", { status: 500 });
    }
  }

  return new Response("OK", { status: 200 });
});
