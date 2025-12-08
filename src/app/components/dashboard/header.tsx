import { auth } from '@/auth';
import { logout } from '@/lib/actions';
import { Button } from '@/app/components/ui/button';

export default async function Header() {
  const session = await auth();

  return (
    <header className="h-16 flex items-center justify-between px-6 glass dark:glass-dark border-b dark:border-gray-700 shadow-sm animate-fade-in">
      <div>
        {/* Peut être utilisé pour le titre de la page actuelle */}
      </div>
      <div className="flex items-center gap-4">
        <span>{session?.user?.name}</span>
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm">Se déconnecter</Button>
        </form>
      </div>
    </header>
  );
}
