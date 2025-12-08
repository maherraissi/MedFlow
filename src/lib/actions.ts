"use server";

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { signIn, signOut, auth } from '@/auth';
import { AuthError } from 'next-auth';
import { db } from '@/lib/db';
import Stripe from 'stripe';
import { LoginSchema, RegisterSchema, RegisterClinicSchema, PatientSchema, ServiceSchema, ConsultationSchema, PrescriptionSchema, InvoiceSchema, AppointmentSchema, InviteUserSchema, SetPasswordSchema } from './schemas';
import { createCheckoutSession } from './stripe';
import { sendEmail } from '@/lib/email';
const ClinicUpdateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Champs invalides.' };
  }

  const { email, password } = validatedFields.data;

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Email ou mot de passe incorrect.' };
        default:
          return { error: 'Une erreur s\'est produite.' };
      }
    }

    throw error;
  }

  return { success: 'Connexion réussie !' };
};

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Champs invalides.' };
  }

  const { name, email, password, clinicName } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: 'Cet email est déjà utilisé.' };
  }

  // Transaction to create clinic and user
  try {
    await db.$transaction(async (prisma) => {
      const newClinic = await prisma.clinic.create({
        data: {
          name: clinicName,
          email: email,
        },
      });

      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          clinicId: newClinic.id,
          role: 'ADMIN',
        },
      });
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return { error: 'Une erreur est survenue lors de la création du compte.' };
  }

  return { success: 'Compte créé avec succès !' };
};

export const registerClinic = async (values: z.infer<typeof RegisterClinicSchema>) => {
  const validatedFields = RegisterClinicSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Champs invalides' };
  }

  const { clinicName, address, adminName, email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await db.user.findUnique({
    where: { email },
  });



  if (existingUser) {
    return { error: 'Cet email est déjà utilisé !' };
  }

  try {
    await db.$transaction(async (tx) => {
      const clinic = await tx.clinic.create({
        data: {
          name: clinicName,
          address: address,
        },
      });

      await tx.user.create({
        data: {
          name: adminName,
          email,
          password: hashedPassword,
          role: 'ADMIN',
          clinicId: clinic.id,
          status: 'ACTIVE',
        },
      });
    });

    return { success: 'Clinique créée avec succès ! Connectez-vous.' };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: "Une erreur s'est produite lors de l'inscription." };
  }
};

export const logout = async () => {
  await signOut();
};

export const getPatients = async () => {
  const session = await auth();
  if (!session?.user?.clinicId) {
    return [];
  }

  try {
    const patients = await db.patient.findMany({
      where: { clinicId: session.user.clinicId },
      orderBy: { createdAt: 'desc' }
    });
    return patients;
  } catch (error) {
    console.error('Failed to fetch patients:', error);
    return [];
  }
};

export const createPatient = async (values: z.infer<typeof PatientSchema>) => {
  const validatedFields = PatientSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Champs invalides.' };
  }

  const { name, email, phone, dateOfBirth, gender, address, medicalHistory } = validatedFields.data;
  const session = await auth();
  if (!session?.user?.clinicId) {
    return { error: 'Utilisateur non authentifié ou clinique non trouvée.' };
  }

  try {
    await db.patient.create({
      data: {
        name,
        email,
        phone,
        dateOfBirth,
        gender,
        address,
        medicalHistory,
        clinicId: session.user.clinicId,
      },
    });

    return { success: 'Patient créé avec succès !' };
  } catch (error) {
    console.error('Erreur lors de la création du patient:', error);
    return { error: 'Erreur lors de la création du patient.' };
  }
};

export const updatePatient = async (id: string, values: z.infer<typeof PatientSchema>) => {
  const validatedFields = PatientSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Champs invalides.' };
  }

  const { name, email, phone, dateOfBirth, gender, address, medicalHistory } = validatedFields.data;

  try {
    await db.patient.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        dateOfBirth,
        gender,
        address,
        medicalHistory,
      },
    });

    return { success: 'Patient mis à jour avec succès !' };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du patient:', error);
    return { error: 'Erreur lors de la mise à jour du patient.' };
  }
};

