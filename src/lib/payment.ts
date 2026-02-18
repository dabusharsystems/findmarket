import { supabase } from "@/integrations/supabase/client";

interface InitiatePaymentParams {
  bidId: string;
  email: string;
  name: string;
  phone?: string;
}

export async function initiatePayment({
  bidId,
  email,
  name,
  phone,
}: InitiatePaymentParams): Promise<{ paymentLink: string; txRef: string }> {
  const { data, error } = await supabase.functions.invoke("initiate-payment", {
    body: { bid_id: bidId, email, name, phone },
  });

  if (error || !data?.payment_link) {
    console.error("initiatePayment error", error, data);
    throw new Error(data?.error || error?.message || "Failed to initiate payment");
  }

  return { paymentLink: data.payment_link, txRef: data.tx_ref };
}
