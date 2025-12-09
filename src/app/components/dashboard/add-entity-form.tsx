"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/app/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/app/components/ui/tabs";
import { UserForm } from "./add-user-form";
import { PatientForm } from "./add-patient-form";

interface AddEntityFormProps {
    defaultTab?: "user" | "patient";
    label?: string;
}

export default function AddEntityForm({ defaultTab = "user", label }: AddEntityFormProps) {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<string>(defaultTab);

    const onSuccess = () => {
        // Small delay to allow success message to be seen? 
        // The previous implementation had a delay before reload.
        // We can rely on the form content's behavior or override it here if we want to control the close.
        // The extracted forms handle their own logic but take an onSuccess callback.
        // Let's close the dialog after a short delay or immediately.
        // The forms themselves have a reloading logic inside them that might conflict if not careful.
        // Looking at the extracted code:
        // UserForm: calls onSuccess if provided, OR reloads window after 1s.
        // PatientForm: calls onSuccess if provided, OR does nothing (comment said reload).

        // So we should provide an onSuccess that closes the modal and reloads the page.
        setTimeout(() => {
            setOpen(false);
            window.location.reload();
        }, 1000);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>{label || "Ajouter"}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Ajouter un nouvel élément</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="user">Utilisateur</TabsTrigger>
                        <TabsTrigger value="patient">Patient</TabsTrigger>
                    </TabsList>

                    <TabsContent value="user">
                        <div className="pt-4">
                            <UserForm onSuccess={onSuccess} />
                        </div>
                    </TabsContent>

                    <TabsContent value="patient">
                        <div className="pt-4">
                            <PatientForm onSuccess={onSuccess} />
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