export const deletePatient = async (id: string) => {
  try {
    await db.patient.delete({ where: { id } });
    return { success: 'Patient supprimé avec succès !' };
  } catch (error) {
    return { error: 'Erreur lors de la suppression du patient.' };
  }
};

// Services
export const getServices = async () => {
  const session = await auth();
  if (!session?.user?.clinicId) {
    return [];
  }

  try {
    const services = await db.service.findMany({
      where: { clinicId: session.user.clinicId },
      orderBy: { createdAt: 'desc' }
    });
    return services;
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return [];
  }
};

export const createService = async (values: z.infer<typeof ServiceSchema>) => {
  const validatedFields = ServiceSchema.safeParse(values);
  if (!validatedFields.success) return { error: 'Champs invalides.' };

  const { name, description, price, durationMinutes } = validatedFields.data;
  const session = await auth();
  if (!session?.user?.clinicId) {
    return { error: 'Utilisateur non authentifié ou clinique non trouvée.' };
  }

  try {
    await db.service.create({
      data: {
        name,
        description,
        price,
        durationMinutes,
        clinicId: session.user.clinicId
      }
    });
    return { success: 'Service créé !' };
  } catch (error) {
    console.error('Erreur lors de la création du service:', error);
    return { error: 'Erreur lors de la création du service.' };
  }
};

export const updateService = async (id: string, values: z.infer<typeof ServiceSchema>) => {
  const validatedFields = ServiceSchema.safeParse(values);
  if (!validatedFields.success) return { error: 'Champs invalides.' };

  const { name, description, price, durationMinutes } = validatedFields.data;
  try {
    await db.service.update({ where: { id }, data: { name, description, price, durationMinutes } });
    return { success: 'Service mis à jour !' };
  } catch (error) {
    return { error: 'Erreur lors de la mise à jour du service.' };
  }
};

export const deleteService = async (id: string) => {
  try {
    await db.service.delete({ where: { id } });
    return { success: 'Service supprimé !' };
  } catch (error) {
    return { error: 'Erreur lors de la suppression du service.' };
  }
};

// Consultations
export const getAppointments = async () => {
  const session = await auth();
  if (!session?.user?.clinicId) {
    return [];
  }

  try {
    const appointments = await db.appointment.findMany({
      where: { clinicId: session.user.clinicId },
      include: {
        patient: true,
        doctor: true,
        service: true
      },
      orderBy: { startAt: 'desc' }
    });
    return appointments;
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return [];
  }
};

export const createAppointment = async (values: z.infer<typeof AppointmentSchema>) => {
  const validatedFields = AppointmentSchema.safeParse(values);
  if (!validatedFields.success) return { error: 'Champs invalides.' };

  const { patientId, doctorId, serviceId, startAt, endAt, notes } = validatedFields.data;
  const session = await auth();
  if (!session?.user?.clinicId) {
    return { error: 'Utilisateur non authentifié ou clinique non trouvée.' };
  }

  try {
    const result = await db.appointment.create({
      data: {
        patientId,
        doctorId,
        serviceId,
        startAt,
        endAt,
        notes: notes || '',
        clinicId: session.user.clinicId,
      },
      include: { patient: true, service: true, doctor: true }
    });

    if (result.patient.email) {
      await sendEmail({
        to: result.patient.email,
        subject: 'Confirmation de votre Rendez-vous - MedFlow',
        html: `
          <h1>Rendez-vous Confirmé</h1>
          <p>Bonjour ${result.patient.name},</p>
          <p>Votre rendez-vous pour <strong>${result.service.name}</strong> avec Dr. ${result.doctor.name} a été confirmé.</p>
          <p><strong>Date:</strong> ${result.startAt.toLocaleString('fr-FR')}</p>
          <p>Merci de votre confiance.</p>
        `,
      });
    }

    return { success: 'Rendez-vous créé avec succès !' };
  } catch (error) {
    console.error('Error creating appointment:', error);
    return { error: 'Erreur lors de la création du rendez-vous.' };
  }
};

