import { getAppointments } from '@/lib/actions';
import AddAppointmentForm from '@/app/components/dashboard/add-appointment-form';
import AppointmentCalendar from '@/app/components/dashboard/appointment-calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Button } from '@/app/components/ui/button';
import Link from 'next/link';

const statusLabels: Record<string, string> = {
  SCHEDULED: 'Planifié',
  CONFIRMED: 'Confirmé',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
  NO_SHOW: 'Absent'
};

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-700',
  NO_SHOW: 'bg-orange-100 text-orange-700'
};

export default async function AppointmentsPage() {
  const appointments = await getAppointments();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Rendez-vous</h1>
          <p className="text-sm text-gray-500 mt-1">Planifiez et gérez les rendez-vous de vos patients</p>
        </div>
        <AddAppointmentForm />
      </div>
      
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
          <TabsTrigger value="list">Liste</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar">
          <AppointmentCalendar appointments={appointments} />
        </TabsContent>
        
        <TabsContent value="list">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Médecin</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date & Heure</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">{appointment.patient.name}</TableCell>
                    <TableCell>{appointment.doctor.name}</TableCell>
                    <TableCell>{appointment.service.name}</TableCell>
                    <TableCell>{new Date(appointment.startAt).toLocaleString('fr-FR')}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[appointment.status]}`}>
                        {statusLabels[appointment.status]}
                      </span>
                    </TableCell>
                    <TableCell>
                      {appointment.status === 'CONFIRMED' && (
                        <Link href={`/dashboard/consultations/new?appointmentId=${appointment.id}`}>
                          <Button size="sm">Démarrer la consultation</Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
