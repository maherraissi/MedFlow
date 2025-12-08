// src/lib/stripe.ts
// Configuration et utilitaires Stripe pour paiements

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Créer une session de paiement Stripe
 */
export async function createCheckoutSession(
  amount: number,
  invoiceId: string,
  patientEmail: string,
  clinicName?: string
) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: clinicName ? `${clinicName} - Consultation` : "Consultation médicale",
            description: `Facture #${invoiceId}`,
          },
          unit_amount: Math.round(amount * 100), // Convertir en centimes
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invoices?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invoices?canceled=true`,
    customer_email: patientEmail,
    metadata: {
      invoiceId,
    },
  });

  return session;
}

/**
 * Récupérer une session Stripe
 */
export async function retrieveCheckoutSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId);
}

/**
 * Récupérer un payment intent
 */
export async function retrievePaymentIntent(paymentIntentId: string) {
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Vérifier la signature du webhook Stripe
 */
export function verifyWebhookSignature(body: string, signature: string) {
  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    throw new Error(`Webhook Error: ${error}`);
  }
}

/**
 * Traiter un événement de paiement réussi
 */
export async function handleChargeSucceeded(chargeData: any) {
  return {
    paymentIntentId: chargeData.payment_intent,
    amount: chargeData.amount / 100, // Convertir depuis centimes
    currency: chargeData.currency.toUpperCase(),
    status: "completed",
    metadata: chargeData.metadata,
  };
}

/**
 * Traiter un événement de paiement échoué
 */
export async function handleChargeFailed(chargeData: any) {
  return {
    paymentIntentId: chargeData.payment_intent,
    amount: chargeData.amount / 100,
    status: "failed",
    failureMessage: chargeData.failure_message,
    metadata: chargeData.metadata,
  };
}

/**
 * Rembourser un paiement
 */
export async function refundPayment(paymentIntentId: string, amount?: number) {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined,
  });
}
