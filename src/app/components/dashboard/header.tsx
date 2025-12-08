import { UserButton } from '@/app/components/dashboard/user-button';

export default async function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-6 glass dark:glass-dark border-b dark:border-gray-700 shadow-sm animate-fade-in">
      <div>
        {/* Peut être utilisé pour le titre de la page actuelle */}
      </div>
      <UserButton />
    </header>
  );
}
