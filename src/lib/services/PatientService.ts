/**
 * src/lib/services/PatientService.ts
 * Service métier pour la gestion des patients
 * Cahier des Charges: MedFlow - Module Patients CRUD
 */

import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import type { Patient } from '@prisma/client';

export class PatientService {
  /**
   * Créer un nouveau patient
   * Permissions: [ADMIN, RECEPTIONIST]
   */
  static async createPatient(
    clinicId: string,
    data: {
      name: string;
      email?: string;
      phone?: string;
      dateOfBirth?: Date;
      gender?: string;
      address?: string;
      medicalHistory?: string;
    }
  ): Promise<Patient> {
    // Vérifier email unique dans la clinique
    if (data.email) {
      const existing = await prisma.patient.findFirst({
        where: {
          clinicId,
          email: data.email,
        },
      });

      if (existing) {
        throw new Error('EMAIL_ALREADY_EXISTS');
      }
    }

    // Créer patient
    const patient = await prisma.patient.create({
      data: {
        clinicId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        address: data.address,
        medicalHistory: data.medicalHistory,
      },
    });

    return patient;
  }

  /**
   * Récupérer un patient
   */
  static async getPatient(clinicId: string, patientId: string): Promise<Patient | null> {
    return await prisma.patient.findFirst({
      where: {
        id: patientId,
        clinicId, // Vérifier clinicId (multi-tenant)
      },
    });
  }

  /**
   * Lister les patients d'une clinique (avec pagination)
   */
  static async listPatients(
    clinicId: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      gender?: string;
    }
  ) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { clinicId };

    // Search par name ou email
    if (options?.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    // Filter par gender
    if (options?.gender) {
      where.gender = options.gender;
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.patient.count({ where }),
    ]);

    return {
      patients,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Modifier un patient
   */
  static async updatePatient(
    clinicId: string,
    patientId: string,
    data: Partial<{
      name: string;
      email: string;
      phone: string;
      address: string;
      medicalHistory: string;
      dateOfBirth: Date;
      gender: string;
    }>
  ): Promise<Patient> {
    // Vérifier que le patient appartient à la clinique
    const patient = await this.getPatient(clinicId, patientId);
    if (!patient) {
      throw new Error('PATIENT_NOT_FOUND');
    }

    // Vérifier email unique si modifié
    if (data.email && data.email !== patient.email) {
      const existing = await prisma.patient.findFirst({
        where: {
          clinicId,
          email: data.email,
          NOT: { id: patientId },
        },
      });

      if (existing) {
        throw new Error('EMAIL_ALREADY_EXISTS');
      }
    }

    // Mettre à jour
    const updated = await prisma.patient.update({
      where: { id: patientId },
      data,
    });

    return updated;
  }

  /**
   * Récupérer l'historique complet d'un patient (dossier médical)
   */
  static async getPatientRecords(clinicId: string, patientId: string) {
    // Vérifier que patient appartient à clinique
    const patient = await this.getPatient(clinicId, patientId);
    if (!patient) {
      throw new Error('PATIENT_NOT_FOUND');
    }

    // Récupérer toutes les données liées
    const [appointments, consultations, prescriptions, invoices] = await Promise.all([
      prisma.appointment.findMany({
        where: { patientId, clinicId },
        include: {
          doctor: { select: { id: true, name: true, email: true } },
          service: { select: { id: true, name: true, price: true } },
          consultation: true,
        },
        orderBy: { startAt: 'desc' },
      }),
      prisma.consultation.findMany({
        where: { patientId },
        include: {
          doctor: { select: { id: true, name: true } },
          prescriptions: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.prescription.findMany({
        where: {
          consultation: { patientId },
        },
        include: { consultation: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.findMany({
        where: { patientId, clinicId },
        include: { payments: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      patient,
      appointments,
      consultations,
      prescriptions,
      invoices,
    };
  }

  /**
   * Supprimer un patient (soft delete optionnel, hard delete ici)
   */
  static async deletePatient(clinicId: string, patientId: string): Promise<void> {
    // Vérifier que le patient appartient à la clinique
    const patient = await this.getPatient(clinicId, patientId);
    if (!patient) {
      throw new Error('PATIENT_NOT_FOUND');
    }

    // Cascade delete via Prisma
    await prisma.patient.delete({
      where: { id: patientId },
    });
  }
}

export default PatientService;
