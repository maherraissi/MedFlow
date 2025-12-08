
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({});

async function main() {
  console.log('🌱 Seed: Services Check...');

  // 1. Ensure Clinic Exists
  let clinic = await prisma.clinic.findFirst();

  if (!clinic) {
    console.log('📦 Creating Default Clinic...');
    clinic = await prisma.clinic.create({
      data: {
        name: 'Clinique MedFlow Demo',
        email: 'admin@medflow.com',
        phone: '+33 1 23 45 67 89',
        address: '123 Avenue de la Médecine',
      },
    });
    console.log('✅ Clinic Created');
  } else {
    console.log(`ℹ️ Using existing clinic: ${clinic.name}`);
  }

  // 2. Reset Services
  console.log('🧹 Clearing old services...');
  await prisma.service.deleteMany({ where: { clinicId: clinic.id } });

  // 3. Create Services
  console.log('✨ Creating new services list...');
  await prisma.service.createMany({
    data: [
      { clinicId: clinic.id, name: 'Consultation Générale', description: 'Consultation médicale standard', price: 30, durationMinutes: 20 },
      { clinicId: clinic.id, name: 'Cardiologie', description: 'Consultation spécialisée cœur', price: 80, durationMinutes: 45 },
      { clinicId: clinic.id, name: 'Dermatologie', description: 'Soins de la peau', price: 70, durationMinutes: 30 },
      { clinicId: clinic.id, name: 'Pédiatrie', description: 'Consultation pour enfants', price: 60, durationMinutes: 30 },
      { clinicId: clinic.id, name: 'Prise de Sang', description: 'Analyse en laboratoire', price: 25, durationMinutes: 15 },
      { clinicId: clinic.id, name: 'Echographie', description: 'Imagerie médicale ultrasons', price: 100, durationMinutes: 30 },
    ],
  });
  console.log('✅ Services seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Errors during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
