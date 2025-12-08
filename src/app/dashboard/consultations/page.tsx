import { getConsultations } from '@/lib/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import PrescriptionPDF from '@/app/components/dashboard/prescription-pdf';
import Link from 'next/link';

export default async function ConsultationsPage() {
  const consultations = await getConsultations();

  return (
    <div className="motion-safe:animate-fade-in-up">
      <div className="flex items-center justify-between mb-6 motion-safe:animate-fade-in-up animation-delay-100">
        <h1 className="text-2xl font-bold">Gestion des Consultations</h1>
        {/* Bouton d'ajout */}
      </div>
      <div className="border rounded-lg motion-safe:animate-fade-in-up animation-delay-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Médecin</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Diagnostic</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consultations.map((consultation) => (
              <TableRow key={consultation.id}>
                <TableCell>{consultation.patient.name}</TableCell>
                <TableCell>{consultation.doctor.name}</TableCell>
                <TableCell>{new Date(consultation.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{consultation.diagnosis}</TableCell>
                <TableCell>
                  {consultation.prescriptions && consultation.prescriptions.length > 0 ? (
                    <PrescriptionPDF consultation={consultation} />
                  ) : (
                    <Link href={`/dashboard/prescriptions/new?consultationId=${consultation.id}`}>Créer une ordonnance</Link>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
