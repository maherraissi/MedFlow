
import { auth } from '@/auth';
import { getAppointments } from '@/lib/actions';
import CalendarView from '@/app/components/dashboard/calendar-view';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

export default async function CalendarPage() {
    const session = await auth();
    const appointments = await getAppointments();

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Agenda</h1>
            </div>

            <CalendarView appointments={appointments} />
        </div>
    );
}
