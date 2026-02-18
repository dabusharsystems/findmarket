import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  bid_id: string;
  amount?: number; // Client hint only -- server recalculates
  email: string;
  name: string;
  phone?: string;
}

// ── Server-side bid fee calculation (mirrors src/lib/bidFees.ts) ──
type TrustLevel = "low" | "standard" | "trusted" | "verified";

const TRUST_MULTIPLIERS: Record<TrustLevel, number> = {
  verified: 0.8,
  trusted: 0.9,
  standard: 1.0,
  low: 1.15,
};

function calculateBidFeeServer(budgetMax: number | null, budgetMin: number | null): number {
  const budget = budgetMax ?? budgetMin ?? 0;
  if (budget <= 2_000) return 20;
  if (budget <= 15_000) return 100;
  if (budget <= 100_000) return 400;
  if (budget <= 500_000) return 1_500;
  if (budget <= 1_000_000) return 3_000;
  return 5_000;
}

function applyTrustDiscount(baseFee: number, trustLevel: TrustLevel): number {
  const multiplier = TRUST_MULTIPLIERS[trustLevel] ?? 1.0;
  return Math.round(baseFee * multiplier);
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
    const { bid_id, email, name, phone } = body;

    if (!bid_id || !email || !name) {
      return new Response(
        JSON.stringify({ error: "bid_id, email, and name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── Fetch bid + listing to compute fee server-side ──
    const { data: bidData, error: bidError } = await supabaseAdmin
      .from("bids")
      .select("listing_id, seller_id")
      .eq("id", bid_id)
      .single();

    if (bidError || !bidData) {
      return new Response(
        JSON.stringify({ error: "Bid not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the requesting user owns this bid
    if (bidData.seller_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "You can only pay for your own bids" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: listingData, error: listingError } = await supabaseAdmin
      .from("listings")
      .select("budget_max, budget_min")
      .eq("id", bidData.listing_id)
      .single();

    if (listingError || !listingData) {
      return new Response(
        JSON.stringify({ error: "Listing not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch seller trust level for discount
    const { data: sellerProfile } = await supabaseAdmin
      .from("profiles")
      .select("trust_level")
      .eq("id", user.id)
      .single();

    const trustLevel: TrustLevel = (sellerProfile?.trust_level as TrustLevel) || "standard";
    const baseFee = calculateBidFeeServer(listingData.budget_max, listingData.budget_min);
    const amount = applyTrustDiscount(baseFee, trustLevel);

    console.log("Server-calculated fee:", { baseFee, trustLevel, amount, budget_max: listingData.budget_max });

    // Fetch Flutterwave keys from platform_settings
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

    const baseRedirectUrl =
      Deno.env.get("PUBLIC_SITE_URL") ||
      req.headers.get("origin") ||
      "https://b2cb88a0-328f-40d7-8820-289b8ff8e988.lovable.app";

    const redirectUrl = `${baseRedirectUrl}/payment/callback?tx_ref=${tx_ref}&bid_id=${bid_id}`;

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
