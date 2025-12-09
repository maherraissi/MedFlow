
import { auth } from '@/auth';
import { logout } from '@/lib/actions';
import { Button } from '@/app/components/ui/button';
import { User } from 'lucide-react';

export async function UserButton() {
    const session = await auth();
    const userName = session?.user?.name || 'Utilisateur';

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <div className="bg-indigo-100 p-2 rounded-full">
                    <User className="h-4 w-4 text-indigo-600" />
                </div>
                <span className="text-sm font-medium hidden md:block text-black">{userName}</span>
            </div>
            <form action={logout}>
                <Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    Déconnexion
                </Button>
            </form>
        </div>
    );
}
