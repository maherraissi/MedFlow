import { getPatients } from '@/lib/actions';
import AddPatientForm from '@/app/components/dashboard/add-patient-form';
import PatientActions from '@/app/components/dashboard/patient-actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';

export default async function PatientsPage() {
  const patients = await getPatients();

  return (
    <div className="motion-safe:animate-fade-in-up">
      <div className="flex items-center justify-between mb-6 motion-safe:animate-fade-in-up animation-delay-100">
        <h1 className="text-2xl font-bold">Gestion des Patients</h1>
        <AddPatientForm />
      </div>
      <div className="border rounded-lg motion-safe:animate-fade-in-up animation-delay-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Date de Naissance</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.name}</TableCell>
                <TableCell>{patient.email}</TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell>{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>
                  <PatientActions patient={patient} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
