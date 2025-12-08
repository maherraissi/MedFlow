import { getInvoices } from '@/lib/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Button } from '@/app/components/ui/button';
import PaymentButton from '@/app/components/PaymentButton';

const statusLabels: Record<string, string> = {
  PENDING: 'En attente',
  PAID: 'Payée',
  CANCELLED: 'Annulée',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des Factures</h1>
        {/* Bouton d'ajout */}
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date d'échéance</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.patient.name}</TableCell>
                <TableCell>{invoice.total.toFixed(2)} €</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${statusColors[invoice.status]}`}>
                    {statusLabels[invoice.status]}
                  </span>
                </TableCell>
                <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  {invoice.status === 'PENDING' && (
                    <PaymentButton invoiceId={invoice.id} />
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
