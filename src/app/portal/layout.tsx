
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { UserButton } from '@/app/components/dashboard/user-button';
import Link from 'next/link';

export default async function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect('/auth/login');
    }

    // Ensure only patients can access
    if (session.user.role !== 'PATIENT') {
        redirect('/dashboard');
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <header className="flex justify-between items-center mb-8">
                    <Link href="/portal?">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">MedFlow Portal</h1>
                    </Link>
                    <UserButton user={session.user} />
                </header>
                {children}
            </main>
        </div>
    );
}
