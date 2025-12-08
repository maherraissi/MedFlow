// src/lib/services/InvoiceService.ts
// Service métier pour gestion des factures

import { prisma } from '@/lib/prisma';
import { InvoiceSchema, UpdateInvoiceSchema } from '@/lib/schemas';
import { z } from 'zod';

export class InvoiceService {
  /**
   * Créer une facture
   */
  static async createInvoice(clinicId: string, data: z.infer<typeof InvoiceSchema>) {
    const validated = InvoiceSchema.parse(data);

    // Calculer le total
    const total = validated.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    return prisma.invoice.create({
      data: {
        clinicId,
        patientId: validated.patientId,
        appointmentId: validated.appointmentId,
        items: JSON.stringify(validated.items),
        total,
        status: 'DRAFT',
        dueDate: validated.dueDate,
      },
      include: { patient: true, payments: true },
    });
  }

  /**
   * Récupérer toutes les factures avec filtres
   */
  static async getInvoices(
    clinicId: string,
    options?: {
      page?: number;
      limit?: number;
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

    if (options?.patientId) where.patientId = options.patientId;
    if (options?.status) where.status = options.status;

    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options?.startDate) where.createdAt.gte = options.startDate;
      if (options?.endDate) where.createdAt.lte = options.endDate;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        include: { patient: true, payments: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.count({ where }),
    ]);

    return { invoices, total, page, limit };
  }

  /**
   * Récupérer une facture par ID
   */
  static async getInvoiceById(clinicId: string, invoiceId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, clinicId },
      include: {
        patient: true,
        appointment: {
          include: { service: true, doctor: true },
        },
        payments: true,
      },
    });

    if (invoice && typeof invoice.items === 'string') {
      return {
        ...invoice,
        items: JSON.parse(invoice.items),
      };
    }

    return invoice;
  }

  /**
   * Mettre à jour une facture
   */
  static async updateInvoice(clinicId: string, invoiceId: string, data: z.infer<typeof UpdateInvoiceSchema>) {
    const validated = UpdateInvoiceSchema.parse(data);

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, clinicId },
    });

    if (!invoice) throw new Error('Invoice not found');

    // Si les items changent, recalculer le total
    let total = invoice.total;
    let items = invoice.items;

    if (validated.items) {
      total = validated.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      items = JSON.stringify(validated.items);
    }

    return prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        items,
        total,
        status: validated.status,
        dueDate: validated.dueDate,
      },
      include: { patient: true, payments: true },
    });
  }

  /**
   * Envoyer une facture (changer statut à SENT)
   */
  static async sendInvoice(clinicId: string, invoiceId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, clinicId },
    });

    if (!invoice) throw new Error('Invoice not found');

    return prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'SENT' },
    });
  }

  /**
   * Marquer une facture comme payée
   */
  static async markAsPaid(clinicId: string, invoiceId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, clinicId },
    });

    if (!invoice) throw new Error('Invoice not found');

    return prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
      include: { payments: true },
    });
  }

  /**
   * Annuler une facture
   */
  static async cancelInvoice(clinicId: string, invoiceId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, clinicId },
    });

    if (!invoice) throw new Error('Invoice not found');

    return prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'CANCELLED' },
    });
  }

  /**
   * Obtenir les statistiques de facturation
   */
  static async getBillingStats(clinicId: string) {
    const [totalRevenue, paidInvoices, pendingInvoices, overdueInvoices] = await Promise.all([
      prisma.invoice.aggregate({
        where: { clinicId, status: 'PAID' },
        _sum: { total: true },
      }),
      prisma.invoice.count({ where: { clinicId, status: 'PAID' } }),
      prisma.invoice.count({ where: { clinicId, status: { in: ['DRAFT', 'SENT'] } } }),
      prisma.invoice.count({
        where: {
          clinicId,
          status: 'OVERDUE',
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    return {
      totalRevenue: totalRevenue._sum.total || 0,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
    };
  }
}
