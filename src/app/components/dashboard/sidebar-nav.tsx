"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { Home, Users, Calendar, Briefcase, ClipboardList, FileText, UserCog, Settings } from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

export default function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    home: Home,
    users: Users,
    calendar: Calendar,
    briefcase: Briefcase,
    clipboard: ClipboardList,
    filetext: FileText,
    usercog: UserCog,
    settings: Settings,
  };

  return (
    <nav className="flex-1 p-4 space-y-2">
      {items.map(({ href, label, icon: iconKey }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
        const Icon = iconMap[iconKey] || Home;
        return (
          <Link
            key={href}
            href={href}
            className={`group flex items-center p-2 rounded-lg transition-all ${
              active
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-200 shadow-sm'
                : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700 dark:text-gray-300 dark:hover:bg-purple-950/20 dark:hover:text-purple-300'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${active ? 'text-purple-600 dark:text-purple-300' : 'text-purple-600 dark:text-purple-300'}`} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
