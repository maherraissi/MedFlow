"use client";

import { UserForm } from "@/app/components/dashboard/add-user-form";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AddUserPage() {
    const router = useRouter();

    const onSuccess = () => {
        setTimeout(() => {
            router.push("/dashboard/users");
            router.refresh();
        }, 1000);
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="mb-6">
                <Button variant="ghost" asChild className="mb-4 pl-0 hover:bg-transparent">
                    <Link href="/dashboard/users" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Retour à la liste
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Ajouter un utilisateur</h1>
                <p className="text-muted-foreground mt-2">
                    Invitez un nouveau membre de l'équipe ou créez son compte.
                </p>
            </div>

            <div className="border rounded-lg p-6 bg-card shadow-sm">
                <UserForm onSuccess={onSuccess} />
            </div>
        </div>
    );
}
