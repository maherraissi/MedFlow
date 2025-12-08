
"use client";

import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import fr from 'date-fns/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/app/components/ui/dialog';
import { Card } from '@/app/components/ui/card';
import { BookAppointmentForm } from '../portal/book-appointment-form'; // Reusing this or creating similar

const locales = {
    'fr': fr,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface Appointment {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource?: any;
}

export default function CalendarView({ appointments }: { appointments: any[] }) {
    const [view, setView] = useState<View>(Views.WEEK);

    const events = appointments.map(appt => ({
        id: appt.id,
        title: `${appt.patient.name} - ${appt.service.name}`,
        start: new Date(appt.startAt),
        end: new Date(appt.endAt),
        resource: appt,
    }));

    return (
        <div className="h-[600px] bg-white p-4 rounded-lg shadow-sm border">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                views={['month', 'week', 'day']}
                view={view}
                onView={setView}
                culture='fr'
                messages={{
                    next: "Suivant",
                    previous: "Précédent",
                    today: "Aujourd'hui",
                    month: "Mois",
                    week: "Semaine",
                    day: "Jour",
                    agenda: "Agenda",
                    date: "Date",
                    time: "Heure",
                    event: "Événement",
                    noEventsInRange: "Aucun rendez-vous dans cette plage.",
                }}
                eventPropGetter={(event) => {
                    const status = event.resource.status;
                    let backgroundColor = '#3174ad';
                    if (status === 'CONFIRMED') backgroundColor = '#10b981';
                    if (status === 'CANCELLED') backgroundColor = '#ef4444';
                    return { style: { backgroundColor } };
                }}
            />
        </div>
    );
}
