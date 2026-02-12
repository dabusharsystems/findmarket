import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  bid_id: string;
  amount: number;
  email: string;
  name: string;
  phone?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user from auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { authorization: authHeader } },
    });
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: PaymentRequest = await req.json();
    const { bid_id, amount, email, name, phone } = body;

    if (!bid_id || !amount || !email || !name) {
      return new Response(
        JSON.stringify({ error: "bid_id, amount, email, and name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch Flutterwave keys from platform_settings
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from("platform_settings")
      .select("value")
      .eq("key", "payment_environment")
      .single();

    if (settingsError || !settingsData) {
      console.error("Failed to fetch payment settings", settingsError);
      return new Response(
        JSON.stringify({ error: "Payment configuration not found" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const config = settingsData.value as {
      mode: "sandbox" | "live";
      flutterwave_public_key: string;
    };

    const FLUTTERWAVE_SECRET_KEY = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
    if (!FLUTTERWAVE_SECRET_KEY) {
      console.error("FLUTTERWAVE_SECRET_KEY not set");
      return new Response(
        JSON.stringify({ error: "Payment gateway not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate unique tx_ref
    const tx_ref = `bid_${bid_id}_${Date.now()}`;

    // Determine redirect URL (back to the listing)
    const { data: bidData } = await supabaseAdmin
      .from("bids")
      .select("listing_id")
      .eq("id", bid_id)
      .single();

    const baseRedirectUrl =
      Deno.env.get("PUBLIC_SITE_URL") ||
      req.headers.get("origin") ||
      "https://b2cb88a0-328f-40d7-8820-289b8ff8e988.lovable.app";

    const redirectUrl = bidData?.listing_id
      ? `${baseRedirectUrl}/listing/${bidData.listing_id}?payment=success`
      : `${baseRedirectUrl}/dashboard/seller?payment=success`;

    // Create a pending payment record
    const { error: paymentInsertError } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id: user.id,
        bid_id,
        amount,
        currency: "KES",
        payment_type: "single_bid",
        status: "pending",
        transaction_ref: tx_ref,
      });

    if (paymentInsertError) {
      console.error("Error creating payment record", paymentInsertError);
      // Non-fatal, continue to initiate payment
    }

    // Build Flutterwave Standard hosted payment link
    const flwPayload = {
      tx_ref,
      amount,
      currency: "KES",
      redirect_url: redirectUrl,
      customer: {
        email,
        name,
        phonenumber: phone || "",
      },
      meta: {
        bid_id,
        user_id: user.id,
      },
      customizations: {
        title: "FindMarket Bid Fee",
        description: `Access fee for bid ${bid_id}`,
        logo: "https://ypwtqcehnjrikxfpvxur.supabase.co/storage/v1/object/public/avatars/logo.png",
      },
    };

    console.log("Initiating Flutterwave payment", JSON.stringify(flwPayload));

    const flwResponse = await fetch(
      "https://api.flutterwave.com/v3/payments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(flwPayload),
      }
    );

    const flwResult = await flwResponse.json();
    console.log("Flutterwave response", JSON.stringify(flwResult));

    if (flwResult.status !== "success" || !flwResult.data?.link) {
      console.error("Flutterwave payment creation failed", flwResult);
      return new Response(
        JSON.stringify({
          error: flwResult.message || "Failed to initiate payment",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log audit event
    await supabaseAdmin.from("audit_logs").insert({
      actor_id: user.id,
      action: "payment_initiated",
      entity_type: "bid",
      entity_id: bid_id,
      metadata: { tx_ref, amount },
    });

    return new Response(
      JSON.stringify({ payment_link: flwResult.data.link, tx_ref }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("initiate-payment error", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
