"use client";

import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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

export default function AppointmentCalendar({ appointments }: { appointments: any[] }) {
  // Transform appointments to calendar events
  const events = appointments.map(apt => ({
    id: apt.id,
    title: `${apt.patient.firstName} ${apt.patient.lastName} - ${apt.service.name}`,
    start: new Date(apt.date),
    end: new Date(new Date(apt.date).getTime() + apt.service.duration * 60000),
    resource: apt,
  }));

  const eventStyleGetter = (event: any) => {
    const status = event.resource.status;
    let backgroundColor = '#3174ad';
    
    switch (status) {
      case 'CONFIRMED':
        backgroundColor = '#10b981';
        break;
      case 'IN_PROGRESS':
        backgroundColor = '#f59e0b';
        break;
      case 'COMPLETED':
        backgroundColor = '#6b7280';
        break;
      case 'CANCELLED':
        backgroundColor = '#ef4444';
        break;
      case 'NO_SHOW':
        backgroundColor = '#f97316';
        break;
      default:
        backgroundColor = '#3b82f6';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div className="bg-white p-4 rounded-lg border" style={{ height: '700px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        culture="fr"
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
          noEventsInRange: "Aucun rendez-vous dans cette période",
        }}
      />
    </div>
  );
}
