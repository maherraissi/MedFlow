"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SetPasswordSchema } from "@/lib/schemas";
import { completeInvitation } from "@/lib/actions";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";

export default function SetPasswordPage() {
  const searchParams = useSearchParams();
  const invitationToken = searchParams.get("token") || "";

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof SetPasswordSchema>>({
    resolver: zodResolver(SetPasswordSchema),
    defaultValues: {
      token: invitationToken,
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (invitationToken) {
      form.setValue("token", invitationToken);
    }
  }, [invitationToken, form]);

  const onSubmit = (values: z.infer<typeof SetPasswordSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      completeInvitation(values).then((data) => {
        if (data.error) {
          setError(data.error);
          setSuccess("");
          return;
        }
        if (data.success) {
          setSuccess(data.success);
          setError("");
          setTimeout(() => {
            window.location.href = "/auth/login";
          }, 1500);
        }
      });
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden gradient-bg-blue">
      <Card className="w-full max-w-md relative z-10 glass backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-white/20 shadow-2xl">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Définir votre mot de passe
          </CardTitle>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Finalisez votre invitation MedFlow
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nouveau mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmation</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token d&apos;invitation</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending || Boolean(invitationToken)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && <div className="text-red-500 text-sm">{error}</div>}
              {success && <div className="text-green-500 text-sm">{success}</div>}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Validation..." : "Valider et se connecter"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

