"use client";

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LoginSchema } from '@/lib/schemas';
import { login } from '@/lib/actions';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
  const [error, setError] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError('');

    startTransition(() => {
      login(values).then((data) => {
        if (data?.error) {
          setError(data.error);
        }
      });
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float animation-delay-200"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float animation-delay-400"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 glass-card animate-scale-in border-t-4 border-t-primary">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-3xl font-bold text-center text-gradient">
            MedFlow
          </CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Espace sécurisé de connexion
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="animate-fade-in-up animation-delay-100">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="medecin@medflow.com" {...field} disabled={isPending} className="bg-white/50 dark:bg-black/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="animate-fade-in-up animation-delay-200">
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} disabled={isPending} className="bg-white/50 dark:bg-black/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg flex items-center gap-x-2 text-sm text-destructive animate-fade-in-up animation-delay-300">
                  <span className="font-semibold">⚠️</span>
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full mt-6 animate-fade-in-up animation-delay-400 bg-gradient-to-r from-primary to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/20" disabled={isPending}>
                {isPending ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm animate-fade-in-up animation-delay-500">
            <span className="text-muted-foreground">Vous n'avez pas de compte? </span>
            <Link href="/auth/register" className="font-semibold text-primary hover:text-blue-700 hover:underline transition-colors">
              Contactez l'administrateur
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
