"use client";

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PrescriptionSchema } from '@/lib/schemas';
import { createPrescription } from '@/lib/actions';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/app/components/ui/form';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, XCircle } from 'lucide-react';

export default function PrescriptionForm({ consultationId }: { consultationId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof PrescriptionSchema>>({
    resolver: zodResolver(PrescriptionSchema),
    defaultValues: {
      consultationId,
      items: [{ name: '', dosage: '', duration: '', instructions: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = (values: z.infer<typeof PrescriptionSchema>) => {
    setError('');
    setSuccess('');

    startTransition(() => {
      createPrescription(values).then((data) => {
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
        <div>
          {fields.map((item, index) => (
            <div key={item.id} className="p-4 border rounded-lg mb-4 relative">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`items.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Médicament</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ex: Paracétamol 500mg" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.dosage`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosage</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ex: 1 comprimé 3x/jour" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.duration`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ex: 7 jours" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name={`items.${index}.instructions`}
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="ex: À prendre pendant les repas" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => append({ name: '', dosage: '', duration: '', instructions: '' })}>
            <PlusCircle className="h-5 w-5 mr-2" />
            Ajouter un médicament
          </Button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-500">{success}</p>}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Création...' : 'Créer l\'ordonnance'}
        </Button>
      </form>
    </Form>
  );
}
