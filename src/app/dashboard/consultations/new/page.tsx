import { getAppointmentById } from '@/lib/data'; // Assuming data fetching functions are in /lib/data
import ConsultationForm from '@/app/components/dashboard/consultation-form';

export default async function NewConsultationPage({ searchParams }: { searchParams: { appointmentId: string } }) {
  const appointmentId = searchParams.appointmentId;
  if (!appointmentId) {
    return <div>Rendez-vous non spécifié.</div>;
  }

  const appointment = await getAppointmentById(appointmentId);

  if (!appointment) {
    return <div>Rendez-vous non trouvé.</div>;
  }

  return (
    <div className="motion-safe:animate-fade-in-up">
      <h1 className="text-2xl font-bold mb-4">Nouvelle Consultation</h1>
      <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
        <p><strong>Patient:</strong> {appointment.patient.name}</p>
        <p><strong>Date:</strong> {new Date(appointment.startAt).toLocaleString('fr-FR')}</p>
        <p><strong>Service:</strong> {appointment.service.name}</p>
      </div>
      <ConsultationForm appointment={appointment} />
    </div>
  );
}