export const updateAppointmentStatus = async (appointmentId: string, status: string) => {
  try {
    await db.appointment.update({
      where: { id: appointmentId },
      data: { status: status as any }
    });
    return { success: 'Statut mis à jour avec succès !' };
  } catch (error) {
    console.error('Error updating appointment status:', error);
    return { error: 'Erreur lors de la mise à jour du statut.' };
  }
};

export const deleteAppointment = async (appointmentId: string) => {
  try {
    await db.appointment.delete({ where: { id: appointmentId } });
    return { success: 'Rendez-vous supprimé avec succès !' };
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return { error: 'Erreur lors de la suppression du rendez-vous.' };
  }
};

export const getDoctors = async () => {
  try {
    const doctors = await db.user.findMany({
      where: { role: 'DOCTOR' },
      select: { id: true, name: true, email: true }
    });
    return doctors;
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
    throw new Error('Failed to fetch doctors.');
  }
};

export const getConsultations = async () => {
  const session = await auth();
  if (!session?.user?.clinicId) throw new Error('Unauthorized');

  try {
    const consultations = await db.consultation.findMany({
      where: { doctor: { clinicId: session.user.clinicId } }, // Filter by clinicId through the doctor relation
      include: { prescriptions: true, patient: true, doctor: true },
    });
    return consultations;
  } catch (error) {
    console.error('Failed to fetch consultations:', error);
    throw new Error('Failed to fetch consultations.');
  }
};

export const createConsultation = async (values: z.infer<typeof ConsultationSchema>) => {
  const validatedFields = ConsultationSchema.safeParse(values);
  if (!validatedFields.success) return { error: 'Champs invalides.' };

  const { appointmentId, patientId, notes, diagnosis } = validatedFields.data;
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    await db.consultation.create({
      data: {
        appointmentId,
        patientId,
        doctorId: session.user.id,
        notes,
        diagnosis
      }
    });
    return { success: 'Consultation créée !' };
  } catch (error) {
    console.error('Erreur lors de la création de la consultation:', error);
    return { error: 'Erreur lors de la création de la consultation.' };
  }
};

// Prescriptions
export const createPrescription = async (values: z.infer<typeof PrescriptionSchema>) => {
  const validatedFields = PrescriptionSchema.safeParse(values);
  if (!validatedFields.success) return { error: 'Champs invalides.' };

  const { consultationId, items } = validatedFields.data;
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    await db.prescription.create({
      data: {
        consultationId,
        doctorId: session.user.id,
        items: JSON.stringify(items) // Prisma expects a string for JSON fields
      }
    });
    return { success: 'Prescription créée !' };
  } catch (error) {
    console.error('Erreur lors de la création de la prescription:', error);
    return { error: 'Erreur lors de la création de la prescription.' };
  }
};

// Invoices
export const getInvoices = async () => {
  const session = await auth();
  if (!session?.user?.clinicId) {
    return [];
  }

  try {
    const invoices = await db.invoice.findMany({
      where: { clinicId: session.user.clinicId },
      include: { patient: true },
      orderBy: { createdAt: 'desc' }
    });
    return invoices;
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
    return [];
  }
};

