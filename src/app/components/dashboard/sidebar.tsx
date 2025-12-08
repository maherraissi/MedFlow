import SidebarNav from '@/app/components/dashboard/sidebar-nav';
import { auth } from '@/auth';

export default async function Sidebar() {
  const session = await auth();
  const role = (((session?.user as any)?.role) as string) || 'ADMIN';
  const allowed: Record<string, string[]> = {
    ADMIN: ['/dashboard', '/dashboard/patients', '/dashboard/appointments', '/dashboard/calendar', '/dashboard/services', '/dashboard/consultations', '/dashboard/invoices', '/dashboard/users', '/dashboard/settings'],
    DOCTOR: ['/dashboard', '/dashboard/patients', '/dashboard/appointments', '/dashboard/calendar', '/dashboard/consultations'],
    RECEPTIONIST: ['/dashboard', '/dashboard/patients', '/dashboard/appointments', '/dashboard/calendar', '/dashboard/invoices'],
    PATIENT: [],
  };
  const items = [
    { href: '/dashboard', label: 'Accueil', icon: 'home' },
    { href: '/dashboard/calendar', label: 'Agenda', icon: 'calendar' },
    { href: '/dashboard/patients', label: 'Patients', icon: 'users' },
    { href: '/dashboard/appointments', label: 'Liste RDV', icon: 'list' },
    { href: '/dashboard/services', label: 'Services', icon: 'briefcase' },
    { href: '/dashboard/consultations', label: 'Consultations', icon: 'clipboard' },
    { href: '/dashboard/invoices', label: 'Factures', icon: 'filetext' },
    { href: '/dashboard/users', label: 'Utilisateurs', icon: 'usercog' },
    { href: '/dashboard/settings/clinic', label: 'Réglages', icon: 'settings' },
  ];

  const filtered = items.filter((i) => (allowed[role] || []).some((p) => (p === '/dashboard' ? i.href === '/dashboard' : i.href.startsWith(p + '/'))));

  return (
    <div className="w-64 bg-white/70 dark:bg-gray-800/60 backdrop-blur border-r dark:border-gray-700 flex flex-col">
      <div className="h-16 flex items-center justify-center border-b dark:border-gray-700">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent animate-fade-in">MedFlow</h1>
      </div>
      <SidebarNav items={filtered as any} />
    </div>
  );
}
