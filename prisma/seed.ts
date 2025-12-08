import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({});

async function main() {
  console.log('🌱 Début du seed...');

  // Vérifier si une clinique existe déjà
  const existingClinic = await prisma.clinic.findFirst();

  if (!existingClinic) {
    console.log('📦 Création de la clinique par défaut...');
    await prisma.clinic.create({
      data: {
        name: 'Default Clinic',
        email: 'admin@medflow.com',
        address: '123 Rue de la Santé',
        phone: '+33 1 23 45 67 89',
      },
    });
    console.log('✅ Clinique créée avec succès');
  } else {
    console.log('ℹ️ Clinique existe déjà');
  }

  const clinic = await prisma.clinic.findFirst();

  if (!clinic) {
    throw new Error('Clinique introuvable après création.');
  }

  console.log('👤 Création des utilisateurs de démonstration...');
  const usersData = [
    { name: 'Admin Clinic', email: 'admin@clinic.com', password: 'Admin@123456', role: 'ADMIN' },
    { name: 'Dr. Samir Benali', email: 'samir@clinic.com', password: 'Doctor@123456', role: 'DOCTOR' },
    { name: 'Nadia Reception', email: 'nadia@clinic.com', password: 'Reception@123456', role: 'RECEPTIONIST' },
    { name: 'Youssef Patient', email: 'youssef@patient.com', password: 'Patient@123456', role: 'PATIENT' },
  ];

  for (const u of usersData) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      const hashed = await bcrypt.hash(u.password, 10);
      await prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          password: hashed,
          role: u.role as any,
          clinicId: clinic.id,
          isActive: true,
          status: 'ACTIVE',
        },
      });
      console.log(`✅ Utilisateur créé: ${u.email} (${u.role})`);
    } else {
      console.log(`ℹ️ Utilisateur existe déjà: ${u.email}`);
    }
  }

  console.log('🧩 Création de services de démonstration...');
  const svc = await prisma.service.findFirst({ where: { clinicId: clinic.id } });
  if (!svc) {
    await prisma.service.createMany({
      data: [
        { clinicId: clinic.id, name: 'Consultation Générale', description: 'Consultation standard', price: 50, durationMinutes: 30 },
        { clinicId: clinic.id, name: 'Radiologie', description: 'Examen radiologique', price: 120, durationMinutes: 45 },
      ],
    });
    console.log('✅ Services créés');
  } else {
    console.log('ℹ️ Services déjà présents');
  }

  console.log('🧑‍⚕️ Création d’un patient de démonstration...');
  const existingPatient = await prisma.patient.findFirst({ where: { clinicId: clinic.id, email: 'patient.demo@medflow.com' } });
  if (!existingPatient) {
    await prisma.patient.create({
      data: {
        clinicId: clinic.id,
        name: 'Patient Demo',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'OTHER',
        phone: '+33 6 00 00 00 00',
        email: 'patient.demo@medflow.com',
        address: '1 Rue Démo',
      },
    });
    console.log('✅ Patient de démo créé');
  } else {
    console.log('ℹ️ Patient de démo existe déjà');
  }

  console.log('✅ Seed terminé !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