export const createInvoice = async (values: z.infer<typeof InvoiceSchema>) => {
  const validatedFields = InvoiceSchema.safeParse(values);
  if (!validatedFields.success) return { error: 'Champs invalides.' };

  const { patientId, appointmentId, items, dueDate } = validatedFields.data;
  const session = await auth();
  if (!session?.user?.clinicId) return { error: 'Unauthorized' };

  const total = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

  try {
    await db.invoice.create({
      data: {
        patientId,
        appointmentId,
        items: JSON.stringify(items),
        total,
        dueDate,
        clinicId: session.user.clinicId
      }
    });
    return { success: 'Facture créée !' };
  } catch (error) {
    console.error('Erreur lors de la création de la facture:', error);
    return { error: 'Erreur lors de la création de la facture.' };
  }
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


// Stats
export const getStats = async () => {
  const session = await auth();
  if (!session?.user?.clinicId) {
    return {
      patientCount: 0,
      appointmentCount: 0,
      serviceCount: 0,
      invoiceCount: 0,
      consultationCount: 0,
      userCount: 0,
      todayAppointments: 0,
      pendingInvoices: 0,
      totalRevenue: 0
    };
  }

  try {
    const clinicId = session.user.clinicId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      patientCount,
      appointmentCount,
      serviceCount,
      invoiceCount,
      consultationCount,
      userCount,
      todayAppointments,
      pendingInvoices,
      paidInvoices
    ] = await Promise.all([
      db.patient.count({ where: { clinicId } }),
      db.appointment.count({ where: { clinicId } }),
      db.service.count({ where: { clinicId, isActive: true } }),
      db.invoice.count({ where: { clinicId } }),
      db.consultation.count({
        where: {
          appointment: { clinicId }
        }
      }),
      db.user.count({ where: { clinicId, isActive: true } }),
      db.appointment.count({
        where: {
          clinicId,
          startAt: { gte: today, lt: tomorrow },
          status: { not: 'CANCELLED' }
        }
      }),
      db.invoice.count({
        where: {
          clinicId,
          status: { in: ['DRAFT', 'SENT', 'OVERDUE'] }
        }
      }),
      db.invoice.aggregate({
        where: {
          clinicId,
          status: 'PAID'
        },
        _sum: { total: true }
      })
    ]);

    return {
      patientCount,
      appointmentCount,
      serviceCount,
      invoiceCount,
      consultationCount,
      userCount,
      todayAppointments,
      pendingInvoices,
      totalRevenue: paidInvoices._sum.total || 0
    };
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return {
      patientCount: 0,
      appointmentCount: 0,
      serviceCount: 0,
      invoiceCount: 0,
      consultationCount: 0,
      userCount: 0,
      todayAppointments: 0,
      pendingInvoices: 0,
      totalRevenue: 0
    };
  }
};

// Récupérer les données récentes pour le dashboard
export const getRecentData = async () => {
  const session = await auth();
  if (!session?.user?.clinicId) {
    return {
      recentPatients: [],
      recentAppointments: [],
      recentInvoices: []
    };
  }

  try {
    const clinicId = session.user.clinicId;

    const [recentPatients, recentAppointments, recentInvoices] = await Promise.all([
      db.patient.findMany({
        where: { clinicId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true
        }
      }),
      db.appointment.findMany({
        where: { clinicId },
        take: 5,
        orderBy: { startAt: 'desc' },
        include: {
          patient: { select: { name: true, email: true } },
          doctor: { select: { name: true } },
          service: { select: { name: true } }
        }
      }),
      db.invoice.findMany({
        where: { clinicId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { select: { name: true, email: true } }
        }
      })
    ]);

    return {
      recentPatients,
      recentAppointments,
      recentInvoices
    };
  } catch (error) {
    console.error('Failed to fetch recent data:', error);
    return {
      recentPatients: [],
      recentAppointments: [],
      recentInvoices: []
    };
  }
};

export const createCheckoutSessionAction = async (invoiceId: string) => {
  try {
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: { patient: true, clinic: true },
    });

    if (!invoice || !invoice.patient.email) {
      return { error: 'Facture ou email du patient non trouvé.' };
    }

    const session = await createCheckoutSession(
      invoice.total,
      invoice.id,
      invoice.patient.email,
      invoice.clinic.name
    );

    if (session.url) {
      return { url: session.url };
    }

    return { error: 'Erreur lors de la création de la session de paiement.' };
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    return { error: 'Erreur interne.' };
  }
};

// Users Management
export const getUsers = async () => {
  try {
    const session = await auth();
    if (!session?.user?.clinicId || session.user.role !== 'ADMIN') {
      return [];
    }

    const users = await db.user.findMany({
      where: { clinicId: session.user.clinicId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        status: true,
        createdAt: true,
        clinicId: true,
        invitationExpiresAt: true,
      }
    });
    return users;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw new Error('Failed to fetch users.');
  }
};

