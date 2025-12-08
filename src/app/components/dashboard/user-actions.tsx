"use client";

import { useState, useTransition } from 'react';
import { deleteUser, toggleUserStatus, updateUserRole, resendInvitation, setUserPassword } from '@/lib/actions';
import { Button } from '@/app/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/app/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Input } from '@/app/components/ui/input';
import { Key } from 'lucide-react';
import { Label } from '@/app/components/ui/label';

export default function UserActions({ user }: { user: any }) {
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState(user.role);
  const [newPassword, setNewPassword] = useState('');
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const handleDelete = () => {
    startTransition(() => {
      deleteUser(user.id).then(() => {
        window.location.reload();
      });
    });
  };

  const handleToggleStatus = () => {
    startTransition(() => {
      toggleUserStatus(user.id).then(() => {
        window.location.reload();
      });
    });
  };

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    startTransition(() => {
      updateUserRole(user.id, newRole).then(() => {
        window.location.reload();
      });
    });
  };

  const handleResend = () => {
    startTransition(() => {
      resendInvitation(user.id).then(() => {
        window.location.reload();
      });
    });
  };

  const handleSetPassword = () => {
    startTransition(() => {
      setUserPassword(user.id, newPassword).then((result) => {
        if (result.success) {
          setIsPasswordDialogOpen(false);
          setNewPassword('');
          // Optional: Show toast
        } else {
          alert(result.error);
        }
      });
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <Select value={role} onValueChange={handleRoleChange} disabled={isPending}>
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ADMIN">Admin</SelectItem>
          <SelectItem value="DOCTOR">Médecin</SelectItem>
          <SelectItem value="RECEPTIONIST">Réceptionniste</SelectItem>
          <SelectItem value="PATIENT">Patient</SelectItem>
        </SelectContent>
      </Select>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" title="Définir mot de passe">
            <Key className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Définir un mot de passe</DialogTitle>
            <DialogDescription>
              Créez un mot de passe pour {user.name}. Cela activera automatiquement son compte.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">Password</Label>
              <Input id="password" type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="col-span-3" placeholder="Nouveau mot de passe" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSetPassword} disabled={isPending || newPassword.length < 8}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        variant={user.isActive ? "outline" : "default"}
        size="sm"
        onClick={handleToggleStatus}
        disabled={isPending}
      >
        {user.isActive ? 'Désactiver' : 'Activer'}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isPending}>Supprimer</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'utilisateur sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
