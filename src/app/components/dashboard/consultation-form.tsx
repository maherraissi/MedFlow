"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ConsultationSchema } from '@/lib/schemas';
import { createConsultation } from '@/lib/actions';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/app/components/ui/form';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function ConsultationForm({ appointment }: { appointment: any }) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ConsultationSchema>>({
    resolver: zodResolver(ConsultationSchema),
    defaultValues: {
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      diagnosis: '',
      notes: '',
    },
  });

  const onSubmit = (values: z.infer<typeof ConsultationSchema>) => {
    setError('');
    setSuccess('');

    startTransition(() => {
      createConsultation(values).then((data) => {
        setError(data?.error);
        setSuccess(data?.success);
        if (data?.success) {
          router.push('/dashboard/consultations');
        }
      });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="diagnosis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diagnostic</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes de consultation</FormLabel>
              <FormControl>
                <Textarea {...field} rows={8} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-500">{success}</p>}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Enregistrement...' : 'Enregistrer la consultation'}
        </Button>
      </form>
    </Form>
  );
}