export const createUser = async (values: z.infer<typeof InviteUserSchema>) => {
  const validatedFields = InviteUserSchema.safeParse(values);
  if (!validatedFields.success) return { error: 'Champs invalides.' };

  const { name, email, role, password } = validatedFields.data;
  const session = await auth();
  if (!session?.user?.clinicId || session.user.role !== 'ADMIN') return { error: 'Unauthorized' };

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: 'Cet email est déjà utilisé.' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        clinicId: session.user.clinicId,
        status: 'ACTIVE',
        isActive: true,
      }
    });

    return { success: 'Utilisateur créé avec succès !' };
  } catch (error) {
    console.error('Error creating user:', error);
    return { error: 'Erreur lors de la création de l\'utilisateur.' };
  }
};

export const resendInvitation = async (userId: string) => {
  const session = await auth();
  if (!session?.user?.clinicId || session.user.role !== 'ADMIN') return { error: 'Unauthorized' };

  const user = await db.user.findUnique({ where: { id: userId, clinicId: session.user.clinicId } });
  if (!user) return { error: 'Utilisateur non trouvé.' };
  if (user.status !== 'INVITED') return { error: 'Utilisateur déjà activé.' };

  const invitationToken = randomBytes(32).toString('hex');
  const invitationExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

  await db.user.update({
    where: { id: userId },
    data: { invitationToken, invitationExpiresAt },
  });

  // TODO: Send an invitation email with the token
  return { success: 'Invitation renvoyée.' };
};

export const completeInvitation = async (values: z.infer<typeof SetPasswordSchema>) => {
  const validated = SetPasswordSchema.safeParse(values);
  if (!validated.success) return { error: 'Champs invalides.' };

  const { token, password } = validated.data;

  const user = await db.user.findFirst({
    where: {
      invitationToken: token,
      invitationExpiresAt: { gt: new Date() },
      status: 'INVITED',
    },
  });

  if (!user) return { error: 'Invitation invalide ou expirée.' };

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      status: 'ACTIVE',
      invitationToken: null,
      invitationExpiresAt: null,
      isActive: true,
    },
  });

  return { success: 'Mot de passe défini, vous pouvez vous connecter.' };
};

export const updateUserRole = async (userId: string, role: string) => {
  const session = await auth();
  if (!session?.user?.clinicId || session.user.role !== 'ADMIN') return { error: 'Unauthorized' };

  try {
    await db.user.update({
      where: { id: userId, clinicId: session.user.clinicId },
      data: { role: role as any }
    });
    return { success: 'Rôle mis à jour avec succès !' };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { error: 'Erreur lors de la mise à jour du rôle.' };
  }
};

export const toggleUserStatus = async (userId: string) => {
  const session = await auth();
  if (!session?.user?.clinicId || session.user.role !== 'ADMIN') return { error: 'Unauthorized' };

  try {
    const user = await db.user.findUnique({ where: { id: userId, clinicId: session.user.clinicId } });
    if (!user) {
      return { error: 'Utilisateur non trouvé.' };
    }

    await db.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive }
    });

    return { success: `Utilisateur ${!user.isActive ? 'activé' : 'désactivé'} avec succès !` };
  } catch (error) {
    console.error('Error toggling user status:', error);
    return { error: 'Erreur lors de la modification du statut.' };
  }
};

export const deleteUser = async (userId: string) => {
  const session = await auth();
  if (!session?.user?.clinicId || session.user.role !== 'ADMIN') return { error: 'Unauthorized' };

  try {
    await db.user.delete({ where: { id: userId, clinicId: session.user.clinicId } });
    return { success: 'Utilisateur supprimé avec succès !' };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { error: 'Erreur lors de la suppression de l\'utilisateur.' };
  }
};

// Clinic (Clinic) management
export const getCurrentClinic = async () => {
  const clinic = await db.clinic.findFirst();
  return clinic;
};

export const updateClinic = async (values: z.infer<typeof ClinicUpdateSchema>) => {
  const validated = ClinicUpdateSchema.safeParse(values);
  if (!validated.success) return { error: 'Champs invalides.' };
  const current = await db.clinic.findFirst();
  if (!current) return { error: 'Aucun clinic trouvé.' };
  await db.clinic.update({ where: { id: current.id }, data: validated.data });
  return { success: 'Clinique mise à jour.' };
};

