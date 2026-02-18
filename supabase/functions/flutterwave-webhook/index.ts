 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, verif-hash',
 };
 
 Deno.serve(async (req) => {
   // Handle CORS preflight
   if (req.method === 'OPTIONS') {
     return new Response('ok', { headers: corsHeaders });
   }
 
   try {
     const FLUTTERWAVE_SECRET_KEY = Deno.env.get('FLUTTERWAVE_SECRET_KEY');
     const FLUTTERWAVE_WEBHOOK_SECRET = Deno.env.get('FLUTTERWAVE_WEBHOOK_SECRET');
     const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
     const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 
     if (!FLUTTERWAVE_SECRET_KEY || !FLUTTERWAVE_WEBHOOK_SECRET) {
       console.error('Missing Flutterwave configuration');
       return new Response(JSON.stringify({ error: 'Server configuration error' }), {
         status: 500,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       });
     }
 
     if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
       console.error('Missing Supabase configuration');
       return new Response(JSON.stringify({ error: 'Server configuration error' }), {
         status: 500,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       });
     }
 
     // Verify webhook signature from Flutterwave
     const signature = req.headers.get('verif-hash');
     if (!signature || signature !== FLUTTERWAVE_WEBHOOK_SECRET) {
       console.error('Invalid webhook signature');
       return new Response(JSON.stringify({ error: 'Invalid signature' }), {
         status: 401,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       });
     }
 
     const payload = await req.json();
     console.log('Flutterwave webhook received:', JSON.stringify(payload, null, 2));
 
     // Check if this is a successful charge event
     if (payload.event !== 'charge.completed' || payload.data?.status !== 'successful') {
       console.log('Ignoring non-successful payment event:', payload.event, payload.data?.status);
       return new Response(JSON.stringify({ status: 'ignored' }), {
         status: 200,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       });
     }
 
     const { tx_ref, id: flw_transaction_id, amount, currency } = payload.data;
 
     // Verify the transaction with Flutterwave API
     const verifyResponse = await fetch(
       `https://api.flutterwave.com/v3/transactions/${flw_transaction_id}/verify`,
       {
         method: 'GET',
         headers: {
           'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
           'Content-Type': 'application/json',
         },
       }
     );
 
     const verifyData = await verifyResponse.json();
     console.log('Flutterwave verification response:', JSON.stringify(verifyData, null, 2));
 
     if (verifyData.status !== 'success' || verifyData.data?.status !== 'successful') {
       console.error('Transaction verification failed:', verifyData);
       return new Response(JSON.stringify({ error: 'Transaction verification failed' }), {
         status: 400,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       });
     }
 
     // Initialize Supabase client with service role for admin access
     const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
 
     // Parse tx_ref to get payment type and ID
     // Expected formats: 
     // - "bid_<bid_id>_<timestamp>" for bid payments
     // - "sub_<subscription_id>_<timestamp>" for subscription payments
     const txRefParts = tx_ref.split('_');
     const paymentType = txRefParts[0];
     const entityId = txRefParts[1];
 
     if (paymentType === 'bid') {
       // Update bid payment status to 'paid'
       const { data: bid, error: bidError } = await supabase
         .from('bids')
         .update({ payment_status: 'paid' })
         .eq('id', entityId)
         .select('id, listing_id, seller_id, price')
         .single();
 
       if (bidError) {
         console.error('Error updating bid:', bidError);
         return new Response(JSON.stringify({ error: 'Failed to update bid' }), {
           status: 500,
           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         });
       }
 
       console.log('Bid payment status updated:', bid);
 
      // Update the existing pending payment record (created by initiate-payment)
       const { error: paymentError } = await supabase
         .from('payments')
         .update({
           status: 'successful',
           flutterwave_tx_ref: String(flw_transaction_id),
         })
         .eq('transaction_ref', tx_ref);

       if (paymentError) {
         console.error('Error updating payment record:', paymentError);
         // Fallback: try inserting if the pending record doesn't exist
         await supabase.from('payments').insert({
           user_id: bid.seller_id,
           bid_id: entityId,
           amount: amount,
           currency: currency,
           payment_type: 'single_bid',
           status: 'successful',
           transaction_ref: tx_ref,
           flutterwave_tx_ref: String(flw_transaction_id),
         });
       }
 
       // Get the listing to find the buyer for notification
       const { data: listing } = await supabase
         .from('listings')
         .select('buyer_id, title')
         .eq('id', bid.listing_id)
         .single();
 
       if (listing) {
         // Create notification for the buyer about new bid
         await supabase.from('notifications').insert({
           user_id: listing.buyer_id,
           type: 'new_bid',
           title: 'New Bid Received',
           message: `A seller has submitted a bid of KES ${bid.price.toLocaleString()} on your listing "${listing.title}"`,
           metadata: { bid_id: entityId, listing_id: bid.listing_id },
         });
       }
 
       return new Response(JSON.stringify({ 
         status: 'success', 
         message: 'Bid payment processed',
         bid_id: entityId 
       }), {
         status: 200,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       });
 
     } else if (paymentType === 'sub') {
       // Handle subscription payment
       const { data: subscription, error: subError } = await supabase
         .from('subscriptions')
         .update({ status: 'active' })
         .eq('id', entityId)
         .select('id, seller_id, plan_name')
         .single();
 
       if (subError) {
         console.error('Error updating subscription:', subError);
         return new Response(JSON.stringify({ error: 'Failed to update subscription' }), {
           status: 500,
           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         });
       }
 
       // Record the payment
       await supabase.from('payments').insert({
         user_id: subscription.seller_id,
         subscription_id: entityId,
         amount: amount,
         currency: currency,
         payment_type: 'subscription',
         status: 'successful',
         transaction_ref: tx_ref,
         flutterwave_tx_ref: String(flw_transaction_id),
       });
 
       console.log('Subscription activated:', subscription);
 
       return new Response(JSON.stringify({ 
         status: 'success', 
         message: 'Subscription payment processed',
         subscription_id: entityId 
       }), {
         status: 200,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       });
     }
 
     console.log('Unknown payment type:', paymentType);
     return new Response(JSON.stringify({ status: 'ignored', reason: 'Unknown payment type' }), {
       status: 200,
       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
     });
 
   } catch (error) {
     console.error('Webhook processing error:', error);
     return new Response(JSON.stringify({ error: 'Internal server error' }), {
       status: 500,
       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
     });
   }
 });
