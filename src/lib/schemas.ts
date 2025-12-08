import { z } from 'zod';

// ============= AUTH SCHEMAS =============

export const RegisterSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  clinicName: z.string().min(3, 'Le nom de la clinique est requis'),
});

export const LoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export const InviteUserSchema = z.object({
  email: z.string().email('Email invalide'),
  role: z.enum(['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'], {
    errorMap: () => ({ message: 'Rôle invalide' }),
  }),
  name: z.string().min(3, 'Le nom est requis'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export const SetPasswordSchema = z.object({
  token: z.string().min(10, 'Token invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

// ============= CLINIC SCHEMAS =============

export const ClinicSchema = z.object({
  name: z.string().min(3, 'Le nom de la clinique est requis'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  timezone: z.string().default('UTC'),
});

export const UpdateClinicSchema = ClinicSchema.partial();

// ============= PATIENT SCHEMAS =============

export const RegisterClinicSchema = z.object({
  clinicName: z.string().min(2, {
    message: 'Le nom de la clinique doit contenir au moins 2 caractères',
  }),
  address: z.string().optional(),
  adminName: z.string().min(2, {
    message: 'Le nom de l\'administrateur doit contenir au moins 2 caractères',
  }),
  email: z.email({
    message: "L'email est requis",
  }),
  password: z.string().min(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  }),
});

export const PatientSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide').optional(),
  phone: z.string().optional(),
  dateOfBirth: z.date().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: z.string().optional(),
  medicalHistory: z.string().optional(),
});

export const UpdatePatientSchema = PatientSchema.partial();

// ============= SERVICE SCHEMAS =============

export const ServiceSchema = z.object({
  name: z.string().min(3, 'Le nom du service est requis'),
  description: z.string().optional(),
  durationMinutes: z.number().int().min(5, 'La durée doit être d\'au moins 5 minutes'),
  price: z.number().positive('Le prix doit être positif'),
  isActive: z.boolean().default(true),
});

export const UpdateServiceSchema = ServiceSchema.partial();

// ============= APPOINTMENT SCHEMAS =============

export const AppointmentSchema = z.object({
  patientId: z.string().min(1, 'Veuillez sélectionner un patient'),
  doctorId: z.string().min(1, 'Veuillez sélectionner un médecin'),
  serviceId: z.string().min(1, 'Veuillez sélectionner un service'),
  startAt: z.date(),
  endAt: z.date(),
  notes: z.string().optional(),
});

export const UpdateAppointmentSchema = AppointmentSchema.partial().extend({
  status: z.enum(['BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
});

export const BookAppointmentSchema = z.object({
  serviceId: z.string().min(1, 'Service requis'),
  startAt: z.date(),
  patientEmail: z.string().email('Email invalide'),
  patientName: z.string().min(2, 'Nom requis'),
});

// ============= CONSULTATION SCHEMAS =============

export const ConsultationSchema = z.object({
  appointmentId: z.string().min(1, 'Rendez-vous requis'),
  patientId: z.string().min(1, 'Patient requis'),
  notes: z.string().optional(),
  diagnosis: z.string().optional(),
});

export const UpdateConsultationSchema = ConsultationSchema.partial();

// ============= PRESCRIPTION SCHEMAS =============

export const PrescriptionItemSchema = z.object({
  name: z.string().min(1, 'Nom du médicament requis'),
  dosage: z.string().min(1, 'Dosage requis'),
  duration: z.string().min(1, 'Durée requise'),
  instructions: z.string().optional(),
});

export const PrescriptionSchema = z.object({
  consultationId: z.string().min(1, 'Consultation requise'),
  items: z.array(PrescriptionItemSchema).min(1, 'Au moins un médicament requis'),
});

// ============= INVOICE SCHEMAS =============

export const InvoiceItemSchema = z.object({
  description: z.string().min(1, 'Description requise'),
  quantity: z.number().int().positive('Quantité invalide'),
  unitPrice: z.number().positive('Prix unitaire invalide'),
});

export const InvoiceSchema = z.object({
  patientId: z.string().min(1, 'Patient requis'),
  appointmentId: z.string().optional(),
  items: z.array(InvoiceItemSchema).min(1, 'Au moins un article requis'),
  dueDate: z.date().optional(),
});

export const UpdateInvoiceSchema = InvoiceSchema.partial().extend({
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
});

// ============= PAYMENT SCHEMAS =============

export const PaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Facture requise'),
  amount: z.number().positive('Montant invalide'),
  method: z.enum(['STRIPE', 'MANUAL', 'BANK_TRANSFER']).default('STRIPE'),
});

export const StripeCheckoutSchema = z.object({
  invoiceId: z.string().min(1, 'Facture requise'),
  successUrl: z.string().url('URL de succès invalide'),
  cancelUrl: z.string().url('URL d\'annulation invalide'),
});

export const StripeWebhookSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.any(),
  }),
});

// ============= AUDIT LOG SCHEMAS =============

export const AuditLogSchema = z.object({
  action: z.string().min(1, 'Action requise'),
  resourceType: z.string().min(1, 'Type de ressource requis'),
  resourceId: z.string().min(1, 'ID ressource requis'),
  changes: z.record(z.any()).optional(),
});

// ============= QUERY FILTERS =============

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const AppointmentFilterSchema = PaginationSchema.extend({
  doctorId: z.string().optional(),
  patientId: z.string().optional(),
  status: z.enum(['BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const PatientFilterSchema = PaginationSchema.extend({
  search: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
});

// ============= EXPORT ALL SCHEMAS =============

export const AllSchemas = {
  // Auth
  RegisterSchema,
  LoginSchema,
  InviteUserSchema,
  SetPasswordSchema,

  // Clinic
  ClinicSchema,
  UpdateClinicSchema,

  // Patient
  PatientSchema,
  UpdatePatientSchema,

  // Service
  ServiceSchema,
  UpdateServiceSchema,

  // Appointment
  AppointmentSchema,
  UpdateAppointmentSchema,
  BookAppointmentSchema,

  // Consultation
  ConsultationSchema,
  UpdateConsultationSchema,

  // Prescription
  PrescriptionSchema,
  PrescriptionItemSchema,

  // Invoice
  InvoiceSchema,
  UpdateInvoiceSchema,
  InvoiceItemSchema,

  // Payment
  PaymentSchema,
  StripeCheckoutSchema,
  StripeWebhookSchema,

  // Audit
  AuditLogSchema,

  // Filters
  PaginationSchema,
  AppointmentFilterSchema,
  PatientFilterSchema,
};

export type Register = z.infer<typeof RegisterSchema>;
export type Login = z.infer<typeof LoginSchema>;
export type InviteUser = z.infer<typeof InviteUserSchema>;
export type SetPassword = z.infer<typeof SetPasswordSchema>;
export type Clinic = z.infer<typeof ClinicSchema>;
export type Patient = z.infer<typeof PatientSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type Appointment = z.infer<typeof AppointmentSchema>;
export type Consultation = z.infer<typeof ConsultationSchema>;
export type Prescription = z.infer<typeof PrescriptionSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;
