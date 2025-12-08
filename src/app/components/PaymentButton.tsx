// src/components/PaymentButton.tsx

"use client";

import { useTransition } from "react";
import { createCheckoutSessionAction } from "@/lib/actions";
import { Button } from "./ui/button";

export default function PaymentButton({ invoiceId }: { invoiceId: string }) {
  const [isPending, startTransition] = useTransition();

  const handlePayment = () => {
    startTransition(async () => {
      const data = await createCheckoutSessionAction(invoiceId);
      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.error) {
        alert(`Erreur: ${data.error}`);
      }
    });
  };

  return (
    <Button onClick={handlePayment} disabled={isPending}>
      {isPending ? "Chargement..." : "💳 Payer maintenant"}
    </Button>
  );
}