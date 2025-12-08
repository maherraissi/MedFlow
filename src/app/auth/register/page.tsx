"use client";

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RegisterSchema } from '@/lib/schemas';
import { register } from '@/lib/actions';
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

export default function RegisterPage() {
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      clinicName: '',
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
    console.log('📝 Soumission du formulaire avec les valeurs:', values);
    setError('');
    setSuccess('');

    startTransition(async () => {
      try {
        console.log('🔄 Début de l\'inscription...');
        const data = await register(values);
        console.log('📦 Réponse reçue:', data);
        
        if (data?.error) {
          console.error('❌ Erreur:', data.error);
          setError(data.error);
          setSuccess('');
        } else if (data?.success) {
          console.log('✅ Succès:', data.success);
          setSuccess(data.success);
          setError('');
          // Rediriger vers la page de connexion après 2 secondes
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 2000);
        } else {
          console.warn('⚠️ Réponse inattendue:', data);
          setError('Réponse inattendue du serveur.');
        }
      } catch (error) {
        console.error('❌ Erreur lors de l\'inscription:', error);
        setError(`Une erreur est survenue: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        setSuccess('');
      }
    });
  };

  const onError = (errors: any) => {
    console.error('❌ Erreurs de validation:', errors);
    setError('Veuillez corriger les erreurs dans le formulaire.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden gradient-bg-blue">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float animation-delay-200"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float animation-delay-400"></div>
      </div>
      
      <Card className="w-full max-w-md relative z-10 glass backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-white/20 shadow-2xl animate-scale-in">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Créez votre compte
          </CardTitle>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Rejoignez MedFlow dès aujourd'hui
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-5" noValidate>
              <FormField
                control={form.control}
                name="clinicName"
                render={({ field }) => (
                  <FormItem className="animate-fade-in-up animation-delay-100">
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Nom de la clinique</FormLabel>
                    <FormControl>
                      <Input placeholder="Clinique du Lac" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="animate-fade-in-up animation-delay-100">
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Nom complet</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="animate-fade-in-up animation-delay-200">
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.doe@example.com" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="animate-fade-in-up animation-delay-300">
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <div className="bg-red-500/20 border-2 border-red-500/50 p-4 rounded-lg flex items-center gap-x-2 text-sm text-red-600 dark:text-red-400 animate-fade-in-up animation-delay-400 backdrop-blur-sm">
                  <span className="font-semibold">⚠️</span>
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-emerald-500/20 border-2 border-emerald-500/50 p-4 rounded-lg flex items-center gap-x-2 text-sm text-emerald-600 dark:text-emerald-400 animate-fade-in-up animation-delay-400 backdrop-blur-sm">
                  <span className="font-semibold">✓</span>
                  {success}
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full mt-6 animate-fade-in-up animation-delay-500" 
                disabled={isPending}
                onClick={(e) => {
                  console.log('🖱️ Bouton cliqué, isPending:', isPending);
                  if (!isPending) {
                    console.log('✅ Soumission du formulaire...');
                  } else {
                    console.log('⏳ Inscription en cours, clic ignoré');
                  }
                }}
              >
                {isPending ? 'Inscription...' : 'S\'inscrire'}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm animate-fade-in-up animation-delay-500">
            <span className="text-gray-600 dark:text-gray-400">Vous avez déjà un compte? </span>
            <Link href="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline transition-colors">
              Se connecter
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
