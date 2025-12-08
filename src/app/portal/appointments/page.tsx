import { auth } from '@/auth';
import { getMyAppointmentsByEmail, getServices, getDoctors } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import BookAppointmentForm from '@/app/components/portal/book-appointment-form';

export default async function AppointmentsPage() {
    const session = await auth();
    const email = session?.user?.email;

    const appointments = email ? await getMyAppointmentsByEmail(email) : [];
    const services = await getServices();
    const doctors = await getDoctors();

    const upcoming = appointments.filter(a => new Date(a.startAt) > new Date()).reverse();
    const past = appointments.filter(a => new Date(a.startAt) <= new Date());

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Mes Rendez-vous</h1>
                    <p className="text-gray-600 dark:text-gray-400">Consultez vos rendez-vous passés et à venir.</p>
                </div>

                <BookAppointmentForm services={services} doctors={doctors} />
            </div>

            <div className="grid gap-6">
                <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        À venir
                    </h2>
                    {upcoming.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {upcoming.map((appt) => (
                                <AppointmentCard key={appt.id} appointment={appt} isUpcoming />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">Aucun rendez-vous à venir.</p>
                    )}
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Clock className="h-5 w-5" />
                        Historique
                    </h2>
                    {past.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {past.map((appt) => (
                                <AppointmentCard key={appt.id} appointment={appt} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">Aucun historique de rendez-vous.</p>
                    )}
                </section>
            </div>
        </div>
    );
}

function AppointmentCard({ appointment, isUpcoming }: { appointment: any, isUpcoming?: boolean }) {
    return (
        <Card className={`overflow-hidden transition-all hover:shadow-md ${isUpcoming ? 'border-blue-200 dark:border-blue-800' : ''}`}>
            <CardHeader className={`pb-3 ${isUpcoming ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-semibold">
                        {format(new Date(appointment.startAt), 'EEEE d MMMM yyyy', { locale: fr })}
                    </CardTitle>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                            appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                        }`}>
                        {appointment.status === 'CONFIRMED' ? 'Confirmé' :
                            appointment.status === 'CANCELLED' ? 'Annulé' : 'Programmé'}
                    </span>
                </div>
                <CardDescription className="flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3" />
                    {format(new Date(appointment.startAt), 'HH:mm')} - {format(new Date(appointment.endAt), 'HH:mm')}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{appointment.service?.name}</p>
                        <p className="text-xs text-gray-500">Service</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Dr. {appointment.doctor?.name}</p>
                        <p className="text-xs text-gray-500">Médecin</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
