import PrescriptionForm from '@/app/components/dashboard/prescription-form';

export default function NewPrescriptionPage({ searchParams }: { searchParams: { consultationId: string } }) {
  const consultationId = searchParams.consultationId;

  if (!consultationId) {
    return <div>Consultation non spécifiée.</div>;
  }

  return (
    <div className="motion-safe:animate-fade-in-up">
      <h1 className="text-2xl font-bold mb-4">Nouvelle Ordonnance</h1>
      <PrescriptionForm consultationId={consultationId} />
    </div>
  );
}
