import { getServices } from '@/lib/actions';
import AddServiceForm from '@/app/components/dashboard/add-service-form';
import ServiceActions from '@/app/components/dashboard/service-actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des Services</h1>
        <AddServiceForm />
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Durée (min)</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.description}</TableCell>
                <TableCell>{service.price}</TableCell>
                <TableCell>{service.durationMinutes}</TableCell>
                <TableCell>
                  <ServiceActions service={service} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
