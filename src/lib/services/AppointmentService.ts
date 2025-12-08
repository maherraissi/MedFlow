// src/lib/services/AppointmentService.ts
// Service métier pour gestion des rendez-vous

import { prisma } from '@/lib/prisma';
import { AppointmentSchema, UpdateAppointmentSchema, BookAppointmentSchema } from '@/lib/schemas';
import { z } from 'zod';

export class AppointmentService {
  /**
   * Créer un rendez-vous (admin/receptionist)
   */
  static async createAppointment(clinicId: string, data: z.infer<typeof AppointmentSchema>) {
    const validated = AppointmentSchema.parse(data);

    // Vérifier les conflits d'horaire pour le médecin
    const conflict = await prisma.appointment.findFirst({
      where: {
        clinicId,
        doctorId: validated.doctorId,
        status: { notIn: ['CANCELLED'] },
        startAt: {
          lt: validated.endAt,
          gte: validated.startAt,
        },
      },
    });

    if (conflict) {
      throw new Error('Time slot conflict with existing appointment');
    }

    return prisma.appointment.create({
      data: {
        clinicId,
        patientId: validated.patientId,
        doctorId: validated.doctorId,
        serviceId: validated.serviceId,
        startAt: validated.startAt,
        endAt: validated.endAt,
        notes: validated.notes,
        status: 'BOOKED',
      },
      include: { patient: true, doctor: true, service: true },
    });
  }

  /**
   * Réserver via portail patient (public)
   */
  static async bookAppointment(clinicId: string, data: z.infer<typeof BookAppointmentSchema>) {
    const validated = BookAppointmentSchema.parse(data);

    // Trouver ou créer le patient
    let patient = await prisma.patient.findFirst({
      where: { clinicId, email: validated.patientEmail },
    });

    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          clinicId,
          name: validated.patientName,
          email: validated.patientEmail,
        },
      });
    }

    // Créer le rendez-vous
    const appointment = await prisma.appointment.create({
      data: {
        clinicId,
        patientId: patient.id,
        serviceId: validated.serviceId,
        startAt: validated.startAt,
        endAt: new Date(validated.startAt.getTime() + 30 * 60000), // 30 min default
        status: 'BOOKED',
      },
      include: { patient: true, service: true },
    });

    return { appointment, patientCreated: !patient };
  }

  /**
   * Récupérer les rendez-vous avec filtres
   */
  static async getAppointments(
    clinicId: string,
    options?: {
      page?: number;
      limit?: number;
      doctorId?: string;
      patientId?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { clinicId };

    if (options?.doctorId) where.doctorId = options.doctorId;
    if (options?.patientId) where.patientId = options.patientId;
    if (options?.status) where.status = options.status;

    if (options?.startDate || options?.endDate) {
      where.startAt = {};
      if (options?.startDate) where.startAt.gte = options.startDate;
      if (options?.endDate) where.startAt.lte = options.endDate;
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        include: { patient: true, doctor: true, service: true },
        orderBy: { startAt: 'asc' },
      }),
      prisma.appointment.count({ where }),
    ]);

    return { appointments, total, page, limit };
  }

  /**
   * Récupérer un rendez-vous par ID
   */
  static async getAppointmentById(clinicId: string, appointmentId: string) {
    return prisma.appointment.findFirst({
      where: { id: appointmentId, clinicId },
      include: {
        patient: true,
        doctor: true,
        service: true,
        consultation: { include: { prescriptions: true } },
        invoice: { include: { payments: true } },
      },
    });
  }

  /**
   * Mettre à jour un rendez-vous
   */
  static async updateAppointment(clinicId: string, appointmentId: string, data: z.infer<typeof UpdateAppointmentSchema>) {
    const validated = UpdateAppointmentSchema.parse(data);

    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, clinicId },
    });

    if (!appointment) throw new Error('Appointment not found');

    return prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        startAt: validated.startAt,
        endAt: validated.endAt,
        status: validated.status,
        notes: validated.notes,
      },
      include: { patient: true, doctor: true, service: true },
    });
  }

  /**
   * Changer le statut d'un rendez-vous
   */
  static async updateAppointmentStatus(clinicId: string, appointmentId: string, status: string) {
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, clinicId },
    });

    if (!appointment) throw new Error('Appointment not found');

    return prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });
  }

  /**
   * Annuler un rendez-vous
   */
  static async cancelAppointment(clinicId: string, appointmentId: string) {
    return this.updateAppointmentStatus(clinicId, appointmentId, 'CANCELLED');
  }
}
