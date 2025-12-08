import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getStats, getRecentData } from '@/lib/actions';
import StatCard from '@/app/components/dashboard/stat-card';
import {
  Users, Calendar, Briefcase, FileText, ClipboardList,
  UserCog, Clock, DollarSign, Plus, ArrowRight, Phone, Mail, Activity
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { format } from 'date-fns';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  const stats = await getStats();
  const recentData = await getRecentData();
  const role = session.user.role;

  // Filter Actions based on Role
  const allActions = [
    { label: 'Ajouter un patient', href: '/dashboard/patients', icon: <Users className="h-5 w-5" />, color: 'btn-brand', roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR'] },
    { label: 'Créer un rendez-vous', href: '/dashboard/appointments', icon: <Calendar className="h-5 w-5" />, color: 'bg-emerald-600 hover:bg-emerald-700 text-white', roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR'] },
    { label: 'Inviter un utilisateur', href: '/dashboard/users', icon: <UserCog className="h-5 w-5" />, color: 'bg-purple-600 hover:bg-purple-700 text-white', roles: ['ADMIN'] },
    { label: 'Nouvelle facture', href: '/dashboard/invoices', icon: <FileText className="h-5 w-5" />, color: 'bg-orange-500 hover:bg-orange-600 text-white', roles: ['ADMIN', 'RECEPTIONIST'] },
  ];

  const quickActions = allActions.filter(action => action.roles.includes(role as string));

  return (
    <div className="space-y-8 animate-fade-in-up pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">
            Tableau de bord
          </h1>
          <p className="text-muted-foreground mt-1">
            {role === 'ADMIN' && 'Vue d\'ensemble de la clinique'}
            {role === 'DOCTOR' && 'Vos rendez-vous et patients du jour'}
            {role === 'RECEPTIONIST' && 'Gestion de l\'accueil et facturation'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats Grid - Adapted by Role */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        {/* Everyone sees Appointments Today */}
        <StatCard
          title="Rendez-vous ajd."
          value={stats.todayAppointments}
          icon={<Clock className="h-5 w-5" />}
          variant="primary"
        />

        {/* Doctor & Admin see Total Patients */}
        {['ADMIN', 'DOCTOR'].includes(role as string) && (
          <StatCard
            title="Total Patients"
            value={stats.patientCount}
            icon={<Users className="h-5 w-5" />}
            variant="default"
          />
        )}

        {/* Doctor sees Consultations */}
        {role === 'DOCTOR' && (
          <StatCard
            title="Consultations"
            value={stats.consultationCount}
            icon={<ClipboardList className="h-5 w-5" />}
            variant="success"
          />
        )}

        {/* Receptionist & Admin see Invoices/Revenue */}
        {['ADMIN', 'RECEPTIONIST'].includes(role as string) && (
          <>
            <StatCard
              title="Factures en attente"
              value={stats.pendingInvoices}
              icon={<FileText className="h-5 w-5" />}
              variant="warning"
            />
            <StatCard
              title="Revenus"
              value={`${stats.totalRevenue.toFixed(0)} €`}
              icon={<DollarSign className="h-5 w-5" />}
              variant="success"
            />
          </>
        )}

        {/* Admin sees Services */}
        {role === 'ADMIN' && (
          <StatCard
            title="Services actifs"
            value={stats.serviceCount}
            icon={<Briefcase className="h-5 w-5" />}
            variant="default"
          />
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Actions & Priority Lists */}
        <div className="space-y-8 lg:col-span-2">

          {/* Quick Actions */}
          <Card className="border-none shadow-md bg-gradient-to-r from-card to-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, idx) => (
                <Link key={idx} href={action.href}>
                  <Button className={`w-full h-full py-4 flex flex-col gap-2 ${action.color} shadow-sm transition-transform hover:scale-105`} variant="secondary">
                    {action.icon}
                    <span>{action.label}</span>
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Recent Appointments (Priority for Doctor/Receptionist) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Rendez-vous Récents</CardTitle>
                <CardDescription>Prochaines consultations programmées</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/appointments">Voir tout <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentData.recentAppointments.length > 0 ? (
                <div className="space-y-4">
                  {recentData.recentAppointments.map((appt: any, i: number) => (
                    <div key={appt.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {format(new Date(appt.startAt), 'd')}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{appt.patient?.name}</p>
                          <p className="text-sm text-muted-foreground">{appt.service?.name} • {format(new Date(appt.startAt), 'HH:mm')}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${appt.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                          appt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {appt.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">Aucun rendez-vous récent.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Side Info */}
        <div className="space-y-8">

          {/* Recent Patients (Doctor/Admin) */}
          {['ADMIN', 'DOCTOR', 'RECEPTIONIST'].includes(role as string) && (
            <Card>
              <CardHeader>
                <CardTitle>Derniers Patients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentData.recentPatients.slice(0, 5).map((patient: any) => (
                  <div key={patient.id} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{patient.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{patient.email || 'Pas d\'email'}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/patients">Liste complète</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Recent Invoices (Admin/Receptionist) */}
          {['ADMIN', 'RECEPTIONIST'].includes(role as string) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-orange-500" />
                  Activité Financière
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentData.recentInvoices.slice(0, 4).map((invoice: any) => (
                  <div key={invoice.id} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">#{invoice.id.slice(0, 8)}</span>
                    <span className="font-medium">{invoice.total} €</span>
                    <span className={`h-2 w-2 rounded-full ${invoice.status === 'PAID' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/invoices">Voir factures</Link>
                </Button>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
