import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({ consultations: [] });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ id: '1', created: true }, { status: 201 });
}