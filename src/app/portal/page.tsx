
import { auth } from '@/auth';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Calendar, FileText, CreditCard, Clock, Activity, Download } from 'lucide-react';
import Link from 'next/link';
import { getMyAppointmentsByEmail, getMyInvoicesByEmail, getMyPrescriptionsByEmail } from '@/lib/actions';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import DownloadPrescriptionButton from '@/app/components/pdf/download-prescription-button';

export default async function PortalPage() {
  const session = await auth();
  const userName = session?.user?.name || 'Patient';
  const email = session?.user?.email;

  // Fetch real data
  const appointments = email ? await getMyAppointmentsByEmail(email) : [];
  const invoices = email ? await getMyInvoicesByEmail(email) : [];
  const prescriptions = email ? await getMyPrescriptionsByEmail(email) : [];

  const nextAppointment = appointments.find(a => new Date(a.startAt) > new Date());
  const pendingInvoice = invoices.find(i => i.status !== 'PAID');

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Section */}
      <section className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Bonjour, {userName}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez votre santé, vos rendez-vous et vos documents en un seul endroit.
        </p>
      </section>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/portal/appointments" className="block transform transition-transform hover:scale-105">
          <Card className="bg-gradient-to-br from-primary to-blue-600 text-primary-foreground border-none shadow-lg h-full">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Prendre Rendez-vous</h3>
                <p className="text-primary-foreground/80 text-sm mt-1">Réservez une consultation en ligne</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/portal/invoices" className="block transform transition-transform hover:scale-105">
          <Card className="bg-gradient-to-br from-secondary to-teal-600 text-secondary-foreground border-none shadow-lg h-full">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-3 bg-white/20 rounded-full">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Mes Factures</h3>
                {pendingInvoice && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-destructive text-white text-xs rounded-full animate-pulse">
                    1 en attente
                  </span>
                )}
                <p className="text-secondary-foreground/80 text-sm mt-1">Consultez et réglez vos factures</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/portal/prescriptions" className="block transform transition-transform hover:scale-105">
          <Card className="bg-gradient-to-br from-slate-700 to-slate-800 text-white border-none shadow-lg h-full">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-3 bg-white/20 rounded-full">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Mes Ordonnances</h3>
                <p className="text-slate-200 text-sm mt-1">Téléchargez vos documents médicaux</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Next Appointment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Prochain Rendez-vous
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextAppointment ? (
              <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-lg text-primary">
                      {nextAppointment.service?.name || "Consultation"}
                    </p>
                    <p className="text-muted-foreground">
                      avec {nextAppointment.doctor?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-2xl text-primary">
                      {format(new Date(nextAppointment.startAt), 'd MMM')}
                    </p>
                    <p className="text-primary/80">
                      {format(new Date(nextAppointment.startAt), 'HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucun rendez-vous à venir.</p>
                <Button variant="link" asChild className="mt-2 text-primary">
                  <Link href="/portal/appointments">Prendre rendez-vous</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              Dernières Ordonnances
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prescriptions.length > 0 ? (
              <div className="space-y-4">
                {prescriptions.slice(0, 3).map((presc: any) => {
                  let parsedItems = [];
                  try {
                    parsedItems = JSON.parse(presc.items);
                  } catch (e) {
                    // Fallback if empty or invalid
                    parsedItems = [];
                  }

                  // Safe access to nested properties
                  const pdfData = {
                    id: presc.id,
                    createdAt: presc.createdAt,
                    doctor: presc.doctor || { name: 'Inconnu', email: '' },
                    patient: presc.consultation?.patient || { name: 'Patient', email: '', dateOfBirth: null },
                    items: Array.isArray(parsedItems) ? parsedItems : []
                  };

                  return (
                    <div key={presc.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                      <div>
                        <p className="font-medium">
                          Dr. {presc.doctor?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(presc.createdAt), 'd MMMM yyyy', { locale: fr })}
                        </p>
                      </div>
                      <DownloadPrescriptionButton prescription={pdfData} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucune ordonnance disponible.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
