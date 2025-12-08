/**
 * src/app/api/patients/route.ts
 * API Endpoints pour CRUD Patients
 * Cahier des Charges: US-2.1 Gestion Patients
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PatientSchema, PatientFilterSchema } from '@/lib/schemas';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/patients - Créer un nouveau patient
 * Permissions: [ADMIN, RECEPTIONIST]
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = session.user as any;
    const clinicId = user.clinicId;

    // Permission check
    if (!['ADMIN', 'RECEPTIONIST'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse & validate request
    const body = await req.json();
    const validated = PatientSchema.parse(body);

    // Vérifier email unique
    if (validated.email) {
      const existing = await prisma.patient.findFirst({
        where: {
          clinicId,
          email: validated.email,
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
    }

    // Create patient
    const patient = await prisma.patient.create({
      data: {
        clinicId,
        ...validated,
      },
    });

    // AuditLog
    await prisma.auditLog.create({
      data: {
        clinicId,
        userId: user.id,
        action: 'PATIENT_CREATED',
        resourceType: 'Patient',
        resourceId: patient.id,
        changes: JSON.stringify(validated),
      },
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/patients error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/patients - Lister les patients
 * Permissions: [ADMIN, DOCTOR, RECEPTIONIST]
 */
export async function GET(req: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = session.user as any;
    const clinicId = user.clinicId;

    // Permission check
    if (!['ADMIN', 'DOCTOR', 'RECEPTIONIST'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || undefined;
    const gender = searchParams.get('gender') || undefined;

    // Validate pagination
    const validated = PatientFilterSchema.parse({
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit)),
      search,
      gender,
    });

    const where: any = { clinicId };

    // Search
    if (validated.search) {
      where.OR = [
        { name: { contains: validated.search, mode: 'insensitive' } },
        { email: { contains: validated.search, mode: 'insensitive' } },
      ];
    }

    // Filter gender
    if (validated.gender) {
      where.gender = validated.gender;
    }

    // List patients
    const skip = (validated.page - 1) * validated.limit;
    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: validated.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.patient.count({ where }),
    ]);

    return NextResponse.json({
      patients,
      total,
      page: validated.page,
      limit: validated.limit,
      pages: Math.ceil(total / validated.limit),
    }, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/patients error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}