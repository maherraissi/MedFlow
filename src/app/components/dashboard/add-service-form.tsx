"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ServiceSchema } from '@/lib/schemas';
import { createService } from '@/lib/actions';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/app/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';

export default function AddServiceForm() {
  const form = useForm<z.infer<typeof ServiceSchema>>({
    resolver: zodResolver(ServiceSchema),
    defaultValues: { name: '', description: '', price: 0, durationMinutes: 30 },
  });

  const onSubmit = (values: z.infer<typeof ServiceSchema>) => {
    createService(values).then(() => form.reset());
  };

  return (
    <Dialog>
      <DialogTrigger asChild><Button>Ajouter un service</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Nouveau Service</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nom</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Prix</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="durationMinutes" render={({ field }) => (<FormItem><FormLabel>Durée (min)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} /></FormControl><FormMessage /></FormItem>)} />
            <Button type="submit" className="w-full">Enregistrer</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
