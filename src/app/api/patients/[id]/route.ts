// src/app/api/patients/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patient = await db.patient.findUnique({ where: { id } });
    if (!patient) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(patient);
  } catch (error) {
    console.error("GET /api/patients/[id] error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const data: any = {};
    if (body.firstName !== undefined) data.firstName = body.firstName;
    if (body.lastName !== undefined) data.lastName = body.lastName;
    if (body.birthDate !== undefined) data.birthDate = new Date(body.birthDate);
    if (body.gender !== undefined) data.gender = body.gender;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.email !== undefined) data.email = body.email;
    if (body.address !== undefined) data.address = body.address;
    if (body.notes !== undefined) data.notes = body.notes;

    const updated = await db.patient.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/patients/[id] error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.patient.delete({ where: { id } });
    return NextResponse.json({ id, deleted: true });
  } catch (error) {
    console.error("DELETE /api/patients/[id] error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
