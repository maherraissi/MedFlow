import { db } from '@/lib/db';

export const getAppointmentById = async (id: string) => {
  try {
    const appointment = await db.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        service: true,
      },
    });
    return appointment;
  } catch (error) {
    console.error('Failed to fetch appointment:', error);
    return null;
  }
};
