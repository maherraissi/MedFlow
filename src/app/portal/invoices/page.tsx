
import { auth } from '@/auth';
import { getMyInvoicesByEmail } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import PayInvoiceButton from '@/app/components/portal/pay-invoice-button';
import { Badge } from '@/app/components/ui/badge';

export default async function PortalInvoicesPage() {
    const session = await auth();
    const email = session?.user?.email;

    const invoices = email ? await getMyInvoicesByEmail(email) : [];

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Mes Factures</h1>
                    <p className="text-gray-600 dark:text-gray-400">Consultez et réglez vos factures médicales.</p>
                </div>
            </div>

            <div className="grid gap-6">
                {invoices.length > 0 ? (
                    invoices.map((invoice) => (
                        <Card key={invoice.id} className="overflow-hidden border-l-4 border-l-primary/50">
                            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm text-muted-foreground">#{invoice.id.slice(-8)}</span>
                                        <Badge variant={
                                            invoice.status === 'PAID' ? 'default' :
                                                invoice.status === 'OVERDUE' ? 'destructive' : 'secondary'
                                        }>
                                            {invoice.status === 'PAID' ? 'Payée' :
                                                invoice.status === 'SENT' ? 'En attente' :
                                                    invoice.status === 'DRAFT' ? 'Brouillon' :
                                                        invoice.status === 'OVERDUE' ? 'En retard' : invoice.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Emise le {format(new Date(invoice.createdAt), 'd MMMM yyyy', { locale: fr })}
                                    </p>
                                    {invoice.dueDate && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Échéance: {format(new Date(invoice.dueDate), 'd MMM yyyy')}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Montant Total</p>
                                        <p className="text-2xl font-bold">{invoice.total.toFixed(2)} €</p>
                                    </div>

                                    {invoice.status !== 'PAID' && invoice.status !== 'DRAFT' ? (
                                        <PayInvoiceButton invoiceId={invoice.id} amount={invoice.total} />
                                    ) : invoice.status === 'PAID' ? (
                                        <div className="flex items-center gap-2 text-green-600 font-medium px-4 py-2 bg-green-50 rounded-md border border-green-100">
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Réglée</span>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground italic px-4">
                                            Non payable
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                        <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">Aucune facture</h3>
                        <p className="text-muted-foreground">Vous n'avez aucune facture pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
