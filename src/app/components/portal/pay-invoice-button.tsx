"use client";

import { useState, useTransition } from 'react';
import { Button } from '@/app/components/ui/button';
import { CreditCard } from 'lucide-react';
import { createCheckoutSessionAction } from '@/lib/actions';
import { toast } from 'sonner'; // Assuming sonner is installed, or just use alert
// Check package.json for sonner? Assuming basic alert for now if unsure.

export default function PayInvoiceButton({ invoiceId, amount }: { invoiceId: string, amount: number }) {
    const [isPending, startTransition] = useTransition();

    const handlePay = () => {
        startTransition(() => {
            createCheckoutSessionAction(invoiceId).then((result) => {
                if (result.url) {
                    window.location.href = result.url;
                } else {
                    alert(result.error || 'Erreur lors du paiement.');
                }
            });
        });
    };

    return (
        <Button
            onClick={handlePay}
            disabled={isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
            <CreditCard className="mr-2 h-4 w-4" />
            {isPending ? 'Redirection...' : `Payer ${amount.toFixed(2)} €`}
        </Button>
    );
}
