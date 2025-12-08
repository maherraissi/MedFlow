
"use client";

import { useTransition, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterClinicSchema } from '@/lib/schemas';
import { z } from 'zod';
import { registerClinic } from '@/lib/actions';
import { Button } from '@/app/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import Link from 'next/link';
import { Activity } from 'lucide-react';

export default function RegisterClinicPage() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>('');
    const [success, setSuccess] = useState<string | undefined>('');

    const form = useForm<z.infer<typeof RegisterClinicSchema>>({
        resolver: zodResolver(RegisterClinicSchema),
        defaultValues: {
            clinicName: '',
            address: '',
            adminName: '',
            email: '',
            password: '',
        },
    });

    const onSubmit = (values: z.infer<typeof RegisterClinicSchema>) => {
        setError('');
        setSuccess('');

        startTransition(() => {
            registerClinic(values).then((data) => {
                setError(data.error);
                setSuccess(data.success);
            });
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 animate-fade-in-up">
                <div className="flex flex-col items-center">
                    <div className="p-3 bg-white rounded-full shadow-lg mb-4">
                        <Activity className="h-10 w-10 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-600">
                        MedFlow
                    </h1>
                    <p className="text-muted-foreground mt-2">Créez votre clinique en ligne</p>
                </div>

                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Inscription Clinique</CardTitle>
                        <CardDescription>
                            Enregistrez votre établissement et commencez à gérer vos patients.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="clinicName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nom de la Clinique</FormLabel>
                                                <FormControl>
                                                    <Input disabled={isPending} placeholder="Ma Super Clinique" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Adresse (Optionnel)</FormLabel>
                                                <FormControl>
                                                    <Input disabled={isPending} placeholder="123 Rue de la Santé" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="border-t pt-4 mt-4">
                                        <h3 className="font-semibold text-sm text-gray-700 mb-3">Administrateur</h3>
                                        <FormField
                                            control={form.control}
                                            name="adminName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nom complet</FormLabel>
                                                    <FormControl>
                                                        <Input disabled={isPending} placeholder="Dr. Martin" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="mt-2">
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input disabled={isPending} placeholder="admin@clinique.com" type="email" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem className="mt-2">
                                                    <FormLabel>Mot de passe</FormLabel>
                                                    <FormControl>
                                                        <Input disabled={isPending} placeholder="******" type="password" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="p-3 rounded-md bg-emerald-500/15 text-emerald-500 text-sm font-medium">
                                        {success}
                                    </div>
                                )}

                                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isPending}>
                                    {isPending ? 'Création en cours...' : 'Créer ma clinique'}
                                </Button>
                            </form>
                        </Form>

                        <div className="mt-6 text-center text-sm">
                            <Link href="/auth/login" className="text-indigo-600 hover:underline">
                                Déjà inscrit ? Se connecter
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