// Patient Portal data helpers
export const getPatientByEmail = async (email: string) => {
  const clinic = await db.clinic.findFirst();
  if (!clinic) return null;
  const patient = await db.patient.findFirst({ where: { clinicId: clinic.id, email } });
  return patient;
};

export const getMyAppointmentsByEmail = async (email: string) => {
  const patient = await getPatientByEmail(email);
  if (!patient) return [] as any[];
  const data = await db.appointment.findMany({
    where: { patientId: patient.id },
    include: { doctor: true, service: true },
    orderBy: { date: 'desc' },
  });
  return data;
};

export const getMyInvoicesByEmail = async (email: string) => {
  const patient = await getPatientByEmail(email);
  if (!patient) return [] as any[];
  const data = await db.invoice.findMany({
    where: { patientId: patient.id },
    orderBy: { createdAt: 'desc' },
  });
  return data;
};

export const getMyPrescriptionsByEmail = async (email: string) => {
  const patient = await getPatientByEmail(email);
  if (!patient) return [] as any[];
  const data = await db.prescription.findMany({
    where: {
      consultation: {
        appointment: {
          patientId: patient.id,
        },
      },
    },
    include: {
      doctor: { select: { name: true, email: true } },
      consultation: {
        include: {
          patient: { select: { name: true, email: true, dateOfBirth: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });
  return data;
};

// Patient-facing booking
export const bookMyAppointment = async (values: { serviceId: string; doctorId: string; date: Date; time: string; notes?: string }) => {
  try {
    const session = await auth();
    const email = session?.user?.email as string | undefined;
    if (!email) return { error: 'Non authentifié.' };

    const patient = await getPatientByEmail(email);
    if (!patient) return { error: 'Aucun profil patient associé.' };

    const [hours, minutes] = values.time.split(':');
    const appointmentDate = new Date(values.date);
    appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const clinic = await db.clinic.findFirst();
    if (!clinic) return { error: 'Aucun clinic trouvé.' };

    await db.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: values.doctorId,
        serviceId: values.serviceId,
        date: appointmentDate,
        status: 'SCHEDULED',
        notes: values.notes || '',
        clinicId: clinic.id,
      },
    });
    return { success: 'Rendez-vous créé.' };
  } catch (e: unknown) {
    return { error: 'Erreur lors de la réservation.' };
  }
};

export const cancelMyAppointment = async (appointmentId: string) => {
  try {
    const session = await auth();
    const email = session?.user?.email as string | undefined;
    if (!email) return { error: 'Non authentifié.' };
    const patient = await getPatientByEmail(email);
    if (!patient) return { error: 'Aucun profil patient associé.' };

    const appt = await db.appointment.findUnique({ where: { id: appointmentId } });
    if (!appt || appt.patientId !== patient.id) return { error: 'Accès refusé.' };

    await db.appointment.update({ where: { id: appointmentId }, data: { status: 'CANCELLED' } });
    return { success: 'Rendez-vous annulé.' };
  } catch (e: unknown) {
    return { error: 'Erreur lors de l\'annulation.' };
  }
};

export const setUserPassword = async (userId: string, password: string) => {
  const session = await auth();
  if (!session?.user?.clinicId || session.user.role !== 'ADMIN') return { error: 'Unauthorized' };

  if (password.length < 8) {
    return { error: 'Le mot de passe doit contenir au moins 8 caractères.' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.user.update({
      where: { id: userId, clinicId: session.user.clinicId },
      data: {
        password: hashedPassword,
        status: 'ACTIVE',
        isActive: true,
        invitationToken: null,
        invitationExpiresAt: null,
      },
    });
    return { success: 'Mot de passe mis à jour avec succès !' };
  } catch (error) {
    console.error('Error setting user password:', error);
    return { error: 'Erreur lors de la mise à jour du mot de passe.' };
  }
};
